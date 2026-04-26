import { motion } from 'framer-motion';
import NodeBadge from '../ui/NodeBadge';

export default function NodeHealthGrid({ nodes, selectedNode, onSelectNode }) {
  const gridNodes = nodes.slice(0, 20);

  const statusCounts = {
    leader: gridNodes.filter(n => n.id === 'AE-NODE-X001').length,
    healthy: gridNodes.filter(n => n.status === 'healthy').length,
    checking: gridNodes.filter(n => n.status === 'checking' || n.status === 'loading').length,
    fault: gridNodes.filter(n => n.status === 'fault').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="panel p-5"
      style={{ minWidth: '240px' }}
    >
      <h3 className="panel-title mb-4">
        Cluster Node Health
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {gridNodes.map((node) => (
          <NodeBadge
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={onSelectNode}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        {[
          { label: 'Leader', color: 'var(--color-cyan-neon)', count: statusCounts.leader },
          { label: 'Healthy', color: 'var(--color-cyan-neon)', count: statusCounts.healthy },
          { label: 'Checking', color: 'var(--color-warning)', count: statusCounts.checking },
          { label: 'Fault', color: 'var(--color-error-hot)', count: statusCounts.fault },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
