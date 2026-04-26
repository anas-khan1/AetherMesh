import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Network, HardDrive, AlertTriangle, Gauge, ShieldCheck,
  BookOpen, Cpu, Code, BarChart3,
} from 'lucide-react';
import GlowButton from '../ui/GlowButton';

const iconMap = {
  hub: Network,
  storage: HardDrive,
  'alert-triangle': AlertTriangle,
  gauge: Gauge,
  'shield-check': ShieldCheck,
  'book-open': BookOpen,
  cpu: Cpu,
  code: Code,
  'bar-chart-3': BarChart3,
};

function SidebarLink({ item }) {
  const Icon = iconMap[item.icon] || Network;

  if (item.path) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      >
        <Icon size={15} />
        <span className="text-sm font-body">{item.label}</span>
      </NavLink>
    );
  }

  return (
    <motion.button
      className={`sidebar-link${item.active ? ' active' : ''}`}
      whileHover={{ x: 3 }}
      transition={{ duration: 0.16 }}
    >
      <Icon size={15} />
      <span className="text-sm font-body">{item.label}</span>
    </motion.button>
  );
}

export default function Sidebar({ navItems = [], docItems = [], onNavClick, onDocClick }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="panel sidebar-rail flex flex-col gap-4"
    >
      <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid rgba(17, 232, 246, 0.12)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-console)' }}>
          <Cpu size={18} style={{ color: 'var(--color-cyan-neon)' }} />
        </div>
        <div>
          <div className="text-sm font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>
            Core Node 01
          </div>
          <div className="status-pill mt-1">
            <span className="status-dot" />
            Optimal
          </div>
        </div>
      </div>

      {navItems.length > 0 && (
        <div className="flex flex-col gap-1 mb-4">
          <span className="kicker px-1" style={{ color: 'var(--color-text-subtle)' }}>
            Main Registry
          </span>
          {navItems.map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
        </div>
      )}

      {docItems.length > 0 && (
        <div className="flex flex-col gap-1 mb-5">
          <span className="kicker px-1" style={{ color: 'var(--color-text-subtle)' }}>
            Documentation
          </span>
          {docItems.map((item) => (
            <SidebarLink key={item.label} item={item} />
          ))}
        </div>
      )}

      <GlowButton variant="deploy" className="w-full justify-center text-xs mt-auto" to="/network-map">
        View Network Map
      </GlowButton>
    </motion.aside>
  );
}
