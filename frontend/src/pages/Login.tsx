import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
        
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl border border-white/20">
            FH
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">FinanceHub</span>
        </div>

        <div className="z-10 max-w-md">
          <h1 className="text-5xl font-display font-bold leading-tight mb-6">
            Smart banking for the modern world.
          </h1>
          <p className="text-lg text-primary-100 font-medium">
            Manage your finances, track transactions, and take control of your wealth with our premium dashboard.
          </p>
        </div>

        <div className="z-10 flex items-center gap-4 text-sm font-medium text-primary-200">
          <span>&copy; 2026 FinanceHub. All rights reserved.</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-premium animate-fadeIn">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              icon={<LogIn size={18} />}
              className="text-lg py-3.5"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-600 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-bold hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
