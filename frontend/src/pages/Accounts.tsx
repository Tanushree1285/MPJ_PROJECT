import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  CreditCard, 
  ShieldCheck, 
  History, 
  ArrowRight,
  Plus,
  Eye,
  Settings,
  AlertCircle,
  Clock
} from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  createdAt: string;
}

const Accounts: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingAccounts, setPendingAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('fhPendingAccounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [accountType, setAccountType] = useState('CHECKING');

  useEffect(() => {
    const fetchAccounts = async (uid: number) => {
      try {
        setLoading(true);
        // Fetch all accounts for the user
        const res = await api.get(`/accounts/${uid}`);
        setAccounts(res.data);
      } catch (err: any) {
        console.error('Accounts fetch error:', err);
        toast.error('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };
    
    const uid = user?.id || (user as any)?.userId;
    if (uid) fetchAccounts(uid);
  }, [user]);

  const handleToggleFreeze = () => {
    toast.success('Account status updated! This change will take effect within 15 minutes.', {
      icon: '❄️',
      duration: 4000
    });
    setIsManageModalOpen(false);
  };

  const handleRequestAccount = () => {
    const newPending = {
      id: Date.now(),
      accountType: accountType,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      userId: user?.id || (user as any)?.userId
    };
    const updated = [...pendingAccounts, newPending];
    setPendingAccounts(updated);
    localStorage.setItem('fhPendingAccounts', JSON.stringify(updated));
    
    toast.success('Account application received! Our team is reviewing your request.', {
      icon: '📝',
      duration: 5000
    });
    setIsRequestModalOpen(false);
  };

  const primaryAccount = accounts.length > 0 ? accounts[0] : null;
  const secondaryAccounts = accounts.slice(1);

  return (
    <DashboardLayout title="My Accounts">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Account Details */}
          <div className="glass-card p-10 rounded-[40px] border-none shadow-premium bg-white">
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                  <CreditCard size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900">{primaryAccount?.accountType || 'Loading...'} Account</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Primary Account</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedAccount(primaryAccount);
                  setIsManageModalOpen(true);
                }}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
              >
                <Settings size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
                <h2 className="text-5xl font-display font-bold text-slate-900 tracking-tight">
                  {primaryAccount?.currency || 'USD'} {(primaryAccount?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Number</p>
                  <p className="font-mono font-bold text-slate-700 tracking-wider">
                    {primaryAccount?.accountNumber ? primaryAccount.accountNumber.split('-').map((p, i) => i === 1 ? '••••••' : p).join('-') : '••••-••••-••••'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Currency</p>
                  <p className="font-bold text-slate-700">{primaryAccount?.currency}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <Button 
                fullWidth 
                className="py-4 font-bold text-base shadow-lg shadow-primary-500/20"
                onClick={() => {
                  setSelectedAccount(primaryAccount);
                  setIsManageModalOpen(true);
                }}
              >
                Manage Account
              </Button>
              <Button 
                variant="secondary" 
                className="px-6 py-4 border-slate-200"
                onClick={() => {
                  setSelectedAccount(primaryAccount);
                  setIsViewDetailsOpen(true);
                }}
              >
                <Eye size={20} />
              </Button>
            </div>
          </div>

          {/* Account Perks & Stats */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl border-none shadow-premium bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary-600/20 rounded-full blur-2xl" />
               <h4 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                 <ShieldCheck className="text-primary-400" size={20} />
                 Account Benefits
               </h4>
               <ul className="space-y-4 text-slate-400 text-sm font-medium">
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                   Zero fees on incoming transfers
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                   Up to 3.5% APY on savings
                 </li>
                 <li className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                   Dedicated 24/7 business support
                 </li>
               </ul>
            </div>

            <div className="glass-card p-8 rounded-3xl border-none shadow-premium">
              <h4 className="text-lg font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                <History className="text-primary-600" size={20} />
                Recent Snapshot
              </h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Total Income (March)</span>
                  <span className="font-bold text-green-600">+$12,450.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Total Spending (March)</span>
                  <span className="font-bold text-red-600">-$4,120.50</span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-center">
                  <button className="text-primary-600 font-bold text-sm tracking-tight hover:underline flex items-center gap-1">
                    Monthly Report <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Accounts */}
        {secondaryAccounts.map(acc => (
          <div key={acc.id} className="glass-card p-8 rounded-[40px] border-none shadow-premium bg-white group hover:scale-[1.01] transition-all">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <CreditCard size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-slate-900">{acc.accountType} Account</h4>
                  <p className="font-mono text-slate-400 text-sm font-bold tracking-widest mt-1">
                    {acc.accountNumber.split('-').map((p, i) => i === 1 ? '••••••' : p).join('-')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-12 text-right">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-2xl font-display font-bold text-slate-900">
                    {acc.currency} {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedAccount(acc);
                      setIsViewDetailsOpen(true);
                    }}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                     onClick={() => {
                        setSelectedAccount(acc);
                        setIsManageModalOpen(true);
                      }}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                  >
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Pending Accounts */}
        {pendingAccounts.map(pc => (
          <div key={pc.id} className="p-8 border-2 border-primary-100 bg-primary-50/30 rounded-[40px] flex items-center justify-between group animate-pulse-subtle">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-400 shadow-sm leading-none">
                <Clock size={32} />
              </div>
              <div>
                <h4 className="text-xl font-display font-bold text-slate-900">{pc.accountType} Account Request</h4>
                <p className="text-slate-500 text-sm font-medium">Application submitted on {new Date(pc.requestedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-white text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-100">
                Under Review
              </span>
            </div>
          </div>
        ))}

        {/* Other Accounts Placeholder */}
        <div className="p-10 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
            <Plus size={32} />
          </div>
          <div>
            <h4 className="text-lg font-display font-bold text-slate-900">Open a new account</h4>
            <p className="text-slate-500 text-sm max-w-xs font-medium">Easily open a secondary checking or savings account for different purposes.</p>
          </div>
          <Button 
            variant="secondary" 
            className="px-8 border-slate-200"
            onClick={() => setIsRequestModalOpen(true)}
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Manage Account Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsManageModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn p-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Settings size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Manage Account</h2>
              <p className="text-slate-500 font-medium">Customize your account settings</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleToggleFreeze}
                className="w-full p-6 bg-slate-50 hover:bg-slate-100 rounded-3xl border border-slate-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Freeze Account</p>
                    <p className="text-xs text-slate-500 font-medium">Temporarily disable all transactions</p>
                  </div>
                </div>
                <div className="w-10 h-6 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full translate-x-0" />
                </div>
              </button>

              <button className="w-full p-6 bg-slate-50 hover:bg-slate-100 rounded-3xl border border-slate-100 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Transaction Limits</p>
                    <p className="text-xs text-slate-500 font-medium">Set daily and monthly spending caps</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300" />
              </button>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsViewDetailsOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-xl font-display font-bold text-slate-900">Account Details</h3>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Number</p>
                <p className="font-mono font-bold text-lg text-slate-700">{selectedAccount?.accountNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swift / BIC</p>
                  <p className="font-bold text-slate-700 uppercase">FHUBUS33</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Routing Number</p>
                  <p className="font-bold text-slate-700">021000021</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Address</p>
                <p className="font-bold text-slate-700 text-sm">123 Fintech Plaza, New York, NY 10001</p>
              </div>
            </div>
            <div className="p-10 bg-slate-50 flex gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedAccount?.accountNumber || '');
                  toast.success('Account number copied!');
                }}
                className="flex-1 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-100 transition-all"
              >
                Copy Details
              </button>
              <button 
                onClick={() => setIsViewDetailsOpen(false)}
                className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Request New Account Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsRequestModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Plus size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Apply for New Account</h2>
              <p className="text-slate-500 font-medium">Choose your account type and get started</p>
            </div>
            
            <div className="px-10 pb-10 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {['CHECKING', 'SAVINGS', 'BUSINESS'].map(type => (
                  <button
                    key={type}
                    onClick={() => setAccountType(type)}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${
                      accountType === type 
                        ? 'border-primary-500 bg-primary-50/50' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <p className={`font-bold ${accountType === type ? 'text-primary-700' : 'text-slate-900'}`}>{type} Account</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {type === 'CHECKING' && 'Best for daily spending and payments.'}
                      {type === 'SAVINGS' && 'Earn up to 3.5% APY on your deposits.'}
                      {type === 'BUSINESS' && 'Optimized for business transactions and taxes.'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-6">
                <Button 
                  fullWidth 
                  className="py-4 shadow-xl shadow-primary-500/20"
                  onClick={handleRequestAccount}
                >
                  Submit Application
                </Button>
                <button 
                  onClick={() => setIsRequestModalOpen(false)}
                  className="w-full mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Accounts;
