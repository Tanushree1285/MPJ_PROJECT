import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react';

interface HealthData {
  score: number;
  healthLevel: string;
  spendingByCategory: Record<string, number>;
  totalSpentThisMonth: number;
  totalSpentLastMonth: number;
  spendingGrowthRate: number;
  insight: string;
  alert: string | null;
}

interface Props {
  data: HealthData | null;
  loading: boolean;
}

const HealthScoreWidget: React.FC<Props> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="glass-card p-6 rounded-[32px] flex flex-col items-center justify-center space-y-4 animate-pulse aspect-square">
        <div className="w-24 h-24 rounded-full border-4 border-slate-100" />
        <div className="h-4 w-24 bg-slate-100 rounded-full" />
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 80) return '#10b981'; // green-500
    if (score > 50) return '#3b82f6'; // blue-500
    return '#f43f5e'; // rose-500
  };

  const color = getScoreColor(data.score);
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray * ((100 - data.score) / 100);

  return (
    <div className="glass-card p-6 rounded-[32px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap size={60} fill={color} className="text-transparent" />
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Animated Score Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="12"
              className="opacity-50"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: strokeDasharray }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-display font-bold text-slate-900"
            >
              {data.score}
            </motion.span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Score</span>
          </div>
        </div>

        {/* Insights Section */}
        <div className="w-full space-y-4">
          <div className="text-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
              data.score > 80 ? 'bg-green-50 text-green-600' : 
              data.score > 50 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <ShieldCheck size={12} />
              Status: {data.healthLevel}
            </span>
            <h3 className="text-sm font-display font-bold text-slate-900 leading-snug">
              {data.insight}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/50 rounded-xl p-2 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-0.5">
                {data.spendingGrowthRate > 0 ? <TrendingUp size={12} className="text-rose-500" /> : <TrendingDown size={12} className="text-green-500" />}
                <span className="text-[9px] font-bold uppercase tracking-tight">Growth</span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {data.spendingGrowthRate > 0 ? '+' : ''}{data.spendingGrowthRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-50/50 rounded-xl p-2 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Spent</p>
              <p className="text-xs font-bold text-slate-900">
                ${data.totalSpentThisMonth.toLocaleString()}
              </p>
            </div>
          </div>

          {/* New Category Breakdown Section */}
          <div className="space-y-2 pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Top Categories</p>
            <div className="space-y-1.5">
              {Object.entries(data.spendingByCategory)
                .filter(([cat]) => cat !== 'Income') // Don't show income in spending breakdown
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                    <span className="text-xs font-medium text-slate-600">{category}</span>
                    <span className="text-xs font-bold text-slate-900">${amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {data.alert && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-900 text-sm font-medium"
        >
          <AlertTriangle className="text-amber-500 shrink-0" size={18} />
          {data.alert}
        </motion.div>
      )}
    </div>
  );
};

export default HealthScoreWidget;
