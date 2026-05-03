import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Bell, Key, Info, Save, RotateCcw, Copy, Trash2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Toggle from '../components/ui/Toggle';
import { useCluster } from '../context/ClusterContext';

function SettingsToast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-[60] px-5 py-3 rounded-xl font-display text-sm font-bold tracking-wide flex items-center gap-2"
          style={{
            background: toast.type === 'error'
              ? 'linear-gradient(135deg, rgba(255,107,107,0.9), rgba(200,50,50,0.95))'
              : toast.type === 'warning'
                ? 'linear-gradient(135deg, rgba(255,183,77,0.9), rgba(220,150,30,0.95))'
                : 'linear-gradient(135deg, rgba(92,242,198,0.9), rgba(17,232,246,0.95))',
            color: toast.type === 'error' ? '#fff' : '#041329',
            boxShadow: toast.type === 'error'
              ? '0 8px 32px rgba(255,107,107,0.4)'
              : '0 8px 32px rgba(92,242,198,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <CheckCircle2 size={16} />
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ClusterConfiguration({ config, onConfigChange, onReset, onSave }) {
  const configItems = [
    { key: 'replicationFactor', label: 'Replication Factor', type: 'number' },
    { key: 'shardParity', label: 'Shard Parity', type: 'number' },
    { key: 'gossipFrequency', label: 'Gossip Frequency', type: 'text' },
    { key: 'heartbeatInterval', label: 'Heartbeat Interval', type: 'text' },
    { key: 'heartbeatTimeout', label: 'Heartbeat Timeout', type: 'text' },
    { key: 'maxShardSize', label: 'Max Shard Size', type: 'text' },
    { key: 'consensusAlgorithm', label: 'Consensus Algorithm', type: 'text' },
    { key: 'compressionAlgo', label: 'Compression', type: 'text' },
  ];
  const toggleItems = [
    { key: 'encryptionEnabled', label: 'End-to-End Encryption', desc: 'AES-XTS-512 encryption for all data in transit and at rest' },
    { key: 'autoHealingEnabled', label: 'Auto-Healing', desc: 'Automatically redistribute shards when node failures are detected' },
    { key: 'crossRegionSync', label: 'Cross-Region Sync', desc: 'Synchronize data across all active regions in real-time' },
    { key: 'deduplicationEnabled', label: 'Data Deduplication', desc: 'Remove duplicate data blocks to save storage space' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2"><Server size={14} style={{ color: 'var(--color-cyan-neon)' }} /><h3 className="panel-title">Cluster Configuration</h3></div>
        <div className="flex items-center gap-2">
          <button className="icon-btn" title="Reset to defaults" onClick={onReset}><RotateCcw size={13} /></button>
          <button className="filter-btn active flex items-center gap-1.5" onClick={onSave}><Save size={11} />Save Changes</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {configItems.map((item) => (
          <div key={item.key} className="panel-soft p-3">
            <label className="text-[10px] font-display tracking-wider uppercase block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{item.label}</label>
            <input
              type={item.type}
              value={config[item.key]}
              onChange={(e) => onConfigChange({ [item.key]: item.type === 'number' ? Number(e.target.value) : e.target.value })}
              className="settings-input"
            />
          </div>
        ))}
      </div>
      <div className="subtle-divider mb-5" />
      <div className="flex flex-col gap-1">
        {toggleItems.map((item) => (
          <Toggle key={item.key} checked={config[item.key]} onChange={(v) => onConfigChange({ [item.key]: v })} label={item.label} description={item.desc} />
        ))}
      </div>
    </motion.div>
  );
}

function NotificationPreferences({ notifs, onToggle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-5"><Bell size={14} style={{ color: 'var(--color-cyan-neon)' }} /><h3 className="panel-title">Notification Preferences</h3></div>
      <div className="flex flex-col gap-1">
        {notifs.map((n) => (
          <Toggle key={n.key} checked={n.enabled} onChange={(v) => onToggle(n.key, v)} label={n.label} description={n.description} />
        ))}
      </div>
    </motion.div>
  );
}

function APIKeyManagement({ apiKeys, onGenerateKey, onDeleteKey, onRevokeKey }) {
  const [copiedId, setCopiedId] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState(new Set());

  const handleCopy = useCallback((key, name) => {
    const fullKey = key.replace('****', Math.random().toString(36).slice(2, 10));
    navigator.clipboard.writeText(fullKey).catch(() => {});
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const toggleReveal = useCallback((name) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); } else { next.add(name); }
      return next;
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2"><Key size={14} style={{ color: 'var(--color-cyan-neon)' }} /><h3 className="panel-title">API Keys</h3></div>
        <button className="filter-btn active" onClick={onGenerateKey}>+ Generate New Key</button>
      </div>
      <p className="text-[11px] mb-4" style={{ color: 'var(--color-text-subtle)' }}>
        API keys authenticate external services with the mesh cluster. Copy keys to use in your application config.
      </p>
      <div className="flex flex-col gap-3">
        {apiKeys.map((k) => {
          const isRevealed = revealedKeys.has(k.name);
          const displayKey = isRevealed ? k.key.replace('****', Math.random().toString(36).slice(2, 10)) : k.key;
          return (
            <div key={k.name + k.created} className="panel-soft p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>{k.name}</div>
                  <div className="text-xs font-mono mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="truncate">{displayKey}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>Created: {k.created}</span>
                    <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>Last: {k.lastUsed}</span>
                    <span className="text-[9px] font-display font-bold uppercase tracking-wider" style={{ color: k.status === 'active' ? 'var(--color-teal-neon)' : 'var(--color-error-hot)' }}>{k.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="icon-btn" title={isRevealed ? 'Hide key' : 'Reveal key'} onClick={() => toggleReveal(k.name)}>
                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    className="icon-btn"
                    title="Copy key"
                    onClick={() => handleCopy(k.key, k.name)}
                    style={copiedId === k.name ? { color: 'var(--color-teal-neon)' } : undefined}
                  >
                    <Copy size={13} />
                  </button>
                  {k.status === 'active' && onRevokeKey && (
                    <button className="icon-btn" title="Revoke key" onClick={() => onRevokeKey(k.name)} style={{ color: 'var(--color-warning)' }}>
                      <Key size={13} />
                    </button>
                  )}
                  {onDeleteKey && (
                    <button className="icon-btn" title="Delete key" onClick={() => onDeleteKey(k.name)} style={{ color: 'var(--color-error-hot)' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {copiedId === k.name && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-display mt-1.5" style={{ color: 'var(--color-teal-neon)' }}>
                  ✓ Copied to clipboard
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SystemInfo() {
  const info = [
    { label: 'Version', value: 'Aether Mesh v2.4.1' },
    { label: 'Build', value: `#${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(new Date().getDate()).padStart(2, '0')}-rc3` },
    { label: 'Protocol', value: 'PBFT + Gossip v3' },
    { label: 'Runtime', value: 'Go 1.23 / gRPC' },
    { label: 'OS', value: 'Linux 6.8 (kernel)' },
    { label: 'Uptime', value: '401 days' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4"><Info size={14} style={{ color: 'var(--color-cyan-neon)' }} /><h3 className="panel-title">System Information</h3></div>
      <div className="grid grid-cols-2 gap-3">
        {info.map((i) => (
          <div key={i.label} className="panel-soft p-3">
            <div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{i.label}</div>
            <div className="text-sm font-mono mt-1" style={{ color: 'var(--color-cyan-primary)' }}>{i.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Settings() {
  const {
    config,
    notificationPrefs,
    keys,
    updateConfig,
    resetConfig,
    toggleNotification,
    generateApiKey,
    deleteKey,
    revokeKey,
  } = useCluster();

  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSave = useCallback(() => {
    showToast('✓ Configuration saved successfully');
  }, [showToast]);

  const handleReset = useCallback(() => {
    resetConfig();
    showToast('Configuration reset to defaults', 'warning');
  }, [resetConfig, showToast]);

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 md:p-6 mb-5">
          <p className="kicker mb-2">Configuration</p>
          <h1 className="section-title">System Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage cluster configuration, notifications, API keys, and system preferences.</p>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
          <div className="flex flex-col gap-5">
            <ClusterConfiguration config={config} onConfigChange={updateConfig} onReset={handleReset} onSave={handleSave} />
            <NotificationPreferences notifs={notificationPrefs} onToggle={toggleNotification} />
          </div>
          <div className="flex flex-col gap-5">
            <APIKeyManagement apiKeys={keys} onGenerateKey={generateApiKey} onDeleteKey={deleteKey} onRevokeKey={revokeKey} />
            <SystemInfo />
          </div>
        </div>
      </div>

      <SettingsToast toast={toast} />
    </section>
  );
}
