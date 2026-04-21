import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Target,
  Trash2,
  X,
  Check,
  Zap,
  TrendingUp,
  Trophy,
  Lock,
  Sparkles,
  ChevronRight,
  PiggyBank,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
interface Vault {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  color: string;          // Tailwind gradient pair
  createdAt: string;
  completedAt?: string;
}

interface Account {
  id: number;
  balance: number;
  currency: string;
}

/* ──────────────────────────────────────────────
   Constants
────────────────────────────────────────────── */
const VAULT_COLORS = [
  { label: 'Indigo',  gradient: 'from-primary-500 to-indigo-600',   bar: '#6366f1' },
  { label: 'Emerald', gradient: 'from-emerald-400 to-teal-600',     bar: '#10b981' },
  { label: 'Rose',    gradient: 'from-rose-400 to-pink-600',        bar: '#f43f5e' },
  { label: 'Amber',   gradient: 'from-amber-400 to-orange-500',     bar: '#f59e0b' },
  { label: 'Cyan',    gradient: 'from-cyan-400 to-sky-600',         bar: '#06b6d4' },
  { label: 'Violet',  gradient: 'from-violet-500 to-purple-700',    bar: '#7c3aed' },
];

const EMOJI_PRESETS = ['🚗','✈️','🏠','💻','🎓','💍','🏋️','🎮','📚','🌴','🛍️','🎸'];

const STORAGE_KEY = 'fh_vaults_v2';

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
const loadVaults = (userId: number): Vault[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveVaults = (userId: number, vaults: Vault[]) => {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(vaults));
};

/* ──────────────────────────────────────────────
   Subcomponents
────────────────────────────────────────────── */

/** Animated counter for numbers */
function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = prefix + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    });
    return controls.stop;
  }, [value]);

  return <span ref={ref}>{prefix}0.00</span>;
}

/** Liquid fill progress bar */
function LiquidBar({ percent, color }: { percent: number; color: string }) {
  const pct = Math.min(percent, 100);
  return (
    <div className="relative w-full h-6 bg-slate-100 rounded-2xl overflow-hidden">
      {/* Animated fill */}
      <motion.div
        className="absolute inset-y-0 left-0 rounded-2xl"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        {/* Wave shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>
      {/* Percentage label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black mix-blend-luminosity text-slate-700 uppercase tracking-widest">
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

/** Confetti burst when goal is reached */
function ConfettiRing() {
  const dots = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {dots.map(i => {
        const angle = (i / dots.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 60;
        const y = Math.sin(rad) * 60;
        const colors = ['#6366f1','#10b981','#f43f5e','#f59e0b','#06b6d4','#7c3aed'];
        return (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x, y, opacity: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Vaults Page
────────────────────────────────────────────── */
const Vaults: React.FC = () => {
  const { user } = useAuth();
  const uid: number = user?.id || (user as any)?.userId;

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState<Vault | null>(null);
  const [celebrating, setCelebrating] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newTarget, setNewTarget] = useState('');
  const [newColor, setNewColor] = useState(VAULT_COLORS[0]);

  // Deposit form
  const [depositAmt, setDepositAmt] = useState('');

  /* Load */
  useEffect(() => {
    if (!uid) return;
    setVaults(loadVaults(uid));

    api.get(`/accounts/primary/${uid}`)
      .then(r => setAccount(r.data))
      .catch(() => {});
  }, [uid]);

  /* Persist */
  const persist = (next: Vault[]) => {
    setVaults(next);
    saveVaults(uid, next);
  };

  /* Create Vault */
  const handleCreate = () => {
    if (!newName.trim()) return toast.error('Please add a vault name');
    if (!newTarget || parseFloat(newTarget) <= 0) return toast.error('Please set a valid target');

    const vault: Vault = {
      id: `v_${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      targetAmount: parseFloat(newTarget),
      savedAmount: 0,
      color: newColor.gradient,
      createdAt: new Date().toISOString(),
    };

    persist([vault, ...vaults]);
    setShowCreate(false);
    setNewName(''); setNewEmoji('🎯'); setNewTarget(''); setNewColor(VAULT_COLORS[0]);
    toast.success('Vault created! Start saving 🚀');
  };

  /* Deposit into vault */
  const handleDeposit = async () => {
    if (!showDeposit) return;
    const amount = parseFloat(depositAmt);
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    if (!account) return toast.error('Could not read account balance');
    if (amount > account.balance) return toast.error('Insufficient balance');

    const remaining = showDeposit.targetAmount - showDeposit.savedAmount;
    const actual = Math.min(amount, remaining);
    const newSaved = showDeposit.savedAmount + actual;
    const completed = newSaved >= showDeposit.targetAmount;

    const next = vaults.map(v =>
      v.id === showDeposit.id
        ? { ...v, savedAmount: newSaved, completedAt: completed ? new Date().toISOString() : undefined }
        : v
    );
    persist(next);

    // Optimistic balance update (no real backend TX for vault — it's a UI goal tracker)
    setAccount(prev => prev ? { ...prev, balance: prev.balance - actual } : prev);

    setShowDeposit(null);
    setDepositAmt('');

    if (completed) {
      setCelebrating(showDeposit.id);
      toast.success('🎉 Goal reached! Vault complete!', { duration: 4000, icon: '🏆' });
      setTimeout(() => setCelebrating(null), 3000);
    } else {
      toast.success(`Added $${actual.toFixed(2)} to "${showDeposit.name}"`);
    }
  };

  /* Delete Vault */
  const handleDelete = (id: string) => {
    persist(vaults.filter(v => v.id !== id));
    toast.success('Vault removed');
  };

  /* Stats */
  const totalSaved = vaults.reduce((s, v) => s + v.savedAmount, 0);
  const totalTarget = vaults.reduce((s, v) => s + v.targetAmount, 0);
  const completed = vaults.filter(v => v.savedAmount >= v.targetAmount).length;

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout title="Savings Vaults">
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-10">

        {/* ── Hero Banner ── */}
        <motion.div variants={item} className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-violet-600 via-indigo-700 to-primary-800 p-12 text-white shadow-2xl shadow-indigo-500/30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-violet-400/20 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-violet-300 font-black text-[10px] uppercase tracking-[0.3em]">
                <Sparkles size={14} /> AI Goal Tracker
              </div>
              <h2 className="text-4xl font-display font-black leading-tight">
                Your Savings<br/>Vaults
              </h2>
              <p className="text-violet-200 font-medium text-sm max-w-sm">
                Lock funds into dedicated goal buckets. Watch them fill up in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 min-w-[130px]">
                <p className="text-3xl font-display font-black">${totalSaved.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Total Saved</p>
              </div>
              <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 min-w-[130px]">
                <p className="text-3xl font-display font-black">{completed}/{vaults.length}</p>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">Goals Hit</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Vaults', value: vaults.length, icon: <PiggyBank size={20} />, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Total Goal', value: `$${totalTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: <Target size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Completed', value: completed, icon: <Trophy size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Avg Progress', value: vaults.length ? `${Math.round((totalSaved / Math.max(totalTarget, 1)) * 100)}%` : '0%', icon: <TrendingUp size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <motion.div key={s.label} variants={item} className="glass-card p-6 rounded-[28px] border-none shadow-premium bg-white">
              <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center ${s.color} mb-4`}>
                {s.icon}
              </div>
              <p className="text-2xl font-display font-bold text-slate-900">{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Vault Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-2xl font-display font-bold text-slate-900">Your Vaults</h3>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-700 transition-all"
            >
              <Plus size={18} /> New Vault
            </motion.button>
          </div>

          {vaults.length === 0 ? (
            <motion.div
              variants={item}
              onClick={() => setShowCreate(true)}
              className="relative p-16 border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center text-center space-y-5 hover:border-primary-300 hover:bg-primary-50/10 transition-all cursor-pointer group"
            >
              <div className="w-24 h-24 bg-slate-50 group-hover:bg-primary-50 rounded-[28px] flex items-center justify-center text-slate-200 group-hover:text-primary-400 transition-all shadow-inner text-5xl">
                🎯
              </div>
              <div>
                <h4 className="text-2xl font-display font-bold text-slate-900">No vaults yet</h4>
                <p className="text-slate-400 font-medium mt-1">Create your first savings vault to get started.</p>
              </div>
              <div className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/25">
                <Plus size={18} /> Create Vault
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {vaults.map(vault => {
                const pct = Math.min((vault.savedAmount / vault.targetAmount) * 100, 100);
                const completed = pct >= 100;
                const colorConf = VAULT_COLORS.find(c => c.gradient === vault.color) || VAULT_COLORS[0];
                const remaining = vault.targetAmount - vault.savedAmount;

                return (
                  <motion.div
                    key={vault.id}
                    variants={item}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className="relative glass-card rounded-[40px] overflow-hidden border-none shadow-premium bg-white flex flex-col"
                  >
                    {/* Confetti when just completed */}
                    {celebrating === vault.id && <ConfettiRing />}

                    {/* Card Top: Gradient header */}
                    <div className={`relative bg-gradient-to-br ${vault.color} p-8 text-white overflow-hidden`}>
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <span className="text-5xl mb-4 block">{vault.emoji}</span>
                          <h4 className="text-xl font-display font-black leading-tight">{vault.name}</h4>
                          {completed && (
                            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/30">
                              <Trophy size={10} /> Goal Complete!
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(vault.id)}
                          className="p-2.5 bg-white/10 hover:bg-white/25 rounded-xl transition-all border border-white/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-8 flex-1 flex flex-col gap-6">
                      {/* Amount display */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Saved</p>
                          <p className="text-3xl font-display font-black text-slate-900">
                            <AnimatedNumber value={vault.savedAmount} prefix="$" />
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Target</p>
                          <p className="text-lg font-bold text-slate-500">${vault.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Liquid Bar */}
                      <LiquidBar percent={pct} color={colorConf.bar} />

                      {/* Remaining / completed */}
                      {completed ? (
                        <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <Trophy size={18} className="text-amber-500 shrink-0" />
                          <p className="text-amber-700 font-bold text-sm">You've hit your goal! 🎉</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <Lock size={16} className="text-slate-400 shrink-0" />
                          <p className="text-slate-500 font-bold text-sm">
                            <span className="text-slate-800">${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> remaining
                          </p>
                        </div>
                      )}

                      {/* Add Funds button */}
                      {!completed && (
                        <button
                          onClick={() => { setShowDeposit(vault); setDepositAmt(''); }}
                          className={`w-full py-4 bg-gradient-to-r ${vault.color} text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all`}
                        >
                          <Zap size={16} /> Deposit Funds
                        </button>
                      )}

                      {completed && (
                        <button
                          onClick={() => handleDelete(vault.id)}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all"
                        >
                          <Check size={16} /> Archive Vault
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add New Vault Card */}
              <motion.div
                variants={item}
                whileHover={{ y: -4 }}
                onClick={() => setShowCreate(true)}
                className="relative rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-10 cursor-pointer hover:border-primary-300 hover:bg-primary-50/10 transition-all group min-h-[300px] space-y-4"
              >
                <div className="w-20 h-20 bg-slate-50 group-hover:bg-primary-50 rounded-[24px] flex items-center justify-center text-slate-300 group-hover:text-primary-500 transition-all">
                  <Plus size={36} />
                </div>
                <div>
                  <p className="font-display font-bold text-slate-900 text-lg">New Vault</p>
                  <p className="text-slate-400 text-sm font-medium">Create a savings goal</p>
                </div>
                <div className="flex items-center gap-1 text-primary-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">
                  Get Started <ChevronRight size={14} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          CREATE VAULT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreate(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              className="relative bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-violet-600 to-primary-700 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-violet-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">New Savings Goal</p>
                    <h3 className="text-2xl font-display font-black">Create Vault</h3>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-6">
                {/* Emoji picker */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Choose Icon</p>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_PRESETS.map(e => (
                      <button
                        key={e}
                        onClick={() => setNewEmoji(e)}
                        className={`w-12 h-12 rounded-2xl text-2xl transition-all ${newEmoji === e ? 'bg-primary-50 ring-2 ring-primary-500 scale-110' : 'bg-slate-50 hover:bg-slate-100'}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vault Name</p>
                  <input
                    type="text"
                    placeholder="e.g. Dream Vacation"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all"
                  />
                </div>

                {/* Target Amount */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Target Amount</p>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">$</span>
                    <input
                      type="number"
                      placeholder="5,000"
                      value={newTarget}
                      onChange={e => setNewTarget(e.target.value)}
                      className="w-full py-4 pl-10 pr-5 bg-slate-50 border border-slate-100 rounded-2xl font-display font-bold text-2xl text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Color */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vault Color</p>
                  <div className="flex gap-2">
                    {VAULT_COLORS.map(c => (
                      <button
                        key={c.label}
                        onClick={() => setNewColor(c)}
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${c.gradient} transition-all ${newColor.label === c.label ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview pill */}
                <div className={`flex items-center gap-4 p-5 rounded-3xl bg-gradient-to-r ${newColor.gradient} text-white`}>
                  <span className="text-3xl">{newEmoji}</span>
                  <div>
                    <p className="font-black text-base">{newName || 'Your Vault'}</p>
                    <p className="text-white/70 text-xs font-bold">{newTarget ? `$0 / $${parseFloat(newTarget).toLocaleString()}` : 'Set a target'}</p>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-base shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> Create Vault
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          DEPOSIT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDeposit(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88 }}
              className="relative bg-white w-full max-w-sm rounded-[48px] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${showDeposit.color} p-10 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{showDeposit.emoji}</span>
                    <div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Depositing to</p>
                      <h3 className="text-xl font-display font-black">{showDeposit.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setShowDeposit(null)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-6">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">Vault Progress</span>
                    <span className="font-bold text-slate-900">
                      ${showDeposit.savedAmount.toLocaleString()} / ${showDeposit.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <LiquidBar 
                    percent={(showDeposit.savedAmount / showDeposit.targetAmount) * 100} 
                    color={(VAULT_COLORS.find(c => c.gradient === showDeposit.color) || VAULT_COLORS[0]).bar}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Available Balance</span>
                    <span className="font-bold text-emerald-600">${(account?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Quick amounts */}
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Quick Select</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 250, 500, 1000, 'Remaining'].map(amt => {
                      const val = amt === 'Remaining' 
                        ? Math.min(showDeposit.targetAmount - showDeposit.savedAmount, account?.balance || 0)
                        : amt as number;
                      return (
                        <button
                          key={String(amt)}
                          onClick={() => setDepositAmt(String(val.toFixed(2)))}
                          className="py-2.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 rounded-xl text-slate-700 font-bold text-xs border border-slate-100 hover:border-primary-200 transition-all"
                        >
                          {amt === 'Remaining' ? 'Max' : `$${amt}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount input */}
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmt}
                    onChange={e => setDepositAmt(e.target.value)}
                    className="w-full py-6 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-3xl font-display font-black text-3xl text-center text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all"
                  />
                </div>

                <button
                  onClick={handleDeposit}
                  className={`w-full py-5 bg-gradient-to-r ${showDeposit.color} text-white rounded-2xl font-bold text-base shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2`}
                >
                  <Zap size={18} /> Lock Funds
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Vaults;
