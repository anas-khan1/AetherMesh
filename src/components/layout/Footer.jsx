import { Link } from 'react-router-dom';
import { Terminal, Network, Shield, Database } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/network-map', label: 'Network Map' },
    { to: '/files', label: 'File Explorer' },
    { to: '/health', label: 'Health Monitor' },
    { to: '/fault-logs', label: 'Fault Logs' },
    { to: '/security', label: 'Security' },
    { to: '/io-traffic', label: 'IO Traffic' },
    { to: '/documentation', label: 'Docs' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <footer className="mt-auto border-t" style={{ borderColor: 'rgba(17, 232, 246, 0.12)' }}>
      <div className="shell py-5">
        {/* Top row: links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[10px] font-display tracking-[0.12em] uppercase no-underline transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--color-cyan-neon)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-muted)')}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="subtle-divider mb-4" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-display tracking-[0.14em] uppercase" style={{ color: 'var(--color-text-muted)' }}>
              © {year} Aether Mesh Protocol
            </span>
            <span className="text-[10px] font-display tracking-[0.1em]" style={{ color: 'var(--color-text-subtle)' }}>
              Distributed File System with Fault Tolerance
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="status-pill">
              <span className="status-dot" />
              System Operational
            </span>
            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <Terminal size={14} />
              <Network size={14} />
              <Shield size={14} />
              <Database size={14} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}