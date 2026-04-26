import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Server, AlertTriangle, Wifi } from 'lucide-react';
import NodeBadge from '../components/ui/NodeBadge';
import { useCluster } from '../context/ClusterContext';

const filters = ['all', 'healthy', 'checking', 'fault'];

function NodeDetailOverlay({ node, onClose }) {
  if (!node) return null;

  const statusColor = {
    healthy: 'var(--color-cyan-neon)',
    checking: 'var(--color-warning)',
    loading: 'var(--color-warning)',
    fault: 'var(--color-error-hot)',
  }[node.status] || 'var(--color-cyan-neon)';

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
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="glass-strong rounded-xl p-6 w-full max-w-xl relative"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 icon-btn"
          title="Close details"
          aria-label="Close details"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full animate-pulse-slow" style={{ backgroundColor: statusColor }} />
          <div>
            <h3 className="font-display text-lg font-bold" style={{ color: 'var(--color-cyan-primary)' }}>
              {node.id}
            </h3>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              REGION {node.region} / STATUS {node.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'CPU', value: `${node.cpu}%`, fill: node.cpu },
            { label: 'Memory', value: `${node.memory.used}/${node.memory.total} GB`, fill: (node.memory.used / node.memory.total) * 100 },
            { label: 'IOPS', value: `${(node.iops / 1000).toFixed(1)}k`, fill: (node.iops / 60000) * 100 },
            { label: 'Throughput', value: `${node.throughput} MB/s`, fill: (node.throughput / 1200) * 100 },
          ].map((m) => (
            <div key={m.label} className="panel-soft p-3 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  {m.label}
                </span>
                <span className="text-sm font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>
                  {m.value}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(m.fill, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{
                    background: m.fill > 80
                      ? 'var(--color-error-hot)'
                      : 'linear-gradient(90deg, var(--color-cyan-neon), var(--color-teal-neon))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-subtle)' }}>
              Error Rate
            </span>
            <span className="text-sm font-mono" style={{ color: node.errorRate > 1 ? 'var(--color-error-hot)' : 'var(--color-text-primary)' }}>
              {node.errorRate}%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-subtle)' }}>
              Uptime
            </span>
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {node.uptime}
            </span>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-subtle)' }}>
              Storage Path
            </span>
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {node.storagePath}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NodeHealth() {
  const { nodes, systemMetrics, injectFault, recoverNode } = useCluster();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return nodes;
    if (activeFilter === 'checking') return nodes.filter((n) => n.status === 'checking' || n.status === 'loading');
    return nodes.filter((n) => n.status === activeFilter);
  }, [activeFilter, nodes]);

  const stats = useMemo(
    () => ({
      total: nodes.length,
      healthy: nodes.filter((n) => n.status === 'healthy').length,
      faulty: nodes.filter((n) => n.status === 'fault').length,
      avgLatency: `${systemMetrics.meshLatency}ms`,
    }),
    [nodes, systemMetrics.meshLatency]
  );

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="panel p-5 md:p-6 mb-5"
        >
          <p className="kicker mb-2">Node Health</p>
          <h1 className="section-title">Real-Time Mesh Integrity</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Monitoring {stats.total} distributed nodes with instant status overlays and failure diagnostics.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5"
        >
          {[
            { icon: Server, label: 'Total Nodes', value: stats.total, color: 'var(--color-cyan-primary)' },
            { icon: Activity, label: 'Healthy', value: stats.healthy, color: 'var(--color-cyan-neon)' },
            { icon: AlertTriangle, label: 'Faulty', value: stats.faulty, color: 'var(--color-error-hot)' },
            { icon: Wifi, label: 'Avg Latency', value: stats.avgLatency, color: 'var(--color-teal-neon)' },
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
                <div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  {s.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`filter-btn${activeFilter === f ? ' active' : ''}`}
            >
              {f === 'all'
                ? `All (${nodes.length})`
                : f === 'healthy'
                  ? `Healthy (${stats.healthy})`
                  : f === 'checking'
                    ? `Checking (${nodes.filter((n) => n.status === 'checking' || n.status === 'loading').length})`
                    : `Fault (${stats.faulty})`}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <button className="filter-btn" onClick={() => injectFault()}>Inject Random Fault</button>
          {selectedNode?.status === 'fault' && (
            <button className="filter-btn active" onClick={() => recoverNode(selectedNode.id)}>
              Recover Selected Node
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="panel p-5"
        >
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))' }}>
            {filteredNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.84 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.8), duration: 0.26 }}
              >
                <NodeBadge
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onClick={setSelectedNode}
                />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4" style={{ borderTop: '1px solid rgba(17, 232, 246, 0.1)' }}>
            {[
              { label: 'Healthy', color: 'var(--color-cyan-neon)' },
              { label: 'Checking / Loading', color: 'var(--color-warning)' },
              { label: 'Fault', color: 'var(--color-error-hot)' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-display tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <NodeDetailOverlay node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
