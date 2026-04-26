import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Plus, AlertTriangle, CheckCircle2, Key, Download, Save, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import MetricCard from '../components/ui/MetricCard';
import LatencyChart from '../components/dashboard/LatencyChart';
import NodeHealthGrid from '../components/dashboard/NodeHealthGrid';
import NodeDetails from '../components/dashboard/NodeDetails';
import { sidebarNavItems, storageDistribution } from '../data/mockData';
import { useCluster } from '../context/ClusterContext';

const activityIcons = { plus: Plus, alert: AlertTriangle, check: CheckCircle2, key: Key, download: Download, save: Save };

function ThroughputHistoryChart({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full animate-glow" style={{ backgroundColor: 'var(--color-teal-neon)' }} />
        <h3 className="panel-title">Throughput History (24h)</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5CF2C6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5CF2C6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,232,246,0.06)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#8EA5BD', fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} unit=" GB/s" />
          <Tooltip contentStyle={{ background: 'rgba(12,30,55,0.95)', border: '1px solid rgba(17,232,246,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
          <Area type="monotone" dataKey="value" name="Throughput" stroke="#5CF2C6" fill="url(#throughputGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#5CF2C6', stroke: '#041329', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function StoragePie({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }} className="panel p-5">
      <h3 className="panel-title mb-2">Storage Distribution</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
            {data.map((entry, i) => (<Cell key={i} fill={entry.color} stroke="none" />))}
          </Pie>
          <Tooltip contentStyle={{ background: 'rgba(12,30,55,0.95)', border: '1px solid rgba(17,232,246,0.2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        {data.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] font-display tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{s.name} ({s.value}%)</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecentActivityFeed({ activity }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }} className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="panel-title">Recent Activity</h3>
        <Link to="/fault-logs" className="text-[10px] font-display tracking-wider uppercase flex items-center gap-1 no-underline" style={{ color: 'var(--color-cyan-neon)' }}>
          View All<ArrowUpRight size={10} />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {activity.map((a, i) => {
          const Icon = activityIcons[a.icon] || CheckCircle2;
          const typeColor = a.type === 'fault' ? 'var(--color-warning)' : a.type === 'deploy' ? 'var(--color-cyan-neon)' : 'var(--color-teal-neon)';
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + i * 0.05 }} className="flex items-start gap-3 py-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(17,232,246,0.08)' }}>
                <Icon size={13} style={{ color: typeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{a.msg}</p>
                <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>{a.time}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const {
    nodes,
    systemMetrics,
    throughputSeries,
    dashboardActivity,
    injectFault,
    requestDiagnostic,
  } = useCluster();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!selectedNode && nodes.length > 0) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const pieData = useMemo(() => {
    const healthy = nodes.filter((n) => n.status === 'healthy').length;
    const checking = nodes.filter((n) => n.status === 'checking' || n.status === 'loading').length;
    const fault = nodes.filter((n) => n.status === 'fault').length;
    return [
      { name: 'Healthy', value: healthy, color: '#11E8F6' },
      { name: 'Checking', value: checking, color: '#5CF2C6' },
      { name: 'Fault', value: fault, color: '#ff6b6b' },
      { name: 'Standby', value: Math.max(0, nodes.length - healthy - checking - fault), color: '#274565' },
    ];
  }, [nodes]);

  return (
    <section className="section-shell" style={{ paddingTop: '1.4rem' }}>
      <div className="shell workspace-grid">
        <Sidebar navItems={sidebarNavItems.map((item) => ({ ...item, active: item.label === 'Node Registry' }))} />

        <main className="flex flex-col gap-5 min-w-0">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="panel p-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          >
            <div>
              <p className="kicker mb-2">Node Operations</p>
              <h1 className="section-title">Cluster Control Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Throughput, latency, and node integrity across the active mesh.
              </p>
            </div>
            <div className="status-pill">
              <span className="status-dot" />
              {systemMetrics.activeNodes} of {systemMetrics.totalNodes} nodes online
            </div>
          </motion.header>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard label="Total Throughput" value={String(systemMetrics.totalThroughput)} unit="GB/s" delay={0} trend="up" />
            <MetricCard label="Active Nodes" value={String(systemMetrics.activeNodes)} suffix={`/ ${systemMetrics.totalNodes}`} delay={100} trend="stable" />
            <MetricCard label="Mesh Latency" value={String(systemMetrics.meshLatency)} unit="ms" delay={200} trend="down" />
            <MetricCard label="Data Resilience" value={String(systemMetrics.dataResilience)} suffix="%" delay={300} trend="stable" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-4">
            <LatencyChart />
            <NodeHealthGrid
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          </div>

          <NodeDetails
            node={selectedNode}
            onRequestDiagnostic={requestDiagnostic}
            onInjectFault={injectFault}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-4">
            <ThroughputHistoryChart data={throughputSeries} />
            <StoragePie data={pieData.length > 0 ? pieData : storageDistribution} />
          </div>

          <RecentActivityFeed activity={dashboardActivity} />
        </main>
      </div>
    </section>
  );
}
