import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { latencyData } from '../../data/mockData';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass rounded-sm px-3 py-2 text-xs font-mono"
      style={{ border: '1px solid rgba(0, 242, 255, 0.2)' }}
    >
      <div style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value}ms
        </div>
      ))}
    </div>
  );
}

export default function LatencyChart() {
  const [activeRegion, setActiveRegion] = useState('region01');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="panel p-5 flex-1 min-w-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-glow"
            style={{ backgroundColor: 'var(--color-cyan-neon)' }}
          />
          <h3 className="panel-title">
            System Latency (Real-Time)
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {['region01', 'lanTv'].map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`filter-btn ${activeRegion === region ? 'active' : ''}`}
            >
              {region === 'region01' ? 'Region 01' : 'LAN TV'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={latencyData}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F2FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00F2FF" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#56F3CF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#56F3CF" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0, 242, 255, 0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#849495', fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'rgba(0, 242, 255, 0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#849495', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            unit="ms"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={activeRegion}
            stroke="#00F2FF"
            strokeWidth={2}
            fill="url(#cyanGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: '#00F2FF',
              stroke: '#041329',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
