import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-8 bg-slate-50 order-2 lg:order-1">
        <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-premium animate-fadeIn">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500">Join thousands of users managing their wealth with FinanceHub</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Username"
                placeholder="johndoe123"
                icon={User}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number"
              placeholder="+1-555-0101"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div className="py-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  I agree to the <Link to="/terms" className="text-primary-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 font-bold hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              icon={<UserPlus size={18} />}
              className="text-lg py-3.5"
            >
              Get Started
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden order-1 lg:order-2">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-50" />
        
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl border border-white/10">
            FH
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">FinanceHub</span>
        </div>

        <div className="z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} />
            Secure & Trusted
          </div>
          <h1 className="text-5xl font-display font-bold leading-tight mb-6">
            Start your journey to financial freedom.
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            Join FinanceHub today and experience a new way of banking. Real-time tracking, secure transfers, and intuitive management.
          </p>
        </div>

        <div className="z-10 flex items-center gap-12">
          <div>
            <p className="text-3xl font-display font-bold">15k+</p>
            <p className="text-slate-500 font-medium">Active Users</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold">99.9%</p>
            <p className="text-slate-500 font-medium">Uptime Reliable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
