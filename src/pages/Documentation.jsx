import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import CodeBlock from '../components/ui/CodeBlock';
import {
  sidebarNavItems,
  docNavItems,
  erasureCodingCode,
  consensusLogs,
} from '../data/mockData';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45 },
  }),
};

function ErasureDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: 0.14 }}
      className="w-full py-5"
    >
      <svg viewBox="0 0 700 160" className="w-full" style={{ maxWidth: '680px' }}>
        <defs>
          <linearGradient id="ecLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#11E8F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5CF2C6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {[0, 1, 2].map((i) => (
          <g key={`src-${i}`}>
            <rect
              x={20}
              y={20 + i * 45}
              width={60}
              height={35}
              rx={4}
              fill="var(--color-console)"
              stroke="rgba(17,232,246,0.24)"
              strokeWidth="1"
            />
            <text
              x={50}
              y={42 + i * 45}
              textAnchor="middle"
              fill="var(--color-cyan-primary)"
              fontSize="11"
              fontFamily="var(--font-display)"
            >
              D{i + 1}
            </text>
          </g>
        ))}

        {[0, 1, 2].map((i) => (
          <line
            key={`arr1-${i}`}
            x1={85}
            y1={37 + i * 45}
            x2={200}
            y2={80}
            stroke="url(#ecLineGrad)"
            strokeWidth="1"
            strokeDasharray="4 3"
            style={{ animation: `dash-flow ${2 + i * 0.3}s linear infinite` }}
          />
        ))}

        <rect x={200} y={45} width={120} height={70} rx={4} fill="var(--color-console)" stroke="rgba(17,232,246,0.3)" strokeWidth="1" />
        <text x={260} y={72} textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontFamily="var(--font-display)" letterSpacing="0.1em">
          RS ENCODER
        </text>
        <rect x={215} y={82} width={40} height={20} rx={2} fill="var(--color-dim-deck)" stroke="rgba(17,232,246,0.15)" strokeWidth="1" />
        <rect x={265} y={82} width={40} height={20} rx={2} fill="var(--color-dim-deck)" stroke="rgba(17,232,246,0.15)" strokeWidth="1" />

        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`arr2-${i}`}
            x1={325}
            y1={80}
            x2={450}
            y2={15 + i * 33}
            stroke="url(#ecLineGrad)"
            strokeWidth="1"
            strokeDasharray="4 3"
            style={{ animation: `dash-flow ${2 + i * 0.2}s linear infinite` }}
          />
        ))}

        {['NODE A (Shard)', 'NODE B (Shard)', 'NODE C (Parity)', 'NODE D (Parity)', 'NODE E (Spare)'].map((label, i) => {
          const isParity = label.includes('Parity');
          const isSpare = label.includes('Spare');
          return (
            <g key={`out-${i}`}>
              <rect
                x={450}
                y={i * 33}
                width={130}
                height={26}
                rx={3}
                fill={isParity ? 'rgba(17,232,246,0.12)' : isSpare ? 'rgba(92,242,198,0.08)' : 'var(--color-console)'}
                stroke={isParity ? 'rgba(17,232,246,0.38)' : 'rgba(17,232,246,0.15)'}
                strokeWidth="1"
              />
              <text
                x={515}
                y={17 + i * 33}
                textAnchor="middle"
                fill={isParity ? 'var(--color-cyan-neon)' : 'var(--color-text-muted)'}
                fontSize="9"
                fontFamily="var(--font-display)"
                letterSpacing="0.05em"
              >
                {label}
              </text>
            </g>
          );
        })}

        <text x="515" y="152" textAnchor="middle" fill="var(--color-text-subtle)" fontSize="9" fontFamily="var(--font-mono)">
          FIG 01: Distributed fragment placement
        </text>
      </svg>
    </motion.div>
  );
}

function ConsensusLog() {
  const [visibleLogs, setVisibleLogs] = useState([]);

  useEffect(() => {
    const timers = consensusLogs.map((log, i) =>
      setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log]);
      }, 400 + i * 550)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="panel overflow-hidden"
    >
      <div
        className="px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: 'rgba(17, 232, 246, 0.08)', backgroundColor: 'var(--color-dim-deck)' }}
      >
        <span className="status-dot" />
        <span className="kicker" style={{ color: 'var(--color-text-muted)' }}>
          Consensus Live Output
        </span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed max-h-[220px] overflow-y-auto flex flex-col gap-1.5">
        {visibleLogs.map((log, i) => (
          <motion.div
            key={`${log.time}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span style={{ color: 'var(--color-text-subtle)' }}>{log.time} </span>
            <span style={{ color: log.level === 'WARN' ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 600 }}>
              {log.level}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}> {log.msg}</span>
          </motion.div>
        ))}
        <span className="inline-block w-2 h-4 animate-pulse-slow" style={{ backgroundColor: 'var(--color-cyan-neon)' }} />
      </div>
    </motion.div>
  );
}

function SafetyParams() {
  const params = [
    { label: 'Max Corrupt Nodes', value: '(n - 1) / 3' },
    { label: 'Recovery Latency', value: '~140ms' },
    { label: 'Hashing Algorithm', value: 'SHA-512' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.08 }}
      className="panel p-5 flex flex-col gap-4"
    >
      <h4 className="kicker" style={{ color: 'var(--color-text-muted)' }}>
        Safety Parameters
      </h4>
      {params.map((p) => (
        <div key={p.label} className="flex items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.label}</span>
          <span className="text-sm font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>
            {p.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

function ActiveConsensus() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.16 }}
      className="panel p-5 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <span className="status-dot" />
        <h4 className="kicker" style={{ color: 'var(--color-text-muted)' }}>
          Active Consensus
        </h4>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        Cluster <span style={{ color: 'var(--color-cyan-neon)' }}>US-EAST-01</span> is verifying block integrity across{' '}
        <span style={{ color: 'var(--color-cyan-primary)' }}>12,042</span> distributed nodes.
      </p>

      <div className="relative h-20 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-deep)' }}>
        <svg viewBox="0 0 200 80" className="w-full h-full opacity-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <circle key={i} cx={25 + (i % 4) * 50} cy={i < 4 ? 25 : 55} r={3} fill="var(--color-cyan-neon)">
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {[[0, 4], [1, 5], [2, 6], [3, 7], [0, 1], [4, 5], [1, 2], [5, 6], [2, 3], [6, 7]].map(([a, b], i) => {
            const coords = Array.from({ length: 8 }).map((_, j) => ({
              x: 25 + (j % 4) * 50,
              y: j < 4 ? 25 : 55,
            }));

            return (
              <line
                key={i}
                x1={coords[a].x}
                y1={coords[a].y}
                x2={coords[b].x}
                y2={coords[b].y}
                stroke="var(--color-cyan-neon)"
                strokeOpacity="0.15"
                strokeWidth="1"
                strokeDasharray="3 2"
                style={{ animation: `dash-flow ${3 + i * 0.2}s linear infinite` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="kicker" style={{ color: 'var(--color-text-subtle)' }}>
            Cluster Mesh
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DemoPlaybook() {
  const steps = [
    'Open File Explorer and upload a file (for example 512 MB).',
    'Select the file to inspect data shards, parity shards, and node replica placement.',
    'Click a replica badge to inject fault on that specific node.',
    'Go to Fault Logs to show active incident and recovery progression.',
    'Return to File Explorer and watch HEAL events as shards are re-replicated.',
    'Open Network Map and Node Health to show node status transitions live.',
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={2}
      className="panel p-5 md:p-6"
    >
      <h2 className="panel-title mb-3" style={{ color: 'var(--color-cyan-primary)' }}>
        Simulation Demo Playbook
      </h2>
      <div className="flex flex-col gap-2">
        {steps.map((step, idx) => (
          <div key={step} className="panel-soft p-3 flex items-start gap-3">
            <span className="text-xs font-display font-bold" style={{ color: 'var(--color-cyan-neon)' }}>
              {String(idx + 1).padStart(2, '0')}
            </span>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{step}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function BeginnerGlossary() {
  const items = [
    {
      term: 'Node',
      meaning: 'One computer/server in the cluster that stores data pieces and helps process requests.',
    },
    {
      term: 'Shard',
      meaning: 'A small piece of a file. Big files are split into many shards so storage and transfer are easier.',
    },
    {
      term: 'Parity Shard',
      meaning: 'A special extra shard used for recovery. If some normal shards are lost, parity helps rebuild missing data.',
    },
    {
      term: 'Replica',
      meaning: 'A copy of the same shard on another node. More replicas means better availability.',
    },
    {
      term: 'Syncing',
      meaning: 'The file is still being distributed and copied to enough nodes. It is not fully finished yet.',
    },
    {
      term: 'Synced',
      meaning: 'The file has completed distribution and has the required copies/parity for recovery.',
    },
    {
      term: 'Fault Tolerance',
      meaning: 'The system keeps working even if some nodes fail, by using replicas + parity + recovery logic.',
    },
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={2}
      className="panel p-5 md:p-6"
    >
      <h2 className="panel-title mb-3" style={{ color: 'var(--color-cyan-primary)' }}>
        Beginner Glossary (Simple Meanings)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.term} className="panel-soft p-3">
            <h3 className="text-sm font-display font-bold mb-1" style={{ color: 'var(--color-cyan-neon)' }}>
              {item.term}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.meaning}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function SimpleSystemFlow() {
  const flow = [
    'User uploads a file.',
    'System splits file into shards.',
    'System creates parity shards for recovery.',
    'Shards are copied to different nodes (replication).',
    'Status shows syncing until copies are complete.',
    'Status becomes synced when placement is complete.',
    'If a node fails, degraded replicas are detected.',
    'Auto-healing places new replicas on healthy nodes.',
    'System returns to stable state while staying available.',
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={3}
      className="panel p-5 md:p-6"
    >
      <h2 className="panel-title mb-3" style={{ color: 'var(--color-cyan-primary)' }}>
        How This System Works (Very Simple)
      </h2>
      <div className="flex flex-col gap-2">
        {flow.map((step, idx) => (
          <div key={step} className="panel-soft p-3 flex items-start gap-3">
            <span className="text-xs font-display font-bold" style={{ color: 'var(--color-teal-neon)' }}>
              {idx + 1}
            </span>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{step}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export default function Documentation() {
  const bftSteps = [
    { label: 'Pre-prepare', desc: 'Leader broadcasts a proposed block to validator nodes.' },
    { label: 'Prepare', desc: 'Validators confirm state and publish signed acknowledgements.' },
    { label: 'Commit', desc: 'The block is finalized and written to the shared ledger.' },
  ];

  return (
    <section className="section-shell" style={{ paddingTop: '1.4rem' }}>
      <div className="shell workspace-grid">
        <Sidebar navItems={sidebarNavItems} docItems={docNavItems} />

        <main className="min-w-0 flex flex-col gap-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="panel p-5 md:p-6">
            <p className="kicker mb-3" style={{ color: 'var(--color-text-subtle)' }}>
              Neural Net FS / V2.4 / Documentation
            </p>
            <h1 className="section-title mb-2">Fault Tolerance Architecture</h1>
            <p className="section-copy">
              Aether Mesh combines Reed-Solomon erasure coding with practical Byzantine fault tolerance to maintain
              consistency and recoverability in unreliable network conditions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 2xl:grid-cols-[1fr_300px] gap-5 items-start">
            <div className="panel p-5 md:p-6 flex flex-col gap-8">
              <BeginnerGlossary />

              <SimpleSystemFlow />

              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot" />
                  <h2 className="panel-title" style={{ color: 'var(--color-cyan-primary)' }}>
                    Erasure Coding
                  </h2>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  Data is split into <span style={{ color: 'var(--color-cyan-neon)' }}>n</span> fragments and extended with
                  parity fragments. Recovery is possible from any <span style={{ color: 'var(--color-cyan-neon)' }}>n</span>{' '}
                  valid fragments out of the full shard set.
                </p>
                <ErasureDiagram />
                <CodeBlock code={erasureCodingCode} language="go" filename="erasure_coding.go" />
              </motion.section>

              <div className="subtle-divider" />

              <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot" />
                  <h2 className="panel-title" style={{ color: 'var(--color-cyan-primary)' }}>
                    Byzantine Fault Tolerance
                  </h2>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-muted)' }}>
                  Consensus remains correct even if up to one-third of nodes are malicious, slow, or unreachable.
                </p>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-5">
                  <div className="flex flex-col gap-4">
                    {bftSteps.map((step) => (
                      <div key={step.label} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-teal-neon)' }} />
                        <div>
                          <span className="text-sm font-display font-bold" style={{ color: 'var(--color-cyan-primary)' }}>
                            {step.label}:
                          </span>{' '}
                          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ConsensusLog />
                </div>
              </motion.section>

              <DemoPlaybook />
            </div>

            <aside className="flex flex-col gap-5">
              <SafetyParams />
              <ActiveConsensus />
            </aside>
          </div>
        </main>
      </div>
    </section>
  );
}
