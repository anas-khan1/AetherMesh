import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function GlowButton({ children, to, onClick, className = '', variant = 'primary' }) {
  const baseStyles =
    'inline-flex items-center gap-2 px-6 py-3 font-display text-sm font-semibold tracking-[0.12em] uppercase cursor-pointer border-0 rounded-[8px] transition-all duration-300 no-underline';

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-cyan-primary), var(--color-cyan-neon))',
      color: 'var(--color-void)',
      boxShadow: '0 0 0 1px rgba(17, 232, 246, 0.25), 0 10px 24px rgba(0, 0, 0, 0.28)',
    },
    deploy: {
      background: 'linear-gradient(135deg, var(--color-cyan-neon), var(--color-teal-neon))',
      color: 'var(--color-void)',
      boxShadow: '0 0 0 1px rgba(17, 232, 246, 0.3), 0 10px 24px rgba(0, 0, 0, 0.28)',
    },
  };

  const content = (
    <motion.span
      className={`${baseStyles} ${className}`}
      style={variants[variant]}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 0 22px rgba(17, 232, 246, 0.45)',
      }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.span>
  );

  if (to) {
    return <Link to={to} className="no-underline">{content}</Link>;
  }
  return <button onClick={onClick} className="border-0 bg-transparent p-0 cursor-pointer">{content}</button>;
}

export function GhostButton({ children, to, onClick, className = '' }) {
  const baseStyles =
    'inline-flex items-center gap-2 px-6 py-3 font-display text-sm font-semibold tracking-[0.12em] uppercase cursor-pointer rounded-[8px] no-underline transition-all duration-300';

  const content = (
    <motion.span
      className={`${baseStyles} ghost-border ${className}`}
      style={{
        background: 'rgba(17, 43, 73, 0.45)',
        color: 'var(--color-text-primary)',
      }}
      whileHover={{
        borderColor: 'rgba(0, 242, 255, 0.6)',
        boxShadow: '0 0 12px rgba(0, 242, 255, 0.15)',
        scale: 1.03,
      }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.span>
  );

  if (to) {
    return <Link to={to} className="no-underline">{content}</Link>;
  }
  return <button onClick={onClick} className="border-0 bg-transparent p-0 cursor-pointer">{content}</button>;
}
