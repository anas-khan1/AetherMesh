import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Server, Bell, Key, Shield, Info, Save, RotateCcw } from 'lucide-react';
import Toggle from '../components/ui/Toggle';
import { clusterConfig, settingsNotifications, apiKeys } from '../data/mockData';

function ClusterConfiguration() {
  const [config, setConfig] = useState(clusterConfig);
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
          <button className="icon-btn" title="Reset to defaults"><RotateCcw size={13} /></button>
          <button className="filter-btn active flex items-center gap-1.5"><Save size={11} />Save Changes</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {configItems.map((item) => (
          <div key={item.key} className="panel-soft p-3">
            <label className="text-[10px] font-display tracking-wider uppercase block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{item.label}</label>
            <input
              type={item.type}
              value={config[item.key]}
              onChange={(e) => setConfig((c) => ({ ...c, [item.key]: item.type === 'number' ? Number(e.target.value) : e.target.value }))}
              className="settings-input"
            />
          </div>
        ))}
      </div>
      <div className="subtle-divider mb-5" />
      <div className="flex flex-col gap-1">
        {toggleItems.map((item) => (
          <Toggle key={item.key} checked={config[item.key]} onChange={(v) => setConfig((c) => ({ ...c, [item.key]: v }))} label={item.label} description={item.desc} />
        ))}
      </div>
    </motion.div>
  );
}

function NotificationPreferences() {
  const [notifs, setNotifs] = useState(settingsNotifications);
  const handleToggle = (key, val) => { setNotifs((prev) => prev.map((n) => n.key === key ? { ...n, enabled: val } : n)); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-5"><Bell size={14} style={{ color: 'var(--color-cyan-neon)' }} /><h3 className="panel-title">Notification Preferences</h3></div>
      <div className="flex flex-col gap-1">
        {notifs.map((n) => (
          <Toggle key={n.key} checked={n.enabled} onChange={(v) => handleToggle(n.key, v)} label={n.label} description={n.description} />
        ))}
      </div>
    </motion.div>
  );
}

function APIKeyManagement() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2"><Key size={14} style={{ color: 'var(--color-cyan-neon)' }} /><h3 className="panel-title">API Keys</h3></div>
        <button className="filter-btn active">+ Generate New Key</button>
      </div>
      <div className="flex flex-col gap-3">
        {apiKeys.map((k) => (
          <div key={k.name} className="panel-soft p-3 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>{k.name}</div>
              <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{k.key}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>Last: {k.lastUsed}</div>
              <span className="text-[9px] font-display font-bold uppercase tracking-wider" style={{
                color: k.status === 'active' ? 'var(--color-teal-neon)' : 'var(--color-error-hot)',
              }}>{k.status}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SystemInfo() {
  const info = [
    { label: 'Version', value: 'Aether Mesh v2.4.1' },
    { label: 'Build', value: '#2026.04.10-rc3' },
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
            <ClusterConfiguration />
            <NotificationPreferences />
          </div>
          <div className="flex flex-col gap-5">
            <APIKeyManagement />
            <SystemInfo />
          </div>
        </div>
      </div>
    </section>
  );
}
