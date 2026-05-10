'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Week 1', completions: 2, credentials: 0 },
  { name: 'Week 2', completions: 5, credentials: 1 },
  { name: 'Week 3', completions: 8, credentials: 2 },
  { name: 'Week 4', completions: 12, credentials: 3 },
  { name: 'Week 5', completions: 18, credentials: 4 },
  { name: 'Week 6', completions: 24, credentials: 5 },
];

interface ModernChartProps {
  title?: string;
  subtitle?: string;
  height?: number;
}

export default function ModernChart({
  title = 'Learning Progress',
  subtitle = 'Last 6 weeks of activity',
  height = 350,
}: ModernChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 4 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="glass p-6 rounded-md"
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold mb-0.5">{title}</h3>
        <p className="text-xs text-foreground/50">{subtitle}</p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorCredentials" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="name" stroke="currentColor" style={{ fontSize: '11px' }} />
          <YAxis stroke="currentColor" style={{ fontSize: '11px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="completions"
            stroke="#1E3A8A"
            fillOpacity={1}
            fill="url(#colorCompletions)"
            name="Assessments"
            animationDuration={800}
            animationEasing="linear"
          />
          <Area
            type="monotone"
            dataKey="credentials"
            stroke="#0D9488"
            fillOpacity={1}
            fill="url(#colorCredentials)"
            name="Credentials"
            animationDuration={800}
            animationEasing="linear"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />
          <span className="text-foreground/60">Assessments Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
          <span className="text-foreground/60">Credentials Earned</span>
        </div>
      </div>
    </motion.div>
  );
}
