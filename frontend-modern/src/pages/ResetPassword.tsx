import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Reset link invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-premium text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Password reset!</h2>
          <p className="text-slate-500 mb-8 font-medium">Your password has been successfully updated. You can now use your new password to sign in.</p>
          <Button fullWidth onClick={() => navigate('/login')} className="py-3.5">
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-premium">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Reset Password</h2>
          <p className="text-slate-500 font-medium">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth loading={loading} icon={<ArrowRight size={18} />} className="py-3.5 mt-2">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
