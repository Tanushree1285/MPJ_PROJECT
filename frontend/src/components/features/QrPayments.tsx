import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import toast from 'react-hot-toast';

const QrPayments: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'qr' | 'scan'>('qr');
  const [myQr, setMyQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  // Scanner state
  const [receiver, setReceiver] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('P2P Payment via QR');
  const [verifying, setVerifying] = useState(false);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (view === 'qr' && !myQr) {
      fetchMyQr();
    }
  }, [view]);

  const fetchMyQr = async () => {
    try {
      setLoading(true);
      const res = await api.get('/qr/my');
      setMyQr(res.data.qrCode);
    } catch (err) {
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    setScanning(true);
    setReceiver(null);
    
    // Using a timeout to ensure the container is rendered
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }, 100);
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.accountNumber) {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        setScanning(false);
        verifyReceiver(data.accountNumber);
      }
    } catch (err) {
      // Not a valid FH JSON QR
      console.warn('Scanned data is not a valid FinanceHub QR payload');
    }
  };

  const onScanFailure = (error: any) => {
    // Console error suppressed for cleaner UX
  };

  const verifyReceiver = async (accountNumber: string) => {
    try {
      setVerifying(true);
      const res = await api.get(`/accounts/number/${accountNumber}`);
      setReceiver(res.data);
      toast.success('Recipient found!');
    } catch (err) {
      toast.error('Recipient not found or invalid account');
    } finally {
      setVerifying(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Please enter a valid amount');
    
    try {
      setLoading(true);
      await api.post('/transactions/transfer', {
        senderUserId: user?.id || (user as any)?.userId,
        receiverAccountNumber: receiver.accountNumber,
        amount: Number(amount),
        description: description
      });
      
      toast.success('Payment successful!', {
        icon: '🚀',
        duration: 5000
      });
      
      // Return to QR view after success (as requested)
      setReceiver(null);
      setAmount('');
      setView('qr');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto">
        <button 
          onClick={() => setView('qr')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            view === 'qr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <QrCode size={18} /> My QR
        </button>
        <button 
          onClick={() => setView('scan')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            view === 'scan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Camera size={18} /> Scan & Pay
        </button>
      </div>

      <div className="flex flex-col items-center">
        {view === 'qr' ? (
          <div className="w-full max-w-sm glass-card p-10 rounded-[40px] text-center bg-white shadow-premium">
            <h4 className="text-xl font-display font-bold text-slate-900 mb-2">{user?.fullName}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-primary-500">Scan this code to pay me</p>
            
            <div className="relative group mx-auto">
              {loading ? (
                <div className="w-64 h-64 mx-auto bg-slate-50 rounded-[32px] flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
              ) : myQr ? (
                <div className="p-4 bg-white rounded-[40px] shadow-inner-lg border border-slate-50 animate-fadeIn">
                  <img src={`data:image/png;base64,${myQr}`} alt="My Payment QR" className="w-64 h-64 mx-auto rounded-3xl" />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300">
                  <AlertCircle size={32} />
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50">
               <div className="flex items-center gap-2 justify-center text-xs font-bold text-slate-500">
                 <CheckCircle2 size={14} className="text-green-500" /> Secure P2P Payment System
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            {!receiver && !scanning && (
              <div className="glass-card p-10 rounded-[40px] text-center space-y-6 animate-fadeIn">
                <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto">
                  <Camera size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-display font-bold text-slate-900">Ready to Pay?</h4>
                  <p className="text-slate-500 text-sm font-medium mt-2">Scan a recipient's QR code to send money instantly across accounts.</p>
                </div>
                <Button fullWidth onClick={startScanner}>Start Camera</Button>
              </div>
            )}

            {scanning && (
              <div className="glass-card overflow-hidden rounded-[40px] relative animate-fadeIn">
                <div id="qr-reader" className="w-full" style={{ border: 'none' }}></div>
                <button 
                  onClick={() => {
                    if (scannerRef.current) scannerRef.current.clear();
                    setScanning(false);
                  }}
                  className="absolute top-4 right-4 p-2 bg-slate-900/60 text-white rounded-xl hover:bg-slate-900 transition-all backdrop-blur-md"
                >
                  Cancel
                </button>
              </div>
            )}

            {(verifying || receiver) && (
              <div className="glass-card p-8 rounded-[40px] space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl relative">
                    {verifying ? <Loader2 className="animate-spin" size={24} /> : receiver?.userFullName?.charAt(0)}
                    {!verifying && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                       <CheckCircle2 size={10} className="text-white" />
                    </div>}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-900">
                      {verifying ? 'Verifying recipient...' : receiver?.userFullName}
                    </h4>
                    <p className="text-xs font-mono font-bold text-slate-400 mt-1 uppercase tracking-tight">
                      {receiver?.accountNumber}
                    </p>
                  </div>
                </div>

                {receiver && (
                  <div className="space-y-6 animate-slideDown">
                    <Input 
                      label="Amount to Send (USD)" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                    />
                    <Input 
                      label="Payment Reference" 
                      placeholder="What is this for?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    
                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={() => {
                           setReceiver(null);
                           setAmount('');
                        }}
                        className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-100"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} /> Send Money</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QrPayments;
