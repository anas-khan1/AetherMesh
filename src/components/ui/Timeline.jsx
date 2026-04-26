import { motion } from 'framer-motion';

const severityColors = {
  CRITICAL: 'var(--color-error-hot)',
  ERROR: 'var(--color-error)',
  WARNING: 'var(--color-warning)',
  INFO: 'var(--color-cyan-neon)',
  success: 'var(--color-success)',
  pending: 'var(--color-warning)',
  blocked: 'var(--color-error-hot)',
};

export default function Timeline({ items, maxItems = 10 }) {
  const visible = items.slice(0, maxItems);

  return (
    <div className="timeline">
      {visible.map((item, i) => {
        const color = severityColors[item.severity] || severityColors[item.status] || 'var(--color-cyan-neon)';
        return (
          <motion.div
            key={item.id || i}
            className="timeline-item"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.6), duration: 0.35 }}
          >
            <div className="timeline-dot" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
            <div className="timeline-line" />
            <div className="timeline-content">
              <div className="flex items-center gap-2 flex-wrap">
                {item.severity && (
                  <span className="text-[10px] font-display font-bold tracking-wider uppercase" style={{ color }}>
                    {item.severity}
                  </span>
                )}
                <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>
                  {item.timestamp || item.time}
                </span>
              </div>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {item.message || item.msg || item.detail}
              </p>
              {item.recovery && (
                <span className="text-xs mt-1 inline-block" style={{ color: 'var(--color-teal-neon)' }}>
                  ↳ {item.recovery}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
