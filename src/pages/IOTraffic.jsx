import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ArrowUpRight, ArrowDownRight, Minus, Zap, HardDrive, Network, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { throughputTimeSeries, iopsDistribution, bandwidthByRegion, topConsumers, latencyDistribution } from '../data/mockData';
import { useCluster } from '../context/ClusterContext';

const trendIcons = { up: ArrowUpRight, down: ArrowDownRight, stable: Minus };
const trendColors = { up: 'var(--color-cyan-neon)', down: 'var(--color-error-hot)', stable: 'var(--color-text-muted)' };

function ThroughputChart({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full animate-glow" style={{ backgroundColor: 'var(--color-cyan-neon)' }} />
        <h3 className="panel-title">Read/Write Throughput (24h)</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#11E8F6" stopOpacity={0.25} /><stop offset="100%" stopColor="#11E8F6" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="writeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5CF2C6" stopOpacity={0.2} /><stop offset="100%" stopColor="#5CF2C6" stopOpacity={0.01} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,232,246,0.06)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} unit=" MB/s" />
          <Tooltip contentStyle={{ background: 'rgba(12,30,55,0.95)', border: '1px solid rgba(17,232,246,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
          <Area type="monotone" dataKey="read" name="Read" stroke="#11E8F6" fill="url(#readGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="write" name="Write" stroke="#5CF2C6" fill="url(#writeGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function LatencyHistogram() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel p-5">
      <h3 className="panel-title mb-4">Latency Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={latencyDistribution} barGap={2}>
          <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'rgba(12,30,55,0.95)', border: '1px solid rgba(17,232,246,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
          <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
            {latencyDistribution.map((_, i) => (<Cell key={i} fill={i < 3 ? '#11E8F6' : i < 5 ? '#ffb74d' : '#ff6b6b'} fillOpacity={0.7} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function BandwidthTable() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="panel p-5">
      <h3 className="panel-title mb-4">Bandwidth by Region</h3>
      <div className="flex flex-col gap-3">
        {bandwidthByRegion.map((r) => (
          <div key={r.region} className="panel-soft p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>{r.region}</span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>Peak: {r.peak} MB/s</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[9px] font-display tracking-wider uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Inbound</div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(r.inbound / 500) * 100}%`, background: 'var(--color-cyan-neon)' }} />
                </div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{r.inbound} MB/s</div>
              </div>
              <div>
                <div className="text-[9px] font-display tracking-wider uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Outbound</div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-focus)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(r.outbound / 500) * 100}%`, background: 'var(--color-teal-neon)' }} />
                </div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{r.outbound} MB/s</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TopConsumersTable() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel p-5">
      <h3 className="panel-title mb-4">Top Consumers</h3>
      <div className="flex flex-col gap-2">
        {topConsumers.map((c, i) => {
          const TrendIcon = trendIcons[c.trend];
          return (
            <motion.div key={c.service} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.04 }} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(13,34,63,0.4)' }}>
              <span className="text-xs font-mono flex-1" style={{ color: 'var(--color-text-primary)' }}>{c.service}</span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>R:{c.reads}</span>
              <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>W:{c.writes}</span>
              <span className="text-[10px] font-display font-bold" style={{ color: 'var(--color-cyan-neon)' }}>{c.bandwidth}</span>
              <TrendIcon size={12} style={{ color: trendColors[c.trend] }} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function IOTraffic() {
  const { trafficSeries, systemMetrics } = useCluster();
  const totalRead = trafficSeries.reduce((s, d) => s + d.read, 0);
  const totalWrite = trafficSeries.reduce((s, d) => s + d.write, 0);

  const statCards = [
    { icon: Zap, label: 'Avg Read', value: `${Math.round(totalRead / 24)} MB/s`, color: 'var(--color-cyan-neon)' },
    { icon: HardDrive, label: 'Avg Write', value: `${Math.round(totalWrite / 24)} MB/s`, color: 'var(--color-teal-neon)' },
    { icon: Network, label: 'Total Bandwidth', value: `${Math.round((totalRead + totalWrite) / 24)} MB/s`, color: 'var(--color-cyan-primary)' },
    { icon: BarChart3, label: 'Avg Latency', value: `${systemMetrics.meshLatency} ms`, color: 'var(--color-warning)' },
  ];

  return (
    <section className="section-shell" style={{ paddingTop: '1.5rem' }}>
      <div className="shell">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 md:p-6 mb-5">
          <p className="kicker mb-2">IO Monitoring</p>
          <h1 className="section-title">IO Traffic Analysis</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Real-time read/write throughput, IOPS distribution, and bandwidth utilization across the mesh.</p>
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
            <ThroughputChart data={trafficSeries} />
            <LatencyHistogram />
            <TopConsumersTable />
          </div>
          <div className="flex flex-col gap-5">
            <BandwidthTable />
          </div>
        </div>
      </div>
    </section>
  );
}
