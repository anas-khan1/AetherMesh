// Mock data for the Aether Mesh DFS application

export const systemMetrics = {
  totalThroughput: 1.42,
  activeNodes: 128,
  totalNodes: 130,
  meshLatency: 12.4,
  dataResilience: 99.99,
  activeShards: 50001,
  connectedNodes: 1400,
  globalThroughput: 42.7,
  uptime: '1.1YR',
  totalStorage: '18.4 PB',
  usedStorage: '12.1 PB',
  filesStored: 2847561,
  regionsActive: 6,
};

export const latencyData = [
  { time: '00:00', region01: 14, lanTv: 8 },
  { time: '00:05', region01: 18, lanTv: 10 },
  { time: '00:10', region01: 12, lanTv: 7 },
  { time: '00:15', region01: 35, lanTv: 15 },
  { time: '00:20', region01: 28, lanTv: 12 },
  { time: '00:25', region01: 42, lanTv: 18 },
  { time: '00:30', region01: 32, lanTv: 14 },
  { time: '00:35', region01: 18, lanTv: 9 },
  { time: '00:40', region01: 22, lanTv: 11 },
  { time: '00:45', region01: 15, lanTv: 8 },
  { time: '00:50', region01: 38, lanTv: 16 },
  { time: '00:55', region01: 25, lanTv: 13 },
  { time: '01:00', region01: 20, lanTv: 10 },
];

const NODE_STATUSES = ['healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'checking', 'loading', 'fault'];

function randomStatus() {
  return NODE_STATUSES[Math.floor(Math.random() * NODE_STATUSES.length)];
}

function randomBetween(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(1);
}

export const regions = [
  { id: 'US-EAST-1', label: 'US East', x: 28, y: 38, color: '#11E8F6' },
  { id: 'US-WEST-2', label: 'US West', x: 12, y: 32, color: '#5CF2C6' },
  { id: 'EU-WEST-1', label: 'EU West', x: 48, y: 22, color: '#76f0fb' },
  { id: 'EU-CENTRAL-1', label: 'EU Central', x: 54, y: 28, color: '#38debb' },
  { id: 'AP-SOUTH-1', label: 'AP South', x: 72, y: 48, color: '#ffb74d' },
  { id: 'AP-NORTH-1', label: 'AP North', x: 80, y: 26, color: '#ff6b6b' },
];

export const nodeList = Array.from({ length: 130 }, (_, i) => {
  const id = String(i + 1).padStart(3, '0');
  const regionNames = ['US-EAST-1', 'US-WEST-2', 'EU-WEST-1', 'EU-CENTRAL-1', 'AP-SOUTH-1', 'AP-NORTH-1'];
  const status = i < 20 ? randomStatus() : (Math.random() > 0.12 ? 'healthy' : randomStatus());
  return {
    id: `AE-NODE-X${id}`,
    region: regionNames[i % regionNames.length],
    status,
    cpu: status === 'fault' ? randomBetween(85, 99) : randomBetween(8, 55),
    memory: {
      used: status === 'fault' ? randomBetween(50, 63) : randomBetween(4, 32),
      total: 64,
    },
    iops: status === 'fault' ? randomBetween(1, 5) * 1000 : randomBetween(30, 60) * 1000,
    throughput: status === 'fault' ? randomBetween(10, 100) : randomBetween(500, 1200),
    errorRate: status === 'fault' ? randomBetween(2, 15) : randomBetween(0, 0.05),
    storagePath: `/mnt/mesh/node_${id}_nv...`,
    uptime: status === 'fault' ? `${Math.floor(Math.random() * 10)}D ${Math.floor(Math.random() * 24)}H` : `${Math.floor(300 + Math.random() * 200)}D ${Math.floor(Math.random() * 24)}H ${String(Math.floor(Math.random() * 60)).padStart(2, '0')}M`,
    lat: randomBetween(-60, 60),
    lng: randomBetween(-170, 170),
  };
});

export const selectedNodeDefault = {
  id: 'AE-NODE-X001',
  region: 'US-EAST-1',
  status: 'healthy',
  cpu: 24.5,
  memory: { used: 12.2, total: 64 },
  iops: 42800,
  throughput: 850,
  errorRate: 0.002,
  storagePath: '/mnt/mesh/node_001_nv...',
  uptime: '451D 12H 04M',
};

export const sidebarNavItems = [
  { icon: 'hub', label: 'Network Map', path: '/network-map', active: false },
  { icon: 'storage', label: 'Node Registry', path: '/dashboard', active: false },
  { icon: 'alert-triangle', label: 'Fault Logs', path: '/fault-logs', active: false },
  { icon: 'gauge', label: 'IO Traffic', path: '/io-traffic', active: false },
  { icon: 'shield-check', label: 'Security', path: '/security', active: false },
];

export const docNavItems = [
  { icon: 'book-open', label: 'Getting Started', active: false },
  { icon: 'cpu', label: 'Architecture', active: false },
  { icon: 'code', label: 'API Reference', active: false },
  { icon: 'bar-chart-3', label: 'Fault Tolerance', active: true },
];

export const erasureCodingCode = `// erasure_coding.go
func InitializeEncoder(
    data_shards int,
    parity_shards int,
) {
    enc, err := reedsolomon.New(
        data_shards, parity_shards,
    )
    // Split the file into equal
    // sized shards
    shards, err := enc.Split(data)
    // Encode parity shards
    err = enc.Encode(shards)
    return shards
}`;

export const yamlConfig = `# AETHER_MESH_CONFIG_FILE
node_identity: mesh-core-01
cluster_region: eu-west-04
storage_pool:
  - capacity: 256TB
  - class: NVMe_Gen5
  - encryption: AES-XTS-512
protocol_settings:
  - replication_factor: 8
  - shard_parity: 3
  - gossip_frequency: 100ms

Status: INITIALIZING_MESH_HANDSHAKE...
Status: CONNECTION_ESTABLISHED_P2P`;

export const consensusLogs = [
  { time: '[14:03:11]', level: 'INFO', msg: 'Prepare vote [OK, Shard]...' },
  { time: '[14:03:12]', level: 'INFO', msg: 'Broadcasting Pre-Prepare for Block #1,805,821' },
  { time: '[14:03:11]', level: 'INFO', msg: '301/324 nodes acknowledge PREPARE message' },
  { time: '[14:03:14]', level: 'WARN', msg: 'Node [56, Node]... ] sent invalid signature' },
  { time: '[14:03:15]', level: 'INFO', msg: '294/324 nodes acknowledge COMMIT entry...' },
  { time: '[14:03:16]', level: 'INFO', msg: 'Block finalized. State: COMMITTED' },
];

// ========== FILE EXPLORER DATA ==========

export const fileSystemTree = [
  {
    name: '/',
    type: 'folder',
    children: [
      {
        name: 'datasets',
        type: 'folder',
        children: [
          { name: 'training_v3.parquet', type: 'file', size: '2.4 GB', shards: 8, replicas: 3, checksum: 'sha512:a4f9e...c2d1', modified: '2026-04-08 14:22', status: 'synced' },
          { name: 'validation_set.csv', type: 'file', size: '890 MB', shards: 4, replicas: 3, checksum: 'sha512:b7c3a...f891', modified: '2026-04-07 09:15', status: 'synced' },
          { name: 'embeddings_768d.bin', type: 'file', size: '12.8 GB', shards: 16, replicas: 2, checksum: 'sha512:f2e8d...71a3', modified: '2026-04-09 18:44', status: 'syncing' },
        ],
      },
      {
        name: 'backups',
        type: 'folder',
        children: [
          { name: 'cluster_snapshot_0409.tar.zst', type: 'file', size: '48.2 GB', shards: 32, replicas: 4, checksum: 'sha512:c1d4f...e823', modified: '2026-04-09 03:00', status: 'synced' },
          { name: 'metadata_dump.json', type: 'file', size: '156 MB', shards: 2, replicas: 3, checksum: 'sha512:89af2...b4c7', modified: '2026-04-10 01:30', status: 'synced' },
        ],
      },
      {
        name: 'logs',
        type: 'folder',
        children: [
          { name: 'consensus_2026_04.log', type: 'file', size: '3.1 GB', shards: 6, replicas: 2, checksum: 'sha512:d4e2a...9f12', modified: '2026-04-10 17:52', status: 'synced' },
          { name: 'fault_recovery.log', type: 'file', size: '780 MB', shards: 3, replicas: 2, checksum: 'sha512:72b1c...a6d3', modified: '2026-04-10 17:50', status: 'synced' },
          { name: 'access_audit.log', type: 'file', size: '1.2 GB', shards: 4, replicas: 3, checksum: 'sha512:e3f7b...8c45', modified: '2026-04-10 17:51', status: 'syncing' },
        ],
      },
      {
        name: 'models',
        type: 'folder',
        children: [
          { name: 'transformer_v2.onnx', type: 'file', size: '6.7 GB', shards: 12, replicas: 3, checksum: 'sha512:a1b2c...d3e4', modified: '2026-04-06 11:30', status: 'synced' },
          { name: 'tokenizer.json', type: 'file', size: '4.2 MB', shards: 1, replicas: 3, checksum: 'sha512:f5g6h...i7j8', modified: '2026-04-06 11:30', status: 'synced' },
        ],
      },
      {
        name: 'configs',
        type: 'folder',
        children: [
          { name: 'mesh_topology.yaml', type: 'file', size: '28 KB', shards: 1, replicas: 6, checksum: 'sha512:k9l0m...n1o2', modified: '2026-04-10 09:00', status: 'synced' },
          { name: 'encryption_keys.enc', type: 'file', size: '8 KB', shards: 1, replicas: 6, checksum: 'sha512:p3q4r...s5t6', modified: '2026-04-01 00:00', status: 'synced' },
          { name: 'node_registry.json', type: 'file', size: '142 KB', shards: 1, replicas: 4, checksum: 'sha512:u7v8w...x9y0', modified: '2026-04-10 17:00', status: 'synced' },
        ],
      },
    ],
  },
];

export const storageByRegion = [
  { region: 'US-EAST-1', used: 3.8, total: 5.0 },
  { region: 'US-WEST-2', used: 2.4, total: 4.0 },
  { region: 'EU-WEST-1', used: 2.1, total: 3.0 },
  { region: 'EU-CENTRAL-1', used: 1.9, total: 3.0 },
  { region: 'AP-SOUTH-1', used: 1.2, total: 2.0 },
  { region: 'AP-NORTH-1', used: 0.7, total: 1.4 },
];

export const recentFileActivity = [
  { action: 'WRITE', file: '/datasets/training_v3.parquet', node: 'AE-NODE-X012', time: '2 min ago', status: 'success' },
  { action: 'REPLICATE', file: '/backups/cluster_snapshot_0409.tar.zst', node: 'AE-NODE-X045', time: '5 min ago', status: 'success' },
  { action: 'READ', file: '/models/transformer_v2.onnx', node: 'AE-NODE-X078', time: '8 min ago', status: 'success' },
  { action: 'SYNC', file: '/logs/access_audit.log', node: 'AE-NODE-X023', time: '11 min ago', status: 'pending' },
  { action: 'DELETE', file: '/backups/old_snapshot_0401.tar.zst', node: 'AE-NODE-X001', time: '15 min ago', status: 'success' },
  { action: 'WRITE', file: '/datasets/embeddings_768d.bin', node: 'AE-NODE-X091', time: '18 min ago', status: 'success' },
];

// ========== FAULT LOGS DATA ==========

const faultSeverities = ['CRITICAL', 'ERROR', 'WARNING', 'INFO'];
const faultMessages = [
  { sev: 'CRITICAL', msg: 'Node AE-NODE-X{n} unresponsive — heartbeat timeout exceeded 30s', recovery: 'Initiating shard redistribution...' },
  { sev: 'ERROR', msg: 'Parity shard reconstruction failed on volume /mnt/mesh/node_{n}_nv', recovery: 'Retrying with backup parity block...' },
  { sev: 'WARNING', msg: 'Disk I/O latency spike detected on AE-NODE-X{n} (≥450ms)', recovery: 'Throttling write operations...' },
  { sev: 'ERROR', msg: 'Consensus timeout: AE-NODE-X{n} failed to acknowledge PREPARE within 5s', recovery: 'Excluding node from consensus round...' },
  { sev: 'CRITICAL', msg: 'Network partition detected between US-EAST-1 and EU-WEST-1 clusters', recovery: 'Activating split-brain resolution protocol...' },
  { sev: 'WARNING', msg: 'Memory utilization on AE-NODE-X{n} exceeded 85% threshold', recovery: 'Evicting cold cache entries...' },
  { sev: 'INFO', msg: 'Self-healing completed: 4 shards relocated from AE-NODE-X{n}', recovery: null },
  { sev: 'ERROR', msg: 'Checksum mismatch on block #1,805,{n} — possible data corruption', recovery: 'Reconstructing from parity shards...' },
  { sev: 'WARNING', msg: 'TLS certificate expiry in 7 days for node AE-NODE-X{n}', recovery: 'Automated renewal scheduled...' },
  { sev: 'CRITICAL', msg: 'Storage pool NVMe failure on AE-NODE-X{n} — SMART warning', recovery: 'Migrating hot data to standby volume...' },
  { sev: 'INFO', msg: 'Node AE-NODE-X{n} rejoined cluster after 2m17s downtime', recovery: null },
  { sev: 'WARNING', msg: 'Gossip protocol message queue depth exceeds 1000 on AE-NODE-X{n}', recovery: 'Increasing drain rate...' },
];

export const faultLogEntries = Array.from({ length: 50 }, (_, i) => {
  const tmpl = faultMessages[i % faultMessages.length];
  const nodeNum = String(Math.floor(Math.random() * 130) + 1).padStart(3, '0');
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return {
    id: `FLT-${String(2000 + i).padStart(6, '0')}`,
    timestamp: `2026-04-10 ${hour}:${min}:${sec}`,
    severity: tmpl.sev,
    message: tmpl.msg.replace('{n}', nodeNum),
    recovery: tmpl.recovery,
    region: ['US-EAST-1', 'US-WEST-2', 'EU-WEST-1', 'EU-CENTRAL-1', 'AP-SOUTH-1', 'AP-NORTH-1'][i % 6],
    resolved: tmpl.sev === 'INFO' || Math.random() > 0.3,
  };
}).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

export const faultStats = {
  mttr: '2m 34s',
  mtbf: '14.2 days',
  faultRate: '0.018%',
  autoRecoveryRate: '94.7%',
  activeIncidents: 3,
  resolvedToday: 18,
  criticalAlerts: 2,
  shardRelocations: 47,
};

export const faultTimeline = [
  { hour: '00:00', critical: 0, error: 1, warning: 3 },
  { hour: '02:00', critical: 0, error: 0, warning: 2 },
  { hour: '04:00', critical: 1, error: 2, warning: 4 },
  { hour: '06:00', critical: 0, error: 1, warning: 1 },
  { hour: '08:00', critical: 0, error: 0, warning: 3 },
  { hour: '10:00', critical: 0, error: 2, warning: 5 },
  { hour: '12:00', critical: 1, error: 3, warning: 7 },
  { hour: '14:00', critical: 0, error: 1, warning: 2 },
  { hour: '16:00', critical: 0, error: 0, warning: 4 },
  { hour: '18:00', critical: 2, error: 4, warning: 6 },
  { hour: '20:00', critical: 0, error: 1, warning: 3 },
  { hour: '22:00', critical: 0, error: 0, warning: 1 },
];

// ========== SECURITY DATA ==========

export const securityOverview = {
  encryptionAlgo: 'AES-XTS-512',
  keyRotation: 'Every 72 hours',
  tlsVersion: 'TLS 1.3',
  certAuthority: 'Aether Internal CA',
  lastAudit: '2026-04-09 08:00 UTC',
  threatLevel: 'Low',
  complianceScore: 97.2,
  activeSessions: 342,
};

export const certificates = [
  { name: 'Root CA', issuer: 'Aether Mesh CA', expiry: '2028-01-01', status: 'valid', fingerprint: 'A4:F9:E2:C1:...' },
  { name: 'Node TLS (US-EAST)', issuer: 'Aether Mesh CA', expiry: '2026-09-15', status: 'valid', fingerprint: 'B7:C3:A1:F8:...' },
  { name: 'Node TLS (EU-WEST)', issuer: 'Aether Mesh CA', expiry: '2026-04-17', status: 'expiring', fingerprint: 'F2:E8:D4:71:...' },
  { name: 'API Gateway', issuer: 'Let\'s Encrypt', expiry: '2026-07-01', status: 'valid', fingerprint: 'C1:D4:F9:E8:...' },
  { name: 'Node TLS (AP-SOUTH)', issuer: 'Aether Mesh CA', expiry: '2026-11-30', status: 'valid', fingerprint: '89:AF:2B:4C:...' },
  { name: 'Admin Console', issuer: 'Aether Mesh CA', expiry: '2026-06-22', status: 'valid', fingerprint: 'D4:E2:A1:9F:...' },
];

export const securityAuditLog = [
  { time: '17:48:22', action: 'KEY_ROTATION', user: 'system', detail: 'Rotated encryption keys for cluster US-EAST-1', status: 'success' },
  { time: '17:32:15', action: 'AUTH_FAILURE', user: 'unknown', detail: 'Failed SSH authentication from 203.0.113.42', status: 'blocked' },
  { time: '16:55:08', action: 'CERT_RENEWAL', user: 'system', detail: 'Auto-renewed TLS cert for EU-WEST-1 nodes', status: 'success' },
  { time: '16:22:41', action: 'ACCESS_GRANT', user: 'admin@aethermesh.io', detail: 'Granted read access to /datasets/ for service-ml-pipeline', status: 'success' },
  { time: '15:18:33', action: 'FIREWALL_UPDATE', user: 'system', detail: 'Updated ingress rules — blocked 47 suspicious IPs', status: 'success' },
  { time: '14:45:19', action: 'AUTH_FAILURE', user: 'unknown', detail: 'Brute force attempt detected from 198.51.100.23', status: 'blocked' },
  { time: '14:03:55', action: 'POLICY_UPDATE', user: 'admin@aethermesh.io', detail: 'Updated data retention policy to 90 days', status: 'success' },
  { time: '12:30:11', action: 'ENCRYPTION', user: 'system', detail: 'Re-encrypted 1,247 shards with new lattice keypair', status: 'success' },
];

export const accessControlEntries = [
  { role: 'Cluster Admin', users: 3, permissions: ['read', 'write', 'delete', 'admin', 'deploy'], lastActive: '2 min ago' },
  { role: 'Node Operator', users: 8, permissions: ['read', 'write', 'deploy'], lastActive: '15 min ago' },
  { role: 'Data Engineer', users: 12, permissions: ['read', 'write'], lastActive: '5 min ago' },
  { role: 'Read-Only Auditor', users: 4, permissions: ['read'], lastActive: '1 hour ago' },
  { role: 'ML Pipeline (Service)', users: 1, permissions: ['read', 'write'], lastActive: '30 sec ago' },
];

// ========== IO TRAFFIC DATA ==========

export const throughputTimeSeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  read: +(Math.random() * 800 + 200).toFixed(0),
  write: +(Math.random() * 600 + 100).toFixed(0),
}));

export const iopsDistribution = nodeList.slice(0, 30).map((node) => ({
  nodeId: node.id.replace('AE-NODE-', ''),
  read: Math.floor(Math.random() * 35000 + 5000),
  write: Math.floor(Math.random() * 25000 + 3000),
  status: node.status,
}));

export const bandwidthByRegion = [
  { region: 'US-EAST-1', inbound: 312, outbound: 287, peak: 456 },
  { region: 'US-WEST-2', inbound: 198, outbound: 224, peak: 389 },
  { region: 'EU-WEST-1', inbound: 267, outbound: 245, peak: 401 },
  { region: 'EU-CENTRAL-1', inbound: 189, outbound: 201, peak: 334 },
  { region: 'AP-SOUTH-1', inbound: 142, outbound: 128, peak: 278 },
  { region: 'AP-NORTH-1', inbound: 98, outbound: 112, peak: 195 },
];

export const topConsumers = [
  { service: 'ml-pipeline-v3', reads: '142k', writes: '89k', bandwidth: '456 MB/s', trend: 'up' },
  { service: 'backup-scheduler', reads: '12k', writes: '234k', bandwidth: '312 MB/s', trend: 'stable' },
  { service: 'data-ingestion-prod', reads: '5k', writes: '312k', bandwidth: '289 MB/s', trend: 'up' },
  { service: 'analytics-dashboard', reads: '234k', writes: '2k', bandwidth: '156 MB/s', trend: 'down' },
  { service: 'replication-daemon', reads: '89k', writes: '89k', bandwidth: '134 MB/s', trend: 'stable' },
  { service: 'log-aggregator', reads: '45k', writes: '67k', bandwidth: '98 MB/s', trend: 'up' },
];

export const latencyDistribution = [
  { range: '0-5ms', count: 3420 },
  { range: '5-10ms', count: 8945 },
  { range: '10-15ms', count: 5623 },
  { range: '15-20ms', count: 2134 },
  { range: '20-30ms', count: 987 },
  { range: '30-50ms', count: 234 },
  { range: '50ms+', count: 45 },
];

// ========== SETTINGS DATA ==========

export const clusterConfig = {
  replicationFactor: 3,
  shardParity: 2,
  gossipFrequency: '100ms',
  heartbeatInterval: '5s',
  heartbeatTimeout: '30s',
  maxShardSize: '64MB',
  consensusAlgorithm: 'PBFT',
  compressionAlgo: 'Zstandard',
  encryptionEnabled: true,
  autoHealingEnabled: true,
  crossRegionSync: true,
  deduplicationEnabled: true,
};

export const settingsNotifications = [
  { key: 'node_failure', label: 'Node Failures', description: 'Alert when a node becomes unresponsive', enabled: true },
  { key: 'disk_warning', label: 'Disk Warnings', description: 'Notify when disk usage exceeds 80%', enabled: true },
  { key: 'cert_expiry', label: 'Certificate Expiry', description: 'Warn 7 days before cert expiration', enabled: true },
  { key: 'replication_lag', label: 'Replication Lag', description: 'Alert when replication falls behind', enabled: false },
  { key: 'security_event', label: 'Security Events', description: 'Notify on auth failures and threats', enabled: true },
  { key: 'maintenance', label: 'Maintenance Windows', description: 'Scheduled maintenance reminders', enabled: false },
];

export const apiKeys = [
  { name: 'Production API', key: 'am_prod_****...a3f2', created: '2026-03-01', lastUsed: '2 min ago', status: 'active' },
  { name: 'ML Pipeline Service', key: 'am_svc_****...b7c1', created: '2026-03-15', lastUsed: '30 sec ago', status: 'active' },
  { name: 'Staging Environment', key: 'am_stg_****...d4e2', created: '2026-02-20', lastUsed: '3 days ago', status: 'active' },
  { name: 'Legacy Migration', key: 'am_lgc_****...f9a1', created: '2026-01-10', lastUsed: '2 weeks ago', status: 'revoked' },
];

// ========== DASHBOARD EXTRAS ==========

export const throughputHistory = [
  { time: '00:00', value: 1.12 },
  { time: '02:00', value: 0.89 },
  { time: '04:00', value: 0.76 },
  { time: '06:00', value: 0.94 },
  { time: '08:00', value: 1.23 },
  { time: '10:00', value: 1.56 },
  { time: '12:00', value: 1.78 },
  { time: '14:00', value: 1.42 },
  { time: '16:00', value: 1.65 },
  { time: '18:00', value: 1.89 },
  { time: '20:00', value: 1.34 },
  { time: '22:00', value: 1.18 },
];

export const storageDistribution = [
  { name: 'Data Shards', value: 62, color: '#11E8F6' },
  { name: 'Parity Shards', value: 21, color: '#5CF2C6' },
  { name: 'Metadata', value: 8, color: '#76f0fb' },
  { name: 'Available', value: 9, color: '#274565' },
];

export const recentActivity = [
  { type: 'deploy', msg: 'Node AE-NODE-X131 added to US-WEST-2', time: '3m ago', icon: 'plus' },
  { type: 'fault', msg: 'Self-healing: 4 shards relocated from X056', time: '8m ago', icon: 'alert' },
  { type: 'sync', msg: 'Cross-region sync completed (EU↔US)', time: '12m ago', icon: 'check' },
  { type: 'update', msg: 'Encryption keys rotated for all clusters', time: '18m ago', icon: 'key' },
  { type: 'deploy', msg: 'Firmware update pushed to AP-SOUTH nodes', time: '25m ago', icon: 'download' },
  { type: 'sync', msg: 'Backup snapshot created: cluster_0410.tar.zst', time: '32m ago', icon: 'save' },
];
