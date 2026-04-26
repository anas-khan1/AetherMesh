import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, User, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/network-map', label: 'Network' },
  { to: '/files', label: 'Files' },
  { to: '/health', label: 'Health' },
  { to: '/fault-logs', label: 'Faults' },
  { to: '/io-traffic', label: 'IO' },
  { to: '/security', label: 'Security' },
  { to: '/documentation', label: 'Docs' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="nav-shell"
    >
      <div className="shell nav-inner">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="nav-brand" onClick={() => setMenuOpen(false)}>
            Aether Mesh
          </NavLink>
          <span className="hidden xl:inline kicker" style={{ color: 'var(--color-text-subtle)' }}>
            Distributed File System
          </span>
        </div>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`} aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="nav-actions-desktop flex items-center gap-2">
            <button className="icon-btn" title="Notifications" aria-label="Notifications">
              <Bell size={15} />
            </button>
            <button className="icon-btn" title="Settings" aria-label="Settings">
              <Settings size={15} />
            </button>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-warning), var(--color-error-hot))',
                color: 'var(--color-void)',
              }}
              aria-label="User profile"
            >
              <User size={14} />
            </div>
          </div>
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </motion.header>
  );
}