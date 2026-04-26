import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Upload, FolderTree, Database, Search, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TreeView from '../components/ui/TreeView';
import SearchInput from '../components/ui/SearchInput';
import { useCluster } from '../context/ClusterContext';

function FileDetailPanel({ file }) {
  if (!file) {
    return (
      <div className="panel p-6 flex flex-col items-center justify-center gap-3" style={{ minHeight: '300px' }}>
        <Database size={32} style={{ color: 'var(--color-focus)' }} />
        <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>Select a file to view its metadata and shard distribution.</p>
      </div>
    );
  }

  const statusColor = file.status === 'synced' ? 'var(--color-teal-neon)' : 'var(--color-warning)';

  return (
    <motion.div
      key={file.name}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="panel p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="panel-title" style={{ color: 'var(--color-cyan-primary)' }}>File Details</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full" style={{
          color: statusColor,
          backgroundColor: file.status === 'synced' ? 'rgba(92, 242, 198, 0.1)' : 'rgba(255, 183, 77, 0.1)',
          border: `1px solid ${file.status === 'synced' ? 'rgba(92, 242, 198, 0.3)' : 'rgba(255, 183, 77, 0.3)'}`,
        }}>
          {file.status}
        </span>
      </div>

      <div className="text-lg font-display font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{file.name}</div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Size', value: file.size },
          { label: 'Shards', value: file.shards },
          { label: 'Replicas', value: file.replicas },
          { label: 'Modified', value: file.modified },
        ].map((m) => (
          <div key={m.label} className="panel-soft p-3">
            <div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{m.label}</div>
            <div className="text-sm font-display font-bold mt-1" style={{ color: 'var(--color-cyan-primary)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="panel-soft p-3">
        <div className="text-[10px] font-display tracking-wider uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Checksum (SHA-512)</div>
        <div className="text-xs font-mono break-all" style={{ color: 'var(--color-text-primary)' }}>{file.checksum}</div>
      </div>

      {/* Shard distribution visual */}
      <div>
        <div className="text-[10px] font-display tracking-wider uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>Shard Distribution</div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: file.shards }, (_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-mono font-bold"
              style={{
                backgroundColor: i < file.replicas ? 'rgba(17, 232, 246, 0.15)' : 'rgba(92, 242, 198, 0.08)',
                border: `1px solid ${i < file.replicas ? 'rgba(17, 232, 246, 0.35)' : 'rgba(92, 242, 198, 0.2)'}`,
                color: i < file.replicas ? 'var(--color-cyan-neon)' : 'var(--color-teal-neon)',
              }}
            >
              S{i + 1}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StorageChart({ storageByRegion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.45 }}
      className="panel p-5"
    >
      <h3 className="panel-title mb-4">Storage by Region</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={storageByRegion} barGap={4}>
          <XAxis dataKey="region" tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} unit=" PB" />
          <Tooltip
            contentStyle={{
              background: 'rgba(12, 30, 55, 0.95)',
              border: '1px solid rgba(17, 232, 246, 0.2)',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <Bar dataKey="used" name="Used" radius={[4, 4, 0, 0]}>
            {storageByRegion.map((_, i) => (
              <Cell key={i} fill={`rgba(17, 232, 246, ${0.4 + i * 0.1})`} />
            ))}
          </Bar>
          <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} fill="rgba(39, 69, 101, 0.5)" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function UploadSimulation({ uploads }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.45 }}
      className="panel p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">Active Transfers</h3>
        <Upload size={14} style={{ color: 'var(--color-cyan-neon)' }} />
      </div>
      <div className="flex flex-col gap-3">
        {uploads.length === 0 && (
          <div className="panel-soft p-3 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            No active transfers. Use the upload simulator to add a file.
          </div>
        )}
        {uploads.map((u) => (
          <div key={u.id} className="panel-soft p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono truncate flex-1" style={{ color: 'var(--color-text-primary)' }}>{u.fileName}</span>
              <span className="text-[10px] font-mono ml-2" style={{ color: u.progress === 100 ? 'var(--color-teal-neon)' : 'var(--color-cyan-neon)' }}>{u.speed}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${u.progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: u.progress === 100
                    ? 'var(--color-teal-neon)'
                    : 'linear-gradient(90deg, var(--color-cyan-neon), var(--color-teal-neon))',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>Shards: {u.uploadedShards}/{u.shards}</span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>{u.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function FileExplorer() {
  const {
    fileTree,
    fileActivity,
    storageByRegion,
    systemMetrics,
    activeTransfers,
    uploadFile,
    config,
  } = useCluster();
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadName, setUploadName] = useState('project_checkpoint.bin');
  const [uploadSize, setUploadSize] = useState(256);

  const stats = useMemo(() => [
    { icon: Database, label: 'Total Storage', value: systemMetrics.totalStorage, color: 'var(--color-cyan-primary)' },
    { icon: HardDrive, label: 'Used', value: systemMetrics.usedStorage, color: 'var(--color-cyan-neon)' },
    { icon: FolderTree, label: 'Files Stored', value: systemMetrics.filesStored.toLocaleString(), color: 'var(--color-teal-neon)' },
    { icon: RefreshCw, label: 'Replication Factor', value: `${config.replicationFactor}x`, color: 'var(--color-warning)' },
  ], [config.replicationFactor, systemMetrics]);

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="panel p-5 md:p-6 mb-5"
        >
          <p className="kicker mb-2">Distributed Storage</p>
          <h1 className="section-title">File Explorer</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Browse, manage, and monitor files across the distributed mesh with real-time sync status.
          </p>
        </motion.header>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
              className="panel p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(17, 232, 246, 0.08)' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-lg font-display font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
          {/* Left: Tree + Activity */}
          <div className="flex flex-col gap-5">
            {/* File Tree */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="panel p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="panel-title">File System</h3>
                <div style={{ width: '220px' }}>
                  <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search files..." />
                </div>
              </div>
              <TreeView tree={fileTree} searchQuery={searchQuery} onSelectFile={setSelectedFile} selectedFile={selectedFile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4 }}
              className="panel p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="panel-title">Upload Simulator</h3>
                <Upload size={14} style={{ color: 'var(--color-cyan-neon)' }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
                <input
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="settings-input"
                  placeholder="filename.ext"
                />
                <input
                  value={uploadSize}
                  onChange={(e) => setUploadSize(Number(e.target.value) || 0)}
                  className="settings-input"
                  type="number"
                  min={8}
                  max={10240}
                />
                <button className="filter-btn active" onClick={() => uploadFile(uploadName, uploadSize)}>
                  Upload
                </button>
              </div>
              <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-subtle)' }}>
                Size is in MB. Shards are computed from max shard size and replication follows cluster config.
              </p>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="panel p-5"
            >
              <h3 className="panel-title mb-4">Recent File Activity</h3>
              <div className="flex flex-col gap-2">
                {fileActivity.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(13, 34, 63, 0.4)' }}
                  >
                    <span className="text-[10px] font-display font-bold tracking-wider uppercase px-1.5 py-0.5 rounded" style={{
                      color: a.action === 'DELETE' ? 'var(--color-error-hot)' : a.action === 'SYNC' || a.action === 'REPLICATE' ? 'var(--color-teal-neon)' : 'var(--color-cyan-neon)',
                      backgroundColor: a.action === 'DELETE' ? 'rgba(255, 107, 107, 0.1)' : 'rgba(17, 232, 246, 0.08)',
                    }}>
                      {a.action}
                    </span>
                    <span className="text-xs font-mono truncate flex-1" style={{ color: 'var(--color-text-primary)' }}>{a.file}</span>
                    <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>{a.node}</span>
                    <span className="text-[9px] font-mono flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }}>{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Detail panel + Charts */}
          <div className="flex flex-col gap-5">
            <FileDetailPanel file={selectedFile} />
            <UploadSimulation uploads={activeTransfers} />
            <StorageChart storageByRegion={storageByRegion} />
          </div>
        </div>
      </div>
    </section>
  );
}
