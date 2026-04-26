import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, ...props }) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -4, transition: { duration: 0.25 } },
        className: `glass rounded-xl ${className}`,
      }
    : { className: `glass rounded-xl ${className}` };

  return (
    <Component {...hoverProps} {...props}>
      {children}
    </Component>
  );
}
