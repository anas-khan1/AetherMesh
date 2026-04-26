import { motion, AnimatePresence } from 'framer-motion';

export default function NodeDetails({ node }) {
  if (!node) return null;

  const metrics = [
    { label: 'IOPS (READ/WRITE)', value: `${(node.iops / 1000).toFixed(1)}k`, bar: Math.min(node.iops / 60000 * 100, 100) },
    { label: 'THROUGHPUT', value: `${node.throughput} MB/s`, bar: Math.min(node.throughput / 1200 * 100, 100) },
    { label: 'ERROR RATE', value: `${node.errorRate}%`, bar: node.errorRate, isError: node.errorRate > 1 },
  ];

  const details = [
    { label: 'Memory Load', value: `${node.memory.used} / ${node.memory.total} GB` },
    { label: 'CPU Utilization', value: `${node.cpu}%` },
    { label: 'Storage Path', value: node.storagePath },
    { label: 'Uptime', value: node.uptime },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="panel p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="panel-title">
              Selected Node Details
            </h3>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
              ID: {node.id} // LOC: {node.region}
            </span>
          </div>
          <button
            className="filter-btn"
            style={{
              color: 'var(--color-text-muted)',
            }}
          >
            Request Diagnostic Log
          </button>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  {m.label}
                </span>
                <span
                  className="text-lg font-display font-bold"
                  style={{ color: m.isError ? 'var(--color-error-hot)' : 'var(--color-cyan-primary)' }}
                >
                  {m.value}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.bar}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    background: m.isError
                      ? 'var(--color-error-hot)'
                      : 'linear-gradient(90deg, var(--color-cyan-neon), var(--color-teal-neon))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sub Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {details.map((d) => (
            <div key={d.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {d.label}
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--color-text-primary)' }}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
