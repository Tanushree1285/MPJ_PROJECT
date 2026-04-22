import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import HealthScoreWidget from '../components/features/HealthScoreWidget';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CreditCard,
  Plus,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';
import TransferModal from '../components/features/TransferModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}

interface Summary {
  monthlyIncome: number;
  monthlyExpense: number;
  currency: string;
  monthAndYear: string;
}

interface Transaction {
  id: number;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  category: string;
  createdAt: string;
}

interface HealthData {
  score: number;
  healthLevel: string;
  spendingByCategory: Record<string, number>;
  totalSpentThisMonth: number;
  totalSpentLastMonth: number;
  spendingGrowthRate: number;
  insight: string;
  alert: string | null;
  estimatedCarbonFootprintKg?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [suggestedAccounts, setSuggestedAccounts] = useState<any[]>([]);

  const [quickTransferAmount, setQuickTransferAmount] = useState('');
  const [quickTransferTo, setQuickTransferTo] = useState('');

  const fetchData = async (uid: number) => {
    try {
      setLoading(true);
      // Use primary account endpoint
      const accountRes = await api.get(`/accounts/primary/${uid}`);
      setAccount(accountRes.data);

      if (accountRes.data?.id) {
        // Recent transactions
        const txRes = await api.get(`/transactions/account/${accountRes.data.id}`);
        setRecentTransactions(txRes.data.slice(0, 5));

        // Fetch summary
        const summaryRes = await api.get(`/transactions/summary/${accountRes.data.id}`);
        setSummary(summaryRes.data);

        // Fetch Health Data
        const healthRes = await api.get(`/analytics/health/${accountRes.data.id}`);
        setHealthData(healthRes.data);
      }

      // Fetch all accounts for Quick Transfer suggestions
      const allAccountsRes = await api.get('/accounts/all');
      if (Array.isArray(allAccountsRes.data)) {
        // Filter out current user's account and limit to 5
        const suggestions = allAccountsRes.data
          .filter((acc: any) => acc.userId !== uid)
          .slice(0, 5);
        setSuggestedAccounts(suggestions);
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTransfer = async () => {
    if (!quickTransferTo || !quickTransferAmount) return toast.error('Please enter details');
    try {
      setLoading(true);
      await api.post('/transactions/transfer', {
        senderUserId: user?.id || (user as any)?.userId,
        receiverAccountNumber: quickTransferTo,
        amount: parseFloat(quickTransferAmount),
        description: 'Quick Transfer'
      });
      toast.success('Quick transfer successful!');
      setQuickTransferAmount('');
      setQuickTransferTo('');
      if (user?.id || (user as any)?.userId) fetchData(user?.id || (user as any)?.userId);
    } catch (err: any) {
      toast.error(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for both id and userId just in case, but AuthContext should normalize it
    const uid = user?.id || (user as any)?.userId;
    if (uid) fetchData(uid);

    const params = new URLSearchParams(window.location.search);
    const payParam = params.get('pay');
    if (payParam) {
      setQuickTransferTo(payParam);
      // Clean up URL to prevent refreshing causing re-fill
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  const handleAddMoney = () => {
    toast.success('Deposit request initiated! Please follow the instructions sent to your email to complete the bank transfer.', {
      icon: '🏦',
      duration: 5000
    });
  };

  if (loading && !account) return <DashboardLayout title="Dashboard"><div className="flex items-center justify-center h-64">Loading dashboard...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome & Balance Card */}
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-600/30 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-slate-400 font-medium mb-1">Total Balance</p>
                <h2 className="text-5xl font-display font-bold tracking-tight">
                  {'INR'} {(account?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <div className="flex items-center gap-2 mt-4 text-green-400 font-medium text-sm">
                  <div className="bg-green-50/10 p-1 rounded-full"><TrendingUp size={14} /></div>
                  <span>+2.5% from last month</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  icon={<Plus size={18} />}
                  className="bg-white text-primary-600 hover:bg-slate-100 shadow-none border-none px-6"
                  onClick={handleAddMoney}
                >
                  Add Money
                </Button>
                <Button
                  variant="secondary"
                  icon={<ArrowUpRight size={18} />}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => setIsTransferModalOpen(true)}
                >
                  Transfer
                </Button>
              </div>
            </div>

            <div className="relative z-10 mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Account Number</p>
                <p className="font-mono font-medium tracking-wider">{account?.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Type</p>
                <p className="font-medium text-primary-200">{account?.accountType}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Status</p>
                <p className="font-medium inline-flex items-center gap-1.5 text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Active
                </p>
              </div>
            </div>
          </div>

          {/* Activity Overviews ... same as before ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Monthly Income ({summary?.monthAndYear.split(' ')[0] || '...'})</p>
                <p className="text-xl font-display font-bold text-slate-900">
                  {summary ? `₹{summary.currency} ${summary.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '₹0.00'}
                </p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Monthly Expense ({summary?.monthAndYear.split(' ')[0] || '...'})</p>
                <p className="text-xl font-display font-bold text-slate-900">
                  {summary ? `₹{summary.currency} ${summary.monthlyExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '₹0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions ... same as before ... */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-slate-900">Recent Transactions</h3>
              <Link to="/transactions" className="text-primary-600 font-bold text-sm flex items-center hover:underline">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border-none shadow-premium">
              <div className="divide-y divide-slate-50">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.transactionType === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {tx.transactionType === 'DEPOSIT' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 capitalize">{tx.description.toLowerCase()}</p>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock size={12} />
                          {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold text-lg ${tx.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-slate-900'
                        }`}>
                        {tx.transactionType === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${tx.status === 'COMPLETED' ? 'text-green-500' : 'text-orange-500'
                        }`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* AI Financial Health Widget */}
          <HealthScoreWidget data={healthData} loading={loading} />

          {/* ESG Carbon Footprint Tracker */}
          {!loading && healthData && (
            <div className="glass-card p-6 rounded-3xl border-none shadow-premium relative overflow-hidden text-white bg-gradient-to-br from-emerald-800 to-green-900 group">
               <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
               </div>
               
               <h3 className="font-display font-bold text-green-100 mb-6 flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                 ESG Carbon Footprint
               </h3>
               
               <div className="flex items-end gap-3 mb-4">
                 <span className="text-5xl font-display font-black tracking-tight">{healthData.estimatedCarbonFootprintKg?.toFixed(1) || '0.0'}</span>
                 <span className="text-xl font-bold text-green-400 mb-1">kg CO₂</span>
               </div>
               
               <p className="text-green-200/80 text-sm font-medium leading-relaxed mb-6">
                 Estimated from your recent spending velocity and categories.
               </p>
               
               {(healthData.estimatedCarbonFootprintKg || 0) < 100 ? (
                 <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
                   <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center shrink-0">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                   </div>
                   <div>
                     <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-0.5">Unlocked Badge</p>
                     <p className="font-display font-bold text-white text-sm">Eco-Friendly Journey</p>
                   </div>
                 </div>
               ) : (
                 <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 rounded-full" style={{ width: `₹{Math.min(((healthData.estimatedCarbonFootprintKg || 0) / 300) * 100, 100)}%` }} />
                 </div>
               )}
            </div>
          )}

          {/* Quick Transfer */}
          <div className="glass-card p-6 rounded-3xl border-none shadow-premium">
            <h3 className="font-display font-bold text-slate-900 mb-6">Quick Transfer</h3>
            <div className="space-y-4">
              <div className="flex -space-x-3 overflow-hidden">
                {suggestedAccounts.map((acc, i) => (
                  <div
                    key={acc.id}
                    className="group relative"
                    onClick={() => setQuickTransferTo(acc.accountNumber)}
                    title={acc.userFullName || 'Account'}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white flex items-center justify-center shadow-premium hover:-translate-y-1 transition-all cursor-pointer overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(acc.userFullName || 'U')}&background=random&color=fff`}
                        alt={acc.userFullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}

                <div
                  className="w-12 h-12 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center shadow-sm text-slate-400 font-bold cursor-pointer hover:border-primary-500 hover:text-primary-600 transition-all"
                  onClick={() => setIsTransferModalOpen(true)}
                >
                  <Plus size={20} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <input
                  type="text"
                  placeholder="Receiver Account"
                  className="w-full py-3 px-4 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20"
                  value={quickTransferTo}
                  onChange={(e) => setQuickTransferTo(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full text-3xl font-display font-bold text-center py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20"
                  value={quickTransferAmount}
                  onChange={(e) => setQuickTransferAmount(e.target.value)}
                />
                <Button fullWidth className="py-4 font-bold text-lg" onClick={handleQuickTransfer} loading={loading && !!quickTransferAmount}>
                  Send Money
                </Button>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-primary-800 text-white shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={80} strokeWidth={1} /></div>
            <div className="z-10 flex justify-between items-start">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white font-display font-bold border border-white/20">FH</div>
              <span className="text-sm font-medium tracking-widest opacity-80 uppercase">Platinum</span>
            </div>

            <div className="z-10">
              <p className="text-xl font-mono tracking-[0.25em] mb-4">•••• •••• •••• 4291</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-0.5">Card Holder</p>
                  <p className="font-medium tracking-wide uppercase text-sm">{user?.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-0.5">Expiry</p>
                  <p className="font-medium text-sm">12/28</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        senderUserId={user?.id || (user as any)?.userId}
        onSuccess={() => fetchData(user?.id || (user as any)?.userId)}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
