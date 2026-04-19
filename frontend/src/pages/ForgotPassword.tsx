import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset link sent!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-premium text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Check your email</h2>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            We've sent a password reset link to <span className="text-slate-900 font-bold">{email}</span>. Please check your inbox and spam folder.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-premium">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Forgot Password?</h2>
          <p className="text-slate-500 font-medium">No worries! Enter your email and we'll send you a link to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" fullWidth loading={loading} icon={<Send size={18} />} className="py-3.5">
            Send Reset Link
          </Button>
          
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
