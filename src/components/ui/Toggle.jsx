import { motion } from 'framer-motion';

export default function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      className="toggle-row"
      role="switch"
      aria-checked={checked}
      type="button"
    >
      <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
        <span className="text-sm font-display font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        {description && (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</span>
        )}
      </div>
      <div
        className="toggle-track"
        style={{
          backgroundColor: checked ? 'rgba(17, 232, 246, 0.25)' : 'var(--color-focus)',
          borderColor: checked ? 'rgba(17, 232, 246, 0.4)' : 'rgba(17, 232, 246, 0.12)',
        }}
      >
        <motion.div
          className="toggle-thumb"
          animate={{
            x: checked ? 18 : 0,
            backgroundColor: checked ? '#11E8F6' : '#8ea5bd',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            boxShadow: checked ? '0 0 10px rgba(17, 232, 246, 0.5)' : 'none',
          }}
        />
      </div>
    </button>
  );
}
