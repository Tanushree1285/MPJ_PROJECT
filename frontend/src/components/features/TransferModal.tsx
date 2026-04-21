import React, { useState } from 'react';
import { X, ArrowRight, DollarSign, User as UserIcon, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderUserId?: number;
  onSuccess?: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, senderUserId, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txnStatus, setTxnStatus] = useState<string>('COMPLETED');
  const [formData, setFormData] = useState({
    receiverAccountNumber: '',
    amount: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (!formData.receiverAccountNumber || !formData.amount) return toast.error('Please fill in required fields');
    if (parseFloat(formData.amount) <= 0) return toast.error('Amount must be positive');
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/transactions/transfer', {
        senderUserId,
        receiverAccountNumber: formData.receiverAccountNumber,
        amount: parseFloat(formData.amount),
        description: formData.description || 'Fund Transfer'
      });
      setTxnStatus(res.data.status);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Transfer failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn">
        <div className="absolute top-6 right-6 z-10">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <div className="p-10 space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Transfer Funds</h2>
              <p className="text-slate-500 font-medium">Send money instantly to any FinanceHub account</p>
            </div>

            <div className="space-y-5">
              <Input
                label="Receiver Account Number"
                placeholder="FH-XXXXXX-XXXX"
                icon={UserIcon}
                value={formData.receiverAccountNumber}
                onChange={(e) => setFormData({ ...formData, receiverAccountNumber: e.target.value })}
                required
              />
              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                icon={DollarSign}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <Input
                label="Description (Optional)"
                placeholder="Rent payment, dinner, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Button fullWidth onClick={handleNext} className="py-4 text-lg" icon={<ArrowRight size={18} />}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-slate-900">Confirm Transfer</h2>
              <p className="text-slate-500 font-medium">Please review the details below</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recipient</span>
                <span className="font-bold text-slate-900">{formData.receiverAccountNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                <span className="text-2xl font-display font-bold text-primary-600">${parseFloat(formData.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fee</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => setStep(1)} fullWidth className="py-4">
                Back
              </Button>
              <Button loading={loading} onClick={handleSubmit} fullWidth className="py-4">
                Confirm
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 text-center space-y-8">
            {txnStatus === 'SUSPICIOUS' ? (
              <>
                <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[32px] flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <ShieldAlert size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Security Review</h2>
                  <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                    This transaction has been flagged for <span className="text-amber-600 font-bold">manual security review</span> due to unusual activity. 
                    No funds have been moved yet. An administrator will review it shortly.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Transfer Successful!</h2>
                  <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                    Your payment of <span className="text-slate-900 font-bold">${parseFloat(formData.amount).toFixed(2)}</span> has been sent to the recipient.
                  </p>
                </div>
              </>
            )}
            <Button fullWidth onClick={onClose} className="py-4">
              {txnStatus === 'SUSPICIOUS' ? 'I Understand' : 'Great, thanks!'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
