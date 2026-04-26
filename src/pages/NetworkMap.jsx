import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Server, Wifi, Globe, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { nodeList, regions } from '../data/mockData';

const statusColors = {
  healthy: '#11E8F6',
  checking: '#ffb74d',
  loading: '#ffb74d',
  fault: '#ff6b6b',
};

function NodeTooltip({ node, onClose }) {
  if (!node) return null;
  const statusColor = statusColors[node.status] || '#11E8F6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(3, 16, 38, 0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-strong rounded-xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 icon-btn" aria-label="Close">
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full animate-pulse-slow" style={{ backgroundColor: statusColor }} />
          <div>
            <h3 className="font-display text-lg font-bold" style={{ color: 'var(--color-cyan-primary)' }}>{node.id}</h3>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              REGION {node.region} / STATUS {node.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {[
            { label: 'CPU', value: `${node.cpu}%`, fill: node.cpu },
            { label: 'Memory', value: `${node.memory.used}/${node.memory.total} GB`, fill: (node.memory.used / node.memory.total) * 100 },
            { label: 'IOPS', value: `${(node.iops / 1000).toFixed(1)}k`, fill: (node.iops / 60000) * 100 },
            { label: 'Throughput', value: `${node.throughput} MB/s`, fill: (node.throughput / 1200) * 100 },
          ].map((m) => (
            <div key={m.label} className="panel-soft p-3 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{m.label}</span>
                <span className="text-sm font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>{m.value}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(m.fill, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{
                    background: m.fill > 80 ? 'var(--color-error-hot)' : 'linear-gradient(90deg, var(--color-cyan-neon), var(--color-teal-neon))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-subtle)' }}>Error Rate</span>
            <span className="text-sm font-mono" style={{ color: node.errorRate > 1 ? 'var(--color-error-hot)' : 'var(--color-text-primary)' }}>{node.errorRate}%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-subtle)' }}>Uptime</span>
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>{node.uptime}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-subtle)' }}>Storage</span>
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>{node.storagePath}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MeshTopology({ nodes, zoom, onSelectNode }) {
  const regionGroups = useMemo(() => {
    const groups = {};
    regions.forEach((r) => { groups[r.id] = { ...r, nodes: [] }; });
    nodes.forEach((n) => {
      if (groups[n.region]) groups[n.region].nodes.push(n);
    });
    return Object.values(groups);
  }, [nodes]);

  return (
    <svg viewBox="0 0 1000 500" className="w-full h-full" style={{ transform: `scale(${zoom})` }}>
      <defs>
        <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#11E8F6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#11E8F6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="connectionLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#11E8F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5CF2C6" stopOpacity="0.1" />
        </linearGradient>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Inter-region connections */}
      {regionGroups.map((r1, i) =>
        regionGroups.slice(i + 1).map((r2, j) => (
          <line
            key={`conn-${i}-${j}`}
            x1={r1.x * 10}
            y1={r1.y * 10}
            x2={r2.x * 10}
            y2={r2.y * 10}
            stroke="url(#connectionLine)"
            strokeWidth="1"
            strokeDasharray="6 4"
            style={{ animation: `dash-flow ${3 + j * 0.4}s linear infinite` }}
          />
        ))
      )}

      {/* Region clusters */}
      {regionGroups.map((region, ri) => {
        const cx = region.x * 10;
        const cy = region.y * 10;
        const nodeR = 3;
        const clusterR = Math.min(region.nodes.length * 0.6, 60);

        return (
          <g key={region.id}>
            {/* Region glow */}
            <circle cx={cx} cy={cy} r={clusterR + 20} fill="url(#regionGlow)">
              <animate attributeName="r" values={`${clusterR + 15};${clusterR + 25};${clusterR + 15}`} dur="4s" repeatCount="indefinite" />
            </circle>

            {/* Region boundary */}
            <circle cx={cx} cy={cy} r={clusterR} fill="none" stroke={region.color} strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4" />

            {/* Region label */}
            <text x={cx} y={cy - clusterR - 10} textAnchor="middle" fill={region.color} fontSize="11" fontFamily="var(--font-display)" fontWeight="700" letterSpacing="0.12em">
              {region.label.toUpperCase()}
            </text>
            <text x={cx} y={cy - clusterR + 2} textAnchor="middle" fill="var(--color-text-subtle)" fontSize="8" fontFamily="var(--font-mono)">
              {region.nodes.length} nodes
            </text>

            {/* Nodes in circular layout */}
            {region.nodes.slice(0, 24).map((node, ni) => {
              const angle = (ni / Math.min(region.nodes.length, 24)) * Math.PI * 2 - Math.PI / 2;
              const dist = clusterR * 0.65 * (ni < 12 ? 1 : 0.45);
              const nx = cx + Math.cos(angle) * dist;
              const ny = cy + Math.sin(angle) * dist;
              const color = statusColors[node.status] || '#11E8F6';

              return (
                <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => onSelectNode(node)}>
                  <circle cx={nx} cy={ny} r={nodeR * 2.5} fill={color} opacity="0.1">
                    <animate attributeName="opacity" values="0.05;0.15;0.05" dur={`${3 + ni * 0.2}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={nx} cy={ny} r={nodeR} fill={color} filter="url(#nodeGlow)">
                    {node.status === 'fault' && (
                      <animate attributeName="r" values={`${nodeR};${nodeR * 1.4};${nodeR}`} dur="1s" repeatCount="indefinite" />
                    )}
                  </circle>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Animated data particles */}
      {regionGroups.slice(0, 3).map((r1, i) => {
        const r2 = regionGroups[(i + 1) % regionGroups.length];
        return (
          <circle key={`particle-${i}`} r="2" fill="#11E8F6" filter="url(#nodeGlow)">
            <animateMotion dur={`${4 + i}s`} repeatCount="indefinite" path={`M${r1.x * 10},${r1.y * 10} L${r2.x * 10},${r2.y * 10}`} />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${4 + i}s`} repeatCount="indefinite" />
          </circle>
        );
      })}
    </svg>
  );
}

export default function NetworkMap() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return nodeList;
    if (activeFilter === 'checking') return nodeList.filter((n) => n.status === 'checking' || n.status === 'loading');
    return nodeList.filter((n) => n.status === activeFilter);
  }, [activeFilter]);

  const stats = useMemo(() => ({
    total: nodeList.length,
    healthy: nodeList.filter((n) => n.status === 'healthy').length,
    faulty: nodeList.filter((n) => n.status === 'fault').length,
    checking: nodeList.filter((n) => n.status === 'checking' || n.status === 'loading').length,
  }), []);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.15, 2)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.15, 0.5)), []);
  const handleReset = useCallback(() => setZoom(1), []);

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="panel p-5 md:p-6 mb-5"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="kicker mb-2">Topology</p>
              <h1 className="section-title">Global Network Map</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Real-time visualization of {stats.total} distributed nodes across {regions.length} regions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="status-pill">
                <span className="status-dot" />
                {stats.healthy} Online
              </div>
              {stats.faulty > 0 && (
                <div className="status-pill" style={{ borderColor: 'rgba(255, 107, 107, 0.35)', backgroundColor: 'rgba(255, 107, 107, 0.08)', color: 'var(--color-error-hot)' }}>
                  <span className="w-[0.38rem] h-[0.38rem] rounded-full" style={{ backgroundColor: 'var(--color-error-hot)', boxShadow: '0 0 8px rgba(255,107,107,0.6)' }} />
                  {stats.faulty} Fault
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5"
        >
          {[
            { icon: Server, label: 'Total Nodes', value: stats.total, color: 'var(--color-cyan-primary)' },
            { icon: Activity, label: 'Healthy', value: stats.healthy, color: 'var(--color-cyan-neon)' },
            { icon: Globe, label: 'Regions', value: regions.length, color: 'var(--color-teal-neon)' },
            { icon: Wifi, label: 'Avg Latency', value: '12.4ms', color: 'var(--color-teal-neon)' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
              className="panel p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(17, 232, 246, 0.08)' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-lg font-display font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'healthy', 'checking', 'fault'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`filter-btn${activeFilter === f ? ' active' : ''}`}
              >
                {f === 'all' ? `All (${stats.total})` : f === 'healthy' ? `Healthy (${stats.healthy})` : f === 'checking' ? `Checking (${stats.checking})` : `Fault (${stats.faulty})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleZoomOut} className="icon-btn" title="Zoom out" aria-label="Zoom out"><ZoomOut size={14} /></button>
            <span className="text-[10px] font-mono px-2" style={{ color: 'var(--color-text-muted)' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="icon-btn" title="Zoom in" aria-label="Zoom in"><ZoomIn size={14} /></button>
            <button onClick={handleReset} className="icon-btn" title="Reset" aria-label="Reset zoom"><Maximize2 size={14} /></button>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.55 }}
          className="panel p-4 overflow-hidden"
          style={{ minHeight: '460px' }}
        >
          <div className="w-full h-full overflow-auto" style={{ minHeight: '420px' }}>
            <MeshTopology nodes={filteredNodes} zoom={zoom} onSelectNode={setSelectedNode} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(17, 232, 246, 0.1)' }}>
            {[
              { label: 'Healthy', color: '#11E8F6' },
              { label: 'Checking', color: '#ffb74d' },
              { label: 'Fault', color: '#ff6b6b' },
              { label: 'Data Flow', color: '#11E8F6', dashed: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                {item.dashed ? (
                  <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke={item.color} strokeWidth="1.5" strokeDasharray="3 2" /></svg>
                ) : (
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                )}
                <span className="text-xs font-display tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Region breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5"
        >
          {regions.map((r, i) => {
            const regionNodes = nodeList.filter((n) => n.region === r.id);
            const healthy = regionNodes.filter((n) => n.status === 'healthy').length;
            const faulty = regionNodes.filter((n) => n.status === 'fault').length;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                className="panel p-3"
              >
                <div className="text-[10px] font-display tracking-wider uppercase mb-2" style={{ color: r.color }}>{r.label}</div>
                <div className="text-lg font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>{regionNodes.length}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono" style={{ color: 'var(--color-cyan-neon)' }}>{healthy} OK</span>
                  {faulty > 0 && <span className="text-[9px] font-mono" style={{ color: 'var(--color-error-hot)' }}>{faulty} FAULT</span>}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedNode && <NodeTooltip node={selectedNode} onClose={() => setSelectedNode(null)} />}
      </AnimatePresence>
    </section>
  );
}
