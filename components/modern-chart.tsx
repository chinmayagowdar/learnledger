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
  height = 400,
}: ModernChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass p-8 rounded-xl"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-foreground/60">{subtitle}</p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(84, 153, 255)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(84, 153, 255)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorCredentials" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(147, 112, 219)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(147, 112, 219)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="currentColor" style={{ fontSize: '12px' }} />
          <YAxis stroke="currentColor" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(20, 20, 40, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="completions"
            stroke="rgb(84, 153, 255)"
            fillOpacity={1}
            fill="url(#colorCompletions)"
            name="Assessments"
          />
          <Area
            type="monotone"
            dataKey="credentials"
            stroke="rgb(147, 112, 219)"
            fillOpacity={1}
            fill="url(#colorCredentials)"
            name="Credentials"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[rgb(84,153,255)]" />
          <span>Assessments Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[rgb(147,112,219)]" />
          <span>Credentials Earned</span>
        </div>
      </div>
    </motion.div>
  );
}
