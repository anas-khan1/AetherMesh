import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import ProgressRing from '../components/ui/ProgressRing';
import DataTable from '../components/ui/DataTable';
import { securityOverview, certificates, securityAuditLog, accessControlEntries } from '../data/mockData';

const statusBadge = (status) => {
  const colors = { valid: 'var(--color-teal-neon)', expiring: 'var(--color-warning)', expired: 'var(--color-error-hot)', revoked: 'var(--color-error-hot)' };
  const c = colors[status] || 'var(--color-text-muted)';
  return (<span className="text-[10px] font-display font-bold tracking-wider uppercase px-2 py-0.5 rounded-full" style={{ color: c, backgroundColor: `${c}15`, border: `1px solid ${c}40` }}>{status}</span>);
};

const actionColor = (action) => {
  const map = { KEY_ROTATION: 'var(--color-cyan-neon)', AUTH_FAILURE: 'var(--color-error-hot)', CERT_RENEWAL: 'var(--color-teal-neon)', ACCESS_GRANT: 'var(--color-success)', FIREWALL_UPDATE: 'var(--color-warning)', POLICY_UPDATE: 'var(--color-cyan-primary)', ENCRYPTION: 'var(--color-cyan-neon)' };
  return map[action] || 'var(--color-text-muted)';
};

function EncryptionOverview() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={14} style={{ color: 'var(--color-cyan-neon)' }} />
        <h3 className="panel-title">Encryption Status</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Algorithm', value: securityOverview.encryptionAlgo },
          { label: 'Key Rotation', value: securityOverview.keyRotation },
          { label: 'TLS Version', value: securityOverview.tlsVersion },
          { label: 'Last Audit', value: securityOverview.lastAudit },
          { label: 'Active Sessions', value: securityOverview.activeSessions },
          { label: 'Threat Level', value: securityOverview.threatLevel },
        ].map((m) => (
          <div key={m.label} className="panel-soft p-3">
            <div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{m.label}</div>
            <div className="text-sm font-display font-bold mt-1" style={{ color: m.label === 'Threat Level' && m.value === 'Low' ? 'var(--color-teal-neon)' : 'var(--color-cyan-primary)' }}>{m.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CertificateTable() {
  const cols = [
    { key: 'name', label: 'Certificate' },
    { key: 'issuer', label: 'Issuer' },
    { key: 'expiry', label: 'Expiry' },
    { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
    { key: 'fingerprint', label: 'Fingerprint' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Key size={14} style={{ color: 'var(--color-cyan-neon)' }} />
        <h3 className="panel-title">Certificate Management</h3>
      </div>
      <DataTable columns={cols} data={certificates} />
    </motion.div>
  );
}

function AccessControl() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={14} style={{ color: 'var(--color-cyan-neon)' }} />
        <h3 className="panel-title">Access Control</h3>
      </div>
      <div className="flex flex-col gap-3">
        {accessControlEntries.map((entry) => (
          <div key={entry.role} className="panel-soft p-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>{entry.role}</div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{entry.users} users · {entry.lastActive}</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.permissions.map((p) => (
                <span key={p} className="text-[9px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: 'var(--color-cyan-neon)', backgroundColor: 'rgba(17,232,246,0.08)', border: '1px solid rgba(17,232,246,0.2)' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AuditLog() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} style={{ color: 'var(--color-cyan-neon)' }} />
        <h3 className="panel-title">Audit Log</h3>
      </div>
      <div className="flex flex-col gap-2">
        {securityAuditLog.map((log, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.04 }} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(13,34,63,0.4)' }}>
            <span className="text-[9px] font-mono flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{log.time}</span>
            <span className="text-[10px] font-display font-bold tracking-wider uppercase flex-shrink-0" style={{ color: actionColor(log.action) }}>{log.action.replace('_', ' ')}</span>
            <span className="text-xs flex-1 min-w-0" style={{ color: 'var(--color-text-muted)' }}>{log.detail}</span>
            <span className="text-[9px] font-mono flex-shrink-0" style={{ color: log.status === 'blocked' ? 'var(--color-error-hot)' : 'var(--color-teal-neon)' }}>{log.status}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Security() {
  const statCards = [
    { icon: Shield, label: 'Compliance', value: `${securityOverview.complianceScore}%`, color: 'var(--color-cyan-neon)' },
    { icon: Lock, label: 'Encryption', value: securityOverview.encryptionAlgo, color: 'var(--color-teal-neon)' },
    { icon: Key, label: 'Cert Authority', value: securityOverview.certAuthority, color: 'var(--color-cyan-primary)' },
    { icon: Eye, label: 'Sessions', value: securityOverview.activeSessions, color: 'var(--color-warning)' },
  ];

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 md:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="kicker mb-2">Zero Trust</p>
              <h1 className="section-title">Security & Encryption</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Quantum-safe encryption, certificate management, and access control across the mesh.</p>
            </div>
            <div className="status-pill"><span className="status-dot" />Threat: {securityOverview.threatLevel}</div>
          </div>
        </motion.header>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }} className="panel p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(17,232,246,0.08)' }}><s.icon size={18} style={{ color: s.color }} /></div>
              <div><div className="text-lg font-display font-bold" style={{ color: s.color }}>{s.value}</div><div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div></div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <div className="flex flex-col gap-5">
            <CertificateTable />
            <AccessControl />
          </div>
          <div className="flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="panel p-5 flex flex-col items-center">
              <h3 className="panel-title mb-4 self-start">Compliance Score</h3>
              <ProgressRing value={securityOverview.complianceScore} size={120} stroke={8} label={`${securityOverview.complianceScore}%`} sublabel="Compliance" />
            </motion.div>
            <EncryptionOverview />
            <AuditLog />
          </div>
        </div>
      </div>
    </section>
  );
}
