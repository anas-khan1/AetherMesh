import { motion } from 'framer-motion';
import { ArrowUpRight, Star, Grid3x3, ShieldCheck, CheckCircle2, Server, Database, Shield, Zap, Globe, Lock } from 'lucide-react';
import GlowButton, { GhostButton } from '../components/ui/GlowButton';
import CodeBlock from '../components/ui/CodeBlock';
import { yamlConfig } from '../data/mockData';
import { useCluster } from '../context/ClusterContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  { idx: '01', icon: Star, title: 'Self-Healing Nodes', desc: 'Autonomous cluster management detects failures in real time and redistributes parity shards without manual intervention.', link: 'View Network Map', to: '/network-map' },
  { idx: '02', icon: Grid3x3, title: 'Zero-Downtime Replication', desc: 'Cross-region synchronization keeps data available even during full cluster outages in a single region.', link: 'View IO Traffic', to: '/io-traffic' },
  { idx: '03', icon: ShieldCheck, title: 'Quantum-Safe Encryption', desc: 'Lattice-based cryptography protects metadata and payload channels against long-term computational threats.', link: 'Security Dashboard', to: '/security' },
];

const checkpoints = [
  { label: 'API First', desc: 'Fully documented OpenAPI endpoints.' },
  { label: 'POSIX Ready', desc: 'Mount distributed storage like a local drive.' },
  { label: 'Zero Trust', desc: 'Encryption enabled by default for every stream.' },
];

const howItWorks = [
  { icon: Database, step: '01', title: 'Fragment & Encode', desc: 'Data is split into shards and encoded with Reed-Solomon erasure coding for redundancy.' },
  { icon: Globe, step: '02', title: 'Distribute & Replicate', desc: 'Shards are distributed across multiple nodes and regions with configurable replication factors.' },
  { icon: Shield, step: '03', title: 'Heal & Recover', desc: 'Byzantine fault tolerance ensures consistency even if nodes fail, with automatic shard redistribution.' },
];

function MeshVisualization() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.28, duration: 0.75 }}
      className="panel relative w-full max-w-[460px] aspect-square p-4"
    >
      <div className="h-full w-full rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-deep)' }}>
        <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(17, 232, 246, 0.12)' }}>
          <span className="kicker">Mesh Topology</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-subtle)' }}>ACTIVE 24/7</span>
        </div>

        <svg viewBox="0 0 400 400" className="w-full h-full p-6" style={{ marginTop: '-1.4rem' }}>
          <defs>
            <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#11E8F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#11E8F6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#11E8F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#5CF2C6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="200" r="140" fill="url(#meshGlow)" />
          <circle cx="200" cy="200" r="100" fill="none" stroke="#11E8F6" strokeOpacity="0.1" strokeWidth="1" />
          <circle cx="200" cy="200" r="60" fill="none" stroke="#11E8F6" strokeOpacity="0.08" strokeWidth="1" />

          {[
            [200, 100, 300, 170], [200, 100, 100, 170], [300, 170, 260, 280],
            [100, 170, 140, 280], [260, 280, 140, 280], [200, 100, 200, 200],
            [300, 170, 200, 200], [100, 170, 200, 200], [140, 280, 200, 200],
            [260, 280, 200, 200],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 3" style={{ animation: `dash-flow ${2 + i * 0.28}s linear infinite` }} />
          ))}

          {[
            { cx: 200, cy: 200, r: 8, primary: true },
            { cx: 200, cy: 100, r: 5 }, { cx: 300, cy: 170, r: 5 },
            { cx: 100, cy: 170, r: 5 }, { cx: 260, cy: 280, r: 5 },
            { cx: 140, cy: 280, r: 5 },
          ].map((n, i) => (
            <g key={i}>
              <circle cx={n.cx} cy={n.cy} r={n.r * 2.4} fill="#11E8F6" opacity="0.08">
                <animate attributeName="r" values={`${n.r * 2};${n.r * 3.2};${n.r * 2}`} dur={`${3 + i * 0.45}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.08;0.15;0.08" dur={`${3 + i * 0.45}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.primary ? '#11E8F6' : '#5CF2C6'} />
            </g>
          ))}

          {/* Animated data packets */}
          {[[200, 100, 200, 200], [300, 170, 200, 200], [100, 170, 200, 200]].map(([x1, y1, x2, y2], i) => (
            <circle key={`pkt-${i}`} r="2" fill="#5CF2C6">
              <animateMotion dur={`${2.5 + i * 0.5}s`} repeatCount="indefinite" path={`M${x1},${y1} L${x2},${y2}`} />
              <animate attributeName="opacity" values="0;1;1;0" dur={`${2.5 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          ))}

          <text x="200" y="344" textAnchor="middle" fill="#8EA5BD" fontSize="10" fontFamily="var(--font-display)" letterSpacing="0.1em">
            6 regions • 130 nodes • fault tolerant
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

function StatsTicker({ metrics }) {
  const stats = [
    { label: 'Active Shards', value: metrics.activeShards.toLocaleString() },
    { label: 'Connected Nodes', value: metrics.connectedNodes.toLocaleString() },
    { label: 'Global Throughput', value: `${metrics.globalThroughput} GB/s` },
    { label: 'Total Storage', value: metrics.totalStorage },
  ];

  return (
    <section className="section-shell" style={{ paddingBlock: '1.15rem' }}>
      <div className="shell panel px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="status-pill">
          <span className="status-dot" />
          Network Running
        </div>
        <div className="flex flex-wrap items-center gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-lg font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>{s.value}</span>
              <span className="text-[10px] font-display uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <span className="text-[11px] font-mono" style={{ color: 'var(--color-text-muted)' }}>Uptime {metrics.uptime}</span>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section-shell">
      <div className="shell">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <p className="kicker mb-3">Architecture</p>
          <h2 className="section-title mb-3">How Fault Tolerance Works</h2>
          <p className="section-copy mx-auto text-center">
            Three-phase process ensures your data survives any failure scenario — from single node crashes to entire region outages.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {howItWorks.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.48 }}
              className="panel p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
            >
              <div className="absolute top-3 right-4 text-4xl font-display font-bold" style={{ color: 'var(--color-focus)' }}>{item.step}</div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(17, 232, 246, 0.09)' }}>
                <item.icon size={24} style={{ color: 'var(--color-cyan-neon)' }} />
              </div>
              <h3 className="text-base font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section-shell">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="panel p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(17, 232, 246, 0.1), transparent 60%)' }} />
          <div className="relative z-10">
            <p className="kicker mb-3">Get Started</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-display font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Ready to Deploy Fault-Tolerant Storage?
            </h2>
            <p className="section-copy mx-auto text-center mb-6">
              Start building resilient distributed storage infrastructure in minutes. Full dashboard, real-time monitoring, and automatic fault recovery included.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <GlowButton to="/dashboard">Launch Dashboard</GlowButton>
              <GhostButton to="/documentation">Read Documentation</GhostButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { systemMetrics } = useCluster();

  return (
    <div>
      {/* Hero */}
      <section className="section-shell pt-14 lg:pt-20">
        <div className="shell grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0} className="kicker mb-5">
              Distributed File System V2.4
            </motion.p>
            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="font-display font-bold leading-[1.04] mb-5 text-[clamp(2.3rem,5vw,4.2rem)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Fault Tolerant
              <br />
              <span className="glow-text" style={{ color: 'var(--color-cyan-neon)' }}>Distributed Storage</span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="section-copy mb-8">
              Develop a distributed file system that ensures data availability and integrity across multiple nodes.
              The system incorporates fault tolerance mechanisms to handle node failures gracefully.
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-wrap items-center gap-3">
              <GlowButton to="/dashboard">Launch Dashboard</GlowButton>
              <GhostButton to="/network-map">View Network</GhostButton>
            </motion.div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <MeshVisualization />
          </div>
        </div>
      </section>

      <StatsTicker metrics={systemMetrics} />

      {/* Features */}
      <section className="section-shell">
        <div className="shell">
          <h2 className="section-title mb-3">Engineered for Redundancy</h2>
          <p className="section-copy mb-10">
            Every data segment is fragmented, encrypted, and replicated across independent clusters,
            giving Aether Mesh predictable recovery under failure scenarios.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.article
                key={f.idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.48 }}
                whileHover={{ y: -6 }}
                className="panel p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(17, 232, 246, 0.09)' }}>
                    <f.icon size={19} style={{ color: 'var(--color-cyan-neon)' }} />
                  </div>
                  <span className="text-3xl font-display font-bold" style={{ color: 'var(--color-focus)' }}>{f.idx}</span>
                </div>
                <h3 className="text-base font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
                <div className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.11em] font-display" style={{ color: 'var(--color-cyan-neon)' }}>
                  {f.link}
                  <ArrowUpRight size={12} />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* CLI Section */}
      <section className="section-shell" style={{ background: 'linear-gradient(180deg, rgba(13,34,63,0.24), rgba(13,34,63,0.08))' }}>
        <div className="shell grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
            <CodeBlock code={yamlConfig} language="yaml" filename="aether_mesh_config.yml" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.08 }} className="panel p-6 flex flex-col gap-5">
            <h2 className="section-title">CLI-Driven Architecture</h2>
            <p className="section-copy">
              Built for platform teams. Aether Mesh integrates with Kubernetes workflows through
              native CSI support and a complete API surface for automation.
            </p>
            <div className="flex flex-col gap-4">
              {checkpoints.map((cp) => (
                <div key={cp.label} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-teal-neon)' }} />
                  <div>
                    <span className="text-sm font-display font-bold" style={{ color: 'var(--color-cyan-neon)' }}>{cp.label}:</span>{' '}
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{cp.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
