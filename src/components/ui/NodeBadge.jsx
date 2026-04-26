import { motion } from 'framer-motion';

const statusColors = {
  healthy: { bg: 'var(--color-cyan-neon)', glow: 'rgba(17, 232, 246, 0.5)' },
  loading: { bg: 'var(--color-warning)', glow: 'rgba(255, 183, 77, 0.5)' },
  checking: { bg: 'var(--color-warning)', glow: 'rgba(255, 183, 77, 0.4)' },
  fault: { bg: 'var(--color-error-hot)', glow: 'rgba(255, 107, 107, 0.6)' },
};

export default function NodeBadge({ node, isSelected, onClick, size = 'md' }) {
  const colors = statusColors[node.status] || statusColors.healthy;
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <motion.button
      onClick={() => onClick?.(node)}
      className={`${dims} rounded-[4px] relative cursor-pointer border-0 outline-none`}
      style={{
        backgroundColor: colors.bg,
        boxShadow: isSelected ? '0 0 0 2px rgba(17, 232, 246, 0.7)' : 'none',
      }}
      whileHover={{
        scale: 1.15,
        boxShadow: `0 0 18px ${colors.glow}`,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      animate={
        node.status === 'fault'
          ? {
              x: [0, -3, 3, -2, 2, 0],
              backgroundColor: [colors.bg, '#ff3333', colors.bg],
            }
          : {}
      }
      transition={
        node.status === 'fault'
          ? { duration: 0.6, repeat: Infinity, repeatDelay: 4 }
          : {}
      }
      title={`${node.id} - ${node.status.toUpperCase()}`}
    >
      {node.status === 'healthy' && (
        <span
          className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full animate-pulse-slow"
          style={{ backgroundColor: 'var(--color-teal-neon)' }}
        />
      )}
    </motion.button>
  );
}