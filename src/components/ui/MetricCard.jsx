import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendConfig = {
  up: { icon: TrendingUp, color: 'var(--color-teal-neon)', label: '↑' },
  down: { icon: TrendingDown, color: 'var(--color-error-hot)', label: '↓' },
  stable: { icon: Minus, color: 'var(--color-text-muted)', label: '—' },
};

export default function MetricCard({ label, value, unit, suffix, delay = 0, trend }) {
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(value);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime - delay;
        if (elapsed < 0) { requestAnimationFrame(animate); return; }
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(eased * numericValue);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  const displayValue = numericValue >= 100
    ? Math.round(count)
    : count.toFixed(numericValue.toString().includes('.') ? numericValue.toString().split('.')[1]?.length || 0 : 0);

  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="glass rounded-xl p-5 flex flex-col gap-1 min-w-[180px] flex-1"
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-display tracking-[0.15em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {label}
        </span>
        {trendInfo && (
          <trendInfo.icon size={14} style={{ color: trendInfo.color }} />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-3xl font-display font-bold"
          style={{ color: 'var(--color-cyan-primary)' }}
        >
          {displayValue}
        </span>
        {unit && (
          <span className="text-sm font-display" style={{ color: 'var(--color-text-muted)' }}>
            {unit}
          </span>
        )}
        {suffix && (
          <span className="text-sm font-display" style={{ color: 'var(--color-text-muted)' }}>
            {suffix}
          </span>
        )}
      </div>
    </motion.div>
  );
}
