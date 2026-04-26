import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Shield, Clock, RefreshCw, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SearchInput from '../components/ui/SearchInput';
import Timeline from '../components/ui/Timeline';
import { faultLogEntries, faultStats, faultTimeline } from '../data/mockData';

const severityColors = {
  CRITICAL: 'var(--color-error-hot)',
  ERROR: 'var(--color-error)',
  WARNING: 'var(--color-warning)',
  INFO: 'var(--color-cyan-neon)',
};

function FaultTimelineChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full animate-glow" style={{ backgroundColor: 'var(--color-cyan-neon)' }} />
        <h3 className="panel-title">Fault Frequency (24h)</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={faultTimeline}>
          <defs>
            <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.3} /><stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb4ab" stopOpacity={0.2} /><stop offset="100%" stopColor="#ffb4ab" stopOpacity={0.01} /></linearGradient>
            <linearGradient id="wrnGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb74d" stopOpacity={0.2} /><stop offset="100%" stopColor="#ffb74d" stopOpacity={0.01} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,232,246,0.06)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'rgba(12,30,55,0.95)', border: '1px solid rgba(17,232,246,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
          <Area type="monotone" dataKey="critical" name="Critical" stroke="#ff6b6b" fill="url(#critGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="error" name="Error" stroke="#ffb4ab" fill="url(#errGrad)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="warning" name="Warning" stroke="#ffb74d" fill="url(#wrnGrad)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function ActiveRecoveries() {
  const recoveries = [
    { node: 'AE-NODE-X056', issue: 'NVMe failure', progress: 78, eta: '~4 min' },
    { node: 'AE-NODE-X102', issue: 'Network partition', progress: 45, eta: '~8 min' },
    { node: 'AE-NODE-X019', issue: 'Memory overflow', progress: 92, eta: '~1 min' },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--color-cyan-neon)', animationDuration: '3s' }} />
        <h3 className="panel-title">Active Recoveries</h3>
      </div>
      <div className="flex flex-col gap-3">
        {recoveries.map((r) => (
          <div key={r.node} className="panel-soft p-3">
            <div className="flex justify-between mb-1"><span className="text-xs font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>{r.node}</span><span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>ETA: {r.eta}</span></div>
            <div className="text-[10px] font-mono mb-2" style={{ color: 'var(--color-text-muted)' }}>{r.issue}</div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${r.progress}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full" style={{ background: r.progress > 80 ? 'linear-gradient(90deg, var(--color-teal-neon), var(--color-success))' : 'linear-gradient(90deg, var(--color-cyan-neon), var(--color-teal-neon))' }} />
            </div>
            <div className="text-right mt-1"><span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>{r.progress}%</span></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function FaultLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeverity, setActiveSeverity] = useState('all');

  const filteredLogs = useMemo(() => {
    let logs = faultLogEntries;
    if (activeSeverity !== 'all') logs = logs.filter((l) => l.severity === activeSeverity);
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); logs = logs.filter((l) => l.message.toLowerCase().includes(q)); }
    return logs;
  }, [activeSeverity, searchQuery]);

  const statCards = [
    { icon: Clock, label: 'MTTR', value: faultStats.mttr, color: 'var(--color-cyan-primary)' },
    { icon: TrendingDown, label: 'Fault Rate', value: faultStats.faultRate, color: 'var(--color-teal-neon)' },
    { icon: Shield, label: 'Auto-Recovery', value: faultStats.autoRecoveryRate, color: 'var(--color-cyan-neon)' },
    { icon: Activity, label: 'Active Incidents', value: faultStats.activeIncidents, color: 'var(--color-error-hot)' },
  ];

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 md:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="kicker mb-2">Fault Tolerance</p>
              <h1 className="section-title">Fault Detection & Recovery</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Real-time fault monitoring. {faultStats.resolvedToday} incidents resolved today.</p>
            </div>
            {faultStats.criticalAlerts > 0 && (
              <div className="status-pill" style={{ borderColor: 'rgba(255,107,107,0.4)', backgroundColor: 'rgba(255,107,107,0.08)', color: 'var(--color-error-hot)' }}>
                <AlertCircle size={12} />{faultStats.criticalAlerts} Critical
              </div>
            )}
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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
          <div className="flex flex-col gap-5">
            <FaultTimelineChart />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="panel p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="panel-title">Event Log</h3>
                <div style={{ width: '180px' }}><SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search logs..." /></div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {['all', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'].map((sev) => (
                  <button key={sev} onClick={() => setActiveSeverity(sev)} className={`filter-btn${activeSeverity === sev ? ' active' : ''}`}>
                    {sev === 'all' ? `All (${faultLogEntries.length})` : `${sev} (${faultLogEntries.filter((l) => l.severity === sev).length})`}
                  </button>
                ))}
              </div>
              <Timeline items={filteredLogs} maxItems={15} />
            </motion.div>
          </div>
          <div className="flex flex-col gap-5">
            <ActiveRecoveries />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel p-5">
              <h3 className="panel-title mb-4">Faults by Region</h3>
              <div className="flex flex-col gap-3">
                {['US-EAST-1', 'US-WEST-2', 'EU-WEST-1', 'EU-CENTRAL-1', 'AP-SOUTH-1', 'AP-NORTH-1'].map((region) => {
                  const count = faultLogEntries.filter((l) => l.region === region && !l.resolved).length;
                  const total = faultLogEntries.filter((l) => l.region === region).length;
                  return (
                    <div key={region} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{region}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min((total / faultLogEntries.length) * 300, 100)}%`, background: count > 2 ? 'var(--color-error-hot)' : 'linear-gradient(90deg, var(--color-cyan-neon), var(--color-teal-neon))' }} />
                      </div>
                      <span className="text-[10px] font-mono w-12 text-right" style={{ color: count > 0 ? 'var(--color-warning)' : 'var(--color-text-subtle)' }}>{count} active</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="panel p-5">
              <h3 className="panel-title mb-4">Recovery Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'MTBF', value: faultStats.mtbf }, { label: 'MTTR', value: faultStats.mttr }, { label: 'Resolved Today', value: faultStats.resolvedToday }, { label: 'Shard Relocations', value: faultStats.shardRelocations }].map((m) => (
                  <div key={m.label} className="panel-soft p-3"><div className="text-[10px] font-display tracking-wider uppercase" style={{ color: 'var(--color-text-muted)' }}>{m.label}</div><div className="text-base font-display font-bold mt-1" style={{ color: 'var(--color-cyan-primary)' }}>{m.value}</div></div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
