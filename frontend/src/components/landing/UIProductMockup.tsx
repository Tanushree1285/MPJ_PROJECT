import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

const UIProductMockup: React.FC = () => {
  return (
    <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-[120px] -z-10" />

      <div className="relative w-full h-full max-w-xl mx-auto flex flex-col items-center justify-center gap-6 p-4">
        {/* Banking Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: -8 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-[340px] h-[210px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative z-20 group"
        >
          <div className="flex justify-between items-start mb-12">
            <div className="w-12 h-10 bg-white/10 rounded-lg backdrop-blur-md border border-white/5 flex items-center justify-center">
              <CreditCard size={24} className="text-blue-400" />
            </div>
            <div className="text-lg font-bold tracking-tighter italic opacity-40">FinanceHub</div>
          </div>
          <div className="space-y-4">
            <div className="text-xl font-mono tracking-widest text-slate-300">••••  ••••  ••••  4821</div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Card Holder</p>
                <p className="text-sm font-bold">ALEX BENNETT</p>
              </div>
              <div className="w-12 h-8 bg-blue-500/20 rounded-md border border-blue-500/10" />
            </div>
          </div>
        </motion.div>

        {/* Transaction Snippet */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20 }}
          animate={{ opacity: 1, x: 60, y: -40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute right-0 top-1/2 bg-white rounded-2xl shadow-premium border border-slate-100 p-6 w-[280px] z-30 hidden lg:block"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Recent Activity</h4>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <ArrowUpRight size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Apple Store</p>
                  <p className="text-[10px] text-slate-400">Mar 12, 10:24 AM</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">-$99.00</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <ArrowDownLeft size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Salary Deposit</p>
                  <p className="text-[10px] text-slate-400">Mar 10, 09:00 AM</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-600">+$4,200.00</span>
            </div>
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          animate={{ opacity: 1, x: -60, y: 60 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute left-0 bottom-1/4 bg-white rounded-2xl shadow-premium border border-slate-100 p-4 w-[220px] z-10 hidden xl:flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">Identity Secured</p>
            <p className="text-[10px] text-slate-400">Full 256-bit encryption</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UIProductMockup;
