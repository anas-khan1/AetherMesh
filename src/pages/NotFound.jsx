import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass, Radio } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="section-shell" style={{ paddingTop: '4rem', paddingBottom: '4rem', minHeight: '70vh' }}>
      <div className="shell flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          {/* Animated 404 */}
          <div className="relative">
            <motion.div
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-[clamp(8rem,20vw,14rem)] font-display font-bold select-none"
              style={{ color: 'var(--color-cyan-neon)' }}
            >
              404
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ border: '1px dashed rgba(17,232,246,0.2)' }}
              >
                <Compass size={28} style={{ color: 'var(--color-cyan-neon)', opacity: 0.6 }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 justify-center mb-4">
            <Radio size={14} className="animate-pulse" style={{ color: 'var(--color-error-hot)' }} />
            <span className="kicker" style={{ color: 'var(--color-error-hot)' }}>Signal Lost</span>
          </div>

          <h1 className="section-title mb-3">Node Not Found</h1>
          <p className="section-copy mx-auto text-center mb-8" style={{ maxWidth: '420px' }}>
            The requested endpoint does not exist in the mesh topology. The node may have been
            decommissioned or the route is invalid.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="filter-btn active flex items-center gap-2 no-underline"
              style={{
                background: 'linear-gradient(135deg, rgba(17,232,246,0.12), rgba(92,242,198,0.08))',
                borderColor: 'var(--color-cyan-neon)',
                color: 'var(--color-cyan-neon)',
                padding: '0.6rem 1.2rem',
              }}
            >
              <Home size={14} />
              Return Home
            </Link>
            <Link
              to="/dashboard"
              className="filter-btn flex items-center gap-2 no-underline"
              style={{ padding: '0.6rem 1.2rem' }}
            >
              <ArrowLeft size={14} />
              Go to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Decorative mesh lines */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewBox="0 0 600 200"
          className="w-full max-w-lg mt-12"
          style={{ height: '100px' }}
        >
          {Array.from({ length: 8 }, (_, i) => {
            const x1 = i * 80 + 20;
            const y1 = Math.sin(i * 0.8) * 40 + 100;
            const x2 = (i + 1) * 80 + 20;
            const y2 = Math.sin((i + 1) * 0.8) * 40 + 100;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#11E8F6" strokeWidth="0.5" strokeDasharray="3 3" />
                <circle cx={x1} cy={y1} r="3" fill="#11E8F6" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
        </motion.svg>
      </div>
    </section>
  );
}
