import React, { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuickPay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const accountString = searchParams.get('account') || searchParams.get('pay');
  
  const [receiver, setReceiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Quick Pay');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent('/quick-pay?account=' + (accountString || ''))}`} replace />;
  }

  useEffect(() => {
    if (!accountString) {
      setError('No account specified in the QR code.');
      setLoading(false);
      return;
    }

    const fetchReceiver = async () => {
      try {
        const res = await api.get(`/accounts/number/${accountString}`);
        setReceiver(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Recipient not found');
      } finally {
        setLoading(false);
      }
    };

    fetchReceiver();
  }, [accountString]);

  const handlePay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    setProcessing(true);
    try {
      await api.post('/transactions/transfer', {
        senderUserId: user.id,
        receiverAccountNumber: receiver.accountNumber,
        amount: Number(amount),
        description: description
      });
      
      setSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-sm w-full text-center space-y-6 animate-fadeIn">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={48} className="text-green-500 animate-slideDown" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
          <p className="text-slate-500 font-medium pb-4">
            You successfully sent ₹{amount} to {receiver?.userFullName}.
          </p>
          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            SECURE QUICK PAY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Quick Pay
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-bold tracking-wide uppercase">
          FinanceHub Demo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl sm:rounded-[40px] sm:px-12 animate-fadeIn space-y-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="animate-spin text-primary-500" size={40} />
              <p className="text-sm font-bold text-slate-400">Locating recipient...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">!</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
              <p className="text-slate-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-8 animate-slideDown">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 font-bold text-xl relative">
                  {receiver?.userFullName?.charAt(0)}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Paying To</p>
                  <h4 className="font-bold text-lg text-slate-900">
                    {receiver?.userFullName}
                  </h4>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ms-1">
                    Amount (INR)
                  </label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-300 rounded-2xl px-6 py-5 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-center"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ms-1">
                    Note
                  </label>
                  <input 
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this for?"
                    className="w-full bg-slate-50 border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-2xl px-5 py-4 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handlePay}
                disabled={processing || !amount}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Transfer Funds</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickPay;
