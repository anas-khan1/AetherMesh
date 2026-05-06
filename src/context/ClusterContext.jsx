import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiKeys,
  clusterConfig,
  faultLogEntries,
  faultTimeline,
  fileSystemTree,
  nodeList,
  recentActivity,
  recentFileActivity,
  settingsNotifications,
  throughputHistory,
  throughputTimeSeries,
} from '../data/mockData';

const ClusterContext = createContext(null);

const REGION_ORDER = ['US-EAST-1', 'US-WEST-2', 'EU-WEST-1', 'EU-CENTRAL-1', 'AP-SOUTH-1', 'AP-NORTH-1'];
const SEVERITIES = ['WARNING', 'ERROR', 'CRITICAL'];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toTimestamp() {
  const dt = new Date();
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  const ss = String(dt.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseSizeToGB(sizeText) {
  if (!sizeText || typeof sizeText !== 'string') return 0;
  const match = sizeText.trim().match(/([0-9.]+)\s*(KB|MB|GB|TB|PB)/i);
  if (!match) return 0;
  const size = Number(match[1]);
  const unit = match[2].toUpperCase();
  const factor = {
    KB: 1 / (1024 * 1024),
    MB: 1 / 1024,
    GB: 1,
    TB: 1024,
    PB: 1024 * 1024,
  }[unit];
  return size * factor;
}

function formatSize(sizeMB) {
  if (sizeMB >= 1024) {
    return `${(sizeMB / 1024).toFixed(1)} GB`;
  }
  return `${sizeMB.toFixed(0)} MB`;
}

function flattenFiles(tree) {
  const files = [];

  function walk(node, parentPath) {
    const currentPath = node.name === '/' ? '' : `${parentPath}/${node.name}`;
    if (node.type === 'file') {
      files.push({ ...node, path: currentPath || `/${node.name}` });
      return;
    }

    if (Array.isArray(node.children)) {
      node.children.forEach((child) => walk(child, currentPath));
    }
  }

  tree.forEach((n) => walk(n, ''));
  return files;
}

function addFileToUploadsFolder(tree, file) {
  const nextTree = deepClone(tree);
  const root = nextTree[0];
  if (!root || root.type !== 'folder') return nextTree;

  let uploadsFolder = root.children.find((child) => child.type === 'folder' && child.name === 'uploads');
  if (!uploadsFolder) {
    uploadsFolder = { name: 'uploads', type: 'folder', children: [] };
    root.children.push(uploadsFolder);
  }

  uploadsFolder.children.unshift(file);
  return nextTree;
}

function updateFileInTree(tree, fileName, updateFn) {
  const nextTree = deepClone(tree);

  function walk(nodes) {
    for (const node of nodes) {
      if (node.type === 'file' && node.name === fileName) {
        updateFn(node);
        return true;
      }
      if (node.type === 'folder' && Array.isArray(node.children) && walk(node.children)) {
        return true;
      }
    }
    return false;
  }

  walk(nextTree);
  return nextTree;
}

function buildShardPlacement(file, allNodes, parityCount = 2) {
  const healthyNodes = allNodes.filter((n) => n.status !== 'fault');
  const available = healthyNodes.length > 0 ? healthyNodes : allNodes;
  const dataShards = Math.max(1, Number(file.shards) || 1);
  const replicaCount = Math.max(1, Number(file.replicas) || 3);
  const totalShards = dataShards + parityCount;

  const shards = Array.from({ length: totalShards }, (_, shardIndex) => {
    const replicas = Array.from({ length: replicaCount }, (_, replicaIndex) => {
      const node = available[(shardIndex * 3 + replicaIndex) % Math.max(available.length, 1)];
      return {
        nodeId: node?.id || 'UNASSIGNED',
        region: node?.region || 'UNKNOWN',
        status: 'healthy',
      };
    });

    return {
      shardId: `S${String(shardIndex + 1).padStart(2, '0')}`,
      kind: shardIndex < dataShards ? 'data' : 'parity',
      replicas,
    };
  });

  return {
    fileName: file.name,
    dataShards,
    parityShards: parityCount,
    replicaCount,
    shards,
  };
}

function markFaultInPlacements(currentPlacements, failedNodeId) {
  const next = deepClone(currentPlacements);
  Object.values(next).forEach((placement) => {
    placement.shards.forEach((shard) => {
      shard.replicas.forEach((replica) => {
        if (replica.nodeId === failedNodeId) {
          replica.status = 'degraded';
        }
      });
    });
  });
  return next;
}

function healDegradedShards(currentPlacements, allNodes, targetFileName = null) {
  const healthyNodes = allNodes.filter((n) => n.status === 'healthy');
  if (healthyNodes.length === 0) {
    return { placements: currentPlacements, events: [] };
  }

  const next = deepClone(currentPlacements);
  const events = [];

  Object.values(next).forEach((placement) => {
    if (targetFileName && placement.fileName !== targetFileName) {
      return;
    }
    placement.shards.forEach((shard) => {
      const degradedReplicas = shard.replicas.filter((r) => r.status === 'degraded');
      degradedReplicas.forEach((replica) => {
        const usedNodeIds = new Set(shard.replicas.map((r) => r.nodeId));
        const target = healthyNodes.find((n) => !usedNodeIds.has(n.id));
        if (!target) return;

        replica.nodeId = target.id;
        replica.region = target.region;
        replica.status = 'healthy';
        events.push({
          fileName: placement.fileName,
          shardId: shard.shardId,
          nodeId: target.id,
        });
      });
    });
  });

  return { placements: next, events };
}

function toFaultEvent({ nodeId, severity, message, recovery, region, resolved = false }) {
  return {
    id: `FLT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: toTimestamp(),
    severity,
    message,
    recovery,
    region,
    resolved,
    nodeId,
    recoveryProgress: resolved ? 100 : Math.floor(Math.random() * 25),
  };
}

function toRecoveryEntries(logs) {
  return logs
    .filter((log) => !log.resolved && (log.severity === 'CRITICAL' || log.severity === 'ERROR'))
    .slice(0, 4)
    .map((log) => ({
      id: log.id,
      nodeId: log.nodeId || 'UNKNOWN',
      issue: log.message,
      progress: log.recoveryProgress || 0,
      eta: log.recoveryProgress > 80 ? '~1 min' : log.recoveryProgress > 50 ? '~3 min' : '~6 min',
    }));
}

function loadPersisted(key, fallbackValue) {
  if (typeof window === 'undefined') return fallbackValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function persistValue(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // No-op: persistence failure should not break the simulation.
  }
}

export function ClusterProvider({ children }) {
  const [nodes, setNodes] = useState(() => deepClone(nodeList));
  const [fileTree, setFileTree] = useState(() => deepClone(fileSystemTree));
  const [fileActivity, setFileActivity] = useState(() => deepClone(recentFileActivity));
  const [faultLogs, setFaultLogs] = useState(() => deepClone(faultLogEntries));
  const [dashboardActivity, setDashboardActivity] = useState(() => deepClone(recentActivity));
  const [trafficSeries, setTrafficSeries] = useState(() => deepClone(throughputTimeSeries));
  const [throughputSeries, setThroughputSeries] = useState(() => deepClone(throughputHistory));
  const [config, setConfig] = useState(() => loadPersisted('aether.config', deepClone(clusterConfig)));
  const [notificationPrefs, setNotificationPrefs] = useState(() => loadPersisted('aether.notifications', deepClone(settingsNotifications)));
  const [keys, setKeys] = useState(() => loadPersisted('aether.keys', deepClone(apiKeys)));
  const [activeTransfers, setActiveTransfers] = useState([]);
  const [simulationFeed, setSimulationFeed] = useState([]);
  const [shardPlacements, setShardPlacements] = useState(() => {
    const initialFiles = flattenFiles(fileSystemTree);
    const initial = {};
    initialFiles.forEach((file) => {
      initial[file.name] = buildShardPlacement(file, nodeList, Number(clusterConfig.shardParity) || 2);
    });
    return initial;
  });
  const nodesRef = useRef(nodes);
  const activeTransfersRef = useRef(activeTransfers);
  const shardPlacementsRef = useRef(shardPlacements);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    activeTransfersRef.current = activeTransfers;
  }, [activeTransfers]);

  useEffect(() => {
    shardPlacementsRef.current = shardPlacements;
  }, [shardPlacements]);

  useEffect(() => {
    persistValue('aether.config', config);
  }, [config]);

  useEffect(() => {
    persistValue('aether.notifications', notificationPrefs);
  }, [notificationPrefs]);

  useEffect(() => {
    persistValue('aether.keys', keys);
  }, [keys]);

  const files = useMemo(() => flattenFiles(fileTree), [fileTree]);

  const storageByRegion = useMemo(() => {
    const usedByRegion = REGION_ORDER.reduce((acc, region) => ({ ...acc, [region]: 0 }), {});

    files.forEach((file, idx) => {
      const shardCount = Math.max(1, Number(file.shards) || 1);
      const fileSizeGB = parseSizeToGB(file.size);
      const perShard = fileSizeGB / shardCount;
      for (let i = 0; i < shardCount; i += 1) {
        const region = REGION_ORDER[(idx + i) % REGION_ORDER.length];
        usedByRegion[region] += perShard;
      }
    });

    return REGION_ORDER.map((region) => {
      const total = region.startsWith('US') ? 5 : 3;
      return {
        region,
        used: Number(usedByRegion[region].toFixed(2)),
        total,
      };
    });
  }, [files]);

  const systemMetrics = useMemo(() => {
    const totalNodes = nodes.length;
    const activeNodes = nodes.filter((n) => n.status !== 'fault').length;
    const totalThroughputMB = nodes
      .filter((n) => n.status !== 'fault')
      .reduce((sum, n) => sum + n.throughput, 0);
    const avgLatency = nodes.reduce((sum, n) => sum + (n.status === 'fault' ? 40 : n.status === 'checking' ? 25 : 12), 0) / totalNodes;
    const healthyRatio = totalNodes === 0 ? 0 : activeNodes / totalNodes;
    const resilience = clamp(96.5 + healthyRatio * 3.2, 90, 99.99);
    const activeShards = files.reduce((sum, f) => sum + (Number(f.shards) || 0), 0);
    const usedGB = files.reduce((sum, f) => sum + parseSizeToGB(f.size), 0);

    return {
      totalThroughput: Number((totalThroughputMB / 1000).toFixed(2)),
      activeNodes,
      totalNodes,
      meshLatency: Number(avgLatency.toFixed(1)),
      dataResilience: Number(resilience.toFixed(2)),
      activeShards,
      connectedNodes: activeNodes * 11,
      globalThroughput: Number((totalThroughputMB / 1000).toFixed(1)),
      uptime: '1.1YR',
      totalStorage: '18.4 PB',
      usedStorage: `${(usedGB / (1024 * 1024)).toFixed(2)} PB`,
      filesStored: files.length,
      regionsActive: REGION_ORDER.length,
    };
  }, [files, nodes]);

  const faultStats = useMemo(() => {
    const unresolved = faultLogs.filter((f) => !f.resolved);
    const critical = unresolved.filter((f) => f.severity === 'CRITICAL').length;
    const resolvedToday = faultLogs.filter((f) => f.resolved).length;
    return {
      mttr: '2m 34s',
      mtbf: '14.2 days',
      faultRate: `${((unresolved.length / Math.max(nodes.length, 1)) * 0.12).toFixed(3)}%`,
      autoRecoveryRate: `${config.autoHealingEnabled ? '95.1' : '78.4'}%`,
      activeIncidents: unresolved.length,
      resolvedToday,
      criticalAlerts: critical,
      shardRelocations: unresolved.length * 3 + resolvedToday,
    };
  }, [config.autoHealingEnabled, faultLogs, nodes.length]);

  const faultTimelineData = useMemo(() => {
    if (faultLogs.length < 8) return deepClone(faultTimeline);

    const buckets = Array.from({ length: 12 }, (_, i) => ({
      hour: `${String(i * 2).padStart(2, '0')}:00`,
      critical: 0,
      error: 0,
      warning: 0,
    }));

    faultLogs.slice(0, 80).forEach((entry) => {
      const h = Number(entry.timestamp.slice(11, 13));
      const index = Math.floor(h / 2);
      if (!Number.isFinite(index) || !buckets[index]) return;
      if (entry.severity === 'CRITICAL') buckets[index].critical += 1;
      if (entry.severity === 'ERROR') buckets[index].error += 1;
      if (entry.severity === 'WARNING') buckets[index].warning += 1;
    });

    return buckets;
  }, [faultLogs]);

  const recoveries = useMemo(() => toRecoveryEntries(faultLogs), [faultLogs]);

  function injectFault(nodeId) {
    const randomHealthyId = randomItem(nodesRef.current.filter((n) => n.status === 'healthy'))?.id;
    const targetId = nodeId || randomHealthyId;
    let faultNode = null;
    setNodes((prev) => prev.map((node) => {
      const shouldTarget = targetId ? node.id === targetId : false;
      if (!faultNode && shouldTarget) {
        faultNode = node;
        return {
          ...node,
          status: 'fault',
          cpu: clamp(node.cpu + 35, 0, 99),
          errorRate: Number((node.errorRate + 2.5).toFixed(2)),
        };
      }
      return node;
    }));

    if (!faultNode) return;

    const severity = randomItem(SEVERITIES);
    const entry = toFaultEvent({
      nodeId: faultNode.id,
      severity,
      message: `${faultNode.id} in ${faultNode.region} stopped acknowledging heartbeat packets`,
      recovery: 'Auto-healing initiated: recovery in ~6s',
      region: faultNode.region,
      resolved: false,
    });

    setFaultLogs((prev) => [entry, ...prev].slice(0, 120));
    setDashboardActivity((prev) => [
      { type: 'fault', msg: `Fault injected on ${faultNode.id}`, time: 'just now', icon: 'alert' },
      ...prev,
    ].slice(0, 10));
    const currentPlacements = shardPlacementsRef.current;
    const marked = markFaultInPlacements(currentPlacements, faultNode.id);
    setShardPlacements(marked);

    // Find affected files and log ONE consolidated entry
    const affectedFiles = [];
    Object.values(marked).forEach((placement) => {
      const hasDegraded = placement.shards.some((s) => s.replicas.some((r) => r.nodeId === faultNode.id && r.status === 'degraded'));
      if (hasDegraded) affectedFiles.push(placement.fileName);
    });

    const label = affectedFiles.length > 0
      ? `/uploads/${affectedFiles[0]}`
      : '/cluster/shards';
    const detail = affectedFiles.length > 1 ? `${affectedFiles.length} files affected` : undefined;

    setFileActivity((prev) => [
      { action: 'FAULT', file: label, node: faultNode.id, time: 'just now', status: 'pending', detail },
      ...prev,
    ].slice(0, 20));
    setSimulationFeed((prev) => [
      {
        id: `SIM-${Date.now()}`,
        level: 'FAULT',
        message: `Node failure on ${faultNode.id}: affected shard replicas marked degraded — auto-recovery in 6s`,
        time: nowLabel(),
      },
      ...prev,
    ].slice(0, 30));

    // AUTO-RECOVERY: automatically heal after 6 seconds (demonstrates fault tolerance)
    const failedId = faultNode.id;
    setTimeout(() => {
      // Check if node is still in fault state (user might have manually recovered it)
      const stillFaulty = nodesRef.current.find((n) => n.id === failedId && n.status === 'fault');
      if (!stillFaulty) return;

      setSimulationFeed((prev) => [
        {
          id: `SIM-${Date.now()}-auto-heal-start`,
          level: 'RECOVERY',
          message: `Auto-healing triggered for ${failedId}: redistributing degraded shards`,
          time: nowLabel(),
        },
        ...prev,
      ].slice(0, 30));

      // runFaultTolerance will automatically transition faulty nodes to "checking" and then "healthy"
      runFaultTolerance();

      setTimeout(() => {
        setDashboardActivity((prev) => [
          { type: 'recover', msg: `Auto-healed: ${failedId} restored`, time: 'just now', icon: 'check' },
          ...prev,
        ].slice(0, 10));
      }, 1200);
    }, 6000);
  }

  function recoverNode(nodeId) {
    setNodes((prev) => prev.map((node) => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        status: 'healthy',
        cpu: clamp(node.cpu - 30, 8, 70),
        errorRate: Number(Math.max(0.01, node.errorRate - 2).toFixed(2)),
      };
    }));

    setFaultLogs((prev) => prev.map((entry) => {
      if (entry.nodeId !== nodeId || entry.resolved) return entry;
      return { ...entry, resolved: true, recoveryProgress: 100 };
    }));

    setFaultLogs((prev) => [
      toFaultEvent({
        nodeId,
        severity: 'INFO',
        message: `${nodeId} rejoined quorum and resumed replica service`,
        recovery: null,
        region: randomItem(REGION_ORDER),
        resolved: true,
      }),
      ...prev,
    ].slice(0, 120));

    setDashboardActivity((prev) => [
      { type: 'recover', msg: `Recovery completed for ${nodeId}`, time: 'just now', icon: 'check' },
      ...prev,
    ].slice(0, 10));

    // Find actual files affected by this node and log ONE recovery entry
    const affectedFiles = [];
    Object.values(shardPlacementsRef.current).forEach((placement) => {
      const hasDegraded = placement.shards.some((s) => s.replicas.some((r) => r.nodeId === nodeId && r.status === 'degraded'));
      if (hasDegraded) affectedFiles.push(placement.fileName);
    });

    const label = affectedFiles.length > 0
      ? `/uploads/${affectedFiles[0]}`
      : '/cluster/shards';
    const detail = affectedFiles.length > 1 ? `${affectedFiles.length} files recovered` : undefined;

    setFileActivity((prev) => [
      { action: 'RECOVER', file: label, node: nodeId, time: 'just now', status: 'success', detail },
      ...prev,
    ].slice(0, 20));

    setSimulationFeed((prev) => [
      {
        id: `SIM-${Date.now()}`,
        level: 'RECOVERY',
        message: `${nodeId} restored and participating in quorum again`,
        time: nowLabel(),
      },
      ...prev,
    ].slice(0, 30));
  }

  function requestDiagnostic(nodeId) {
    setDashboardActivity((prev) => [
      { type: 'diagnostic', msg: `Diagnostic log requested for ${nodeId}`, time: 'just now', icon: 'download' },
      ...prev,
    ].slice(0, 10));
  }

  function uploadFile(fileName, sizeMB) {
    if (!fileName || !fileName.trim()) return;

    const safeName = fileName.trim();
    const numericSize = Number(sizeMB);
    const normalizedSize = Number.isFinite(numericSize) ? clamp(numericSize, 8, 10240) : 256;
    const shardSizeMB = Number(String(config.maxShardSize).replace(/[^0-9.]/g, '')) || 64;
    const shards = Math.max(1, Math.ceil(normalizedSize / shardSizeMB));
    const replicas = clamp(Number(config.replicationFactor) || 3, 2, 6);

    const newFile = {
      name: safeName,
      type: 'file',
      size: formatSize(normalizedSize),
      shards,
      replicas,
      checksum: `sha512:${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      modified: toTimestamp(),
      status: 'syncing',
    };

    setFileTree((prev) => addFileToUploadsFolder(prev, newFile));
    setShardPlacements((prev) => ({
      ...prev,
      [safeName]: buildShardPlacement(newFile, nodesRef.current, Number(config.shardParity) || 2),
    }));
    setActiveTransfers((prev) => [
      { id: `UP-${Date.now()}`, fileName: safeName, progress: 0, shards, uploadedShards: 0, speed: '132 MB/s' },
      ...prev,
    ].slice(0, 8));
    setFileActivity((prev) => [
      { action: 'WRITE', file: `/uploads/${safeName}`, node: randomItem(nodesRef.current).id, time: 'just now', status: 'pending' },
      ...prev,
    ].slice(0, 20));
    setSimulationFeed((prev) => [
      {
        id: `SIM-${Date.now()}`,
        level: 'UPLOAD',
        message: `${safeName} split into ${shards} data shards + ${(Number(config.shardParity) || 2)} parity shards`,
        time: nowLabel(),
      },
      ...prev,
    ].slice(0, 30));
  }

  function updateConfig(partialConfig) {
    setConfig((prev) => ({ ...prev, ...partialConfig }));
  }

  function resetConfig() {
    setConfig(deepClone(clusterConfig));
  }

  function toggleNotification(key, value) {
    setNotificationPrefs((prev) => prev.map((n) => (n.key === key ? { ...n, enabled: value } : n)));
  }

  function generateApiKey() {
    const suffix = Math.random().toString(16).slice(2, 6);
    const newKey = {
      name: `Project Key ${keys.length + 1}`,
      key: `am_college_****...${suffix}`,
      created: new Date().toISOString().slice(0, 10),
      lastUsed: 'never',
      status: 'active',
    };
    setKeys((prev) => [newKey, ...prev]);
  }

  function deleteKey(keyName) {
    setKeys((prev) => prev.filter((k) => k.name !== keyName));
  }

  function revokeKey(keyName) {
    setKeys((prev) => prev.map((k) => (k.name === keyName ? { ...k, status: 'revoked' } : k)));
  }

  function runFaultTolerance(targetFileName = null) {
    let healedEvents = [];

    setSimulationFeed((prev) => [
      {
        id: `SIM-${Date.now()}-repair-start`,
        level: 'RECOVERY',
        message: targetFileName
          ? `Manual repair started for ${targetFileName}`
          : 'Manual repair started for degraded replicas and faulty nodes',
        time: nowLabel(),
      },
      ...prev,
    ].slice(0, 30));

    const healing = healDegradedShards(shardPlacementsRef.current, nodesRef.current, targetFileName);
    healedEvents = healing.events;
    setShardPlacements(healing.placements);

    if (healedEvents.length > 0) {
      const byFile = new Set();
      healedEvents.forEach((event) => {
        byFile.add(event.fileName);
      });

      // Mark all healed files as synced
      byFile.forEach((fileName) => {
        setFileTree((prevTree) => updateFileInTree(prevTree, fileName, (file) => {
          file.status = 'synced';
          file.modified = toTimestamp();
        }));
      });

      // Log ONE REPLICATE + ONE RECOVER entry (not one per file)
      const fileArr = [...byFile];
      const recoverLabel = `/uploads/${fileArr[0]}`;
      const detail = fileArr.length > 1 ? `${fileArr.length} files healed` : undefined;

      setFileActivity((prevAct) => [
        { action: 'RECOVER', file: recoverLabel, node: 'AUTO-HEAL', time: 'just now', status: 'success', detail },
        { action: 'REPLICATE', file: `${healedEvents.length} shard(s) redistributed`, node: 'AUTO-HEAL', time: 'just now', status: 'success' },
        ...prevAct,
      ].slice(0, 20));

      setSimulationFeed((prev) => [
        {
          id: `SIM-${Date.now()}-repair-done`,
          level: 'HEAL',
          message: `Fault tolerance completed: ${healedEvents.length} replicas repaired across ${byFile.size} file(s)`,
          time: nowLabel(),
        },
        ...prev,
      ].slice(0, 30));
    }

    const faultyIds = nodesRef.current.filter((n) => n.status === 'fault').map((n) => n.id);
    if (faultyIds.length > 0) {
      setNodes((prevNodes) => prevNodes.map((node) => (
        faultyIds.includes(node.id)
          ? { ...node, status: 'checking' }
          : node
      )));

      setTimeout(() => {
        setNodes((prevNodes) => prevNodes.map((node) => {
          if (!faultyIds.includes(node.id)) return node;
          return {
            ...node,
            status: 'healthy',
            cpu: clamp(node.cpu - 20, 8, 72),
            errorRate: clamp(node.errorRate - 1.5, 0.01, 2),
          };
        }));
        setSimulationFeed((prev) => [
          {
            id: `SIM-${Date.now()}-nodes-restored`,
            level: 'RECOVERY',
            message: `Nodes restored: ${faultyIds.map((id) => id.replace('AE-NODE-', '')).join(', ')}`,
            time: nowLabel(),
          },
          ...prev,
        ].slice(0, 30));
      }, 1200);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setNodes((prev) => prev.map((node) => {
        const noisyCpu = clamp(node.cpu + (Math.random() * 8 - 4), 4, 98);
        const memUsed = clamp(node.memory.used + (Math.random() * 2 - 1), 2, node.memory.total - 1);

        if (node.status === 'fault') {
          return {
            ...node,
            cpu: clamp(noisyCpu + 8, 70, 99),
            memory: { ...node.memory, used: clamp(memUsed + 3, 12, node.memory.total) },
            throughput: clamp(node.throughput - 40, 80, 380),
            errorRate: clamp(node.errorRate + Math.random() * 0.2, 2, 15),
          };
        }

        if (node.status === 'checking' || node.status === 'loading') {
          return {
            ...node,
            cpu: clamp(noisyCpu, 20, 85),
            memory: { ...node.memory, used: clamp(memUsed, 10, node.memory.total) },
            throughput: clamp(node.throughput + (Math.random() * 50 - 10), 280, 1000),
            errorRate: clamp(node.errorRate + (Math.random() * 0.08 - 0.04), 0.05, 1.5),
          };
        }

        return {
          ...node,
          cpu: clamp(noisyCpu, 8, 65),
          memory: { ...node.memory, used: clamp(memUsed, 4, node.memory.total - 2) },
          throughput: clamp(node.throughput + (Math.random() * 80 - 40), 420, 1250),
          errorRate: clamp(node.errorRate + (Math.random() * 0.03 - 0.015), 0.01, 0.3),
        };
      }));

      setTrafficSeries((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1] || { read: 600, write: 420 };
        next.push({
          hour: nowLabel(),
          read: Math.round(clamp(last.read + (Math.random() * 160 - 80), 220, 980)),
          write: Math.round(clamp(last.write + (Math.random() * 140 - 70), 140, 760)),
        });
        return next;
      });

      setThroughputSeries((prev) => {
        const next = [...prev.slice(1)];
        const current = nodesRef.current.filter((n) => n.status !== 'fault').reduce((sum, n) => sum + n.throughput, 0) / 1000;
        next.push({ time: nowLabel(), value: Number(current.toFixed(2)) });
        return next;
      });

      setFaultLogs((prev) => prev.map((entry) => {
        if (entry.resolved) return entry;
        const nextProgress = clamp((entry.recoveryProgress || 0) + (config.autoHealingEnabled ? Math.random() * 18 : Math.random() * 4), 0, 100);
        return {
          ...entry,
          recoveryProgress: Math.floor(nextProgress),
          resolved: config.autoHealingEnabled && nextProgress >= 98,
        };
      }));

      const currentTransfers = activeTransfersRef.current;
      const nextTransfers = currentTransfers.map((transfer) => {
        const increment = Math.floor(Math.random() * 22 + 10);
        const progress = clamp(transfer.progress + increment, 0, 100);
        const uploadedShards = Math.floor((progress / 100) * transfer.shards);
        return {
          ...transfer,
          progress,
          uploadedShards,
          speed: progress >= 100 ? 'Complete' : `${Math.floor(Math.random() * 140 + 80)} MB/s`,
        };
      });

      const completed = nextTransfers.filter((t) => t.progress >= 100);
      if (completed.length > 0) {
        completed.forEach((transfer) => {
          setFileTree((prevTree) => updateFileInTree(prevTree, transfer.fileName, (file) => {
            file.status = 'synced';
            file.modified = toTimestamp();
          }));
          setFileActivity((prevAct) => [
            {
              action: 'SYNC',
              file: `/uploads/${transfer.fileName}`,
              node: randomItem(nodesRef.current).id,
              time: 'just now',
              status: 'success',
            },
            ...prevAct,
          ].slice(0, 20));
          setSimulationFeed((prevFeed) => [
            {
              id: `SIM-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
              level: 'SYNC',
              message: `${transfer.fileName} fully replicated and marked synced`,
              time: nowLabel(),
            },
            ...prevFeed,
          ].slice(0, 30));
        });
      }

      setActiveTransfers(nextTransfers.filter((transfer) => transfer.progress < 100));

      // Random fault: only 2% chance AND only if no node is already in fault/checking (prevents cascading duplicates)
      const hasPendingFault = nodesRef.current.some((n) => n.status === 'fault' || n.status === 'checking');
      if (!hasPendingFault && Math.random() < 0.02) {
        const randomHealthy = nodesRef.current.find((n) => n.status === 'healthy');
        if (randomHealthy) injectFault(randomHealthy.id);
      }
    }, 2600);

    return () => clearInterval(timer);
  }, [config.autoHealingEnabled]);

  const value = {
    nodes,
    files,
    fileTree,
    fileActivity,
    faultLogs,
    trafficSeries,
    throughputSeries,
    config,
    notificationPrefs,
    keys,
    activeTransfers,
    shardPlacements,
    simulationFeed,
    dashboardActivity,
    systemMetrics,
    storageByRegion,
    faultStats,
    faultTimelineData,
    recoveries,
    injectFault,
    recoverNode,
    runFaultTolerance,
    requestDiagnostic,
    uploadFile,
    updateConfig,
    resetConfig,
    toggleNotification,
    generateApiKey,
    deleteKey,
    revokeKey,
  };

  return <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>;
}

export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) {
    throw new Error('useCluster must be used inside ClusterProvider');
  }
  return ctx;
}
