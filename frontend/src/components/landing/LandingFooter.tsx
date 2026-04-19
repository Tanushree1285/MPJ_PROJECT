import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import Button from '../common/Button';

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Wallet className="text-white" size={18} />
              </div>
              <span className="text-xl font-display font-bold text-slate-900 tracking-tight">FinanceHub</span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Next-generation banking platform focused on trust, security, and world-class financial simplicity.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"><Twitter size={18} /></a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"><Github size={18} /></a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-slate-900 font-bold mb-8 text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#security" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Security</a></li>
              <li><a href="/login" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Personal Banking</a></li>
              <li><a href="/register" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Business Accounts</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-slate-900 font-bold mb-8 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 text-sm font-bold hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* CTA Footer */}
          <div className="space-y-8">
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-widest leading-none">Stay Updated</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 w-full font-medium transition-colors"
              />
              <button className="bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 shadow-xl shadow-blue-500/10 transition-all active:scale-95"><Mail size={18} /></button>
            </div>
            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mt-4">Enterprise-Ready Infrastructure</p>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">
            © 2026 FinanceHub Technologies. Not a real banking institution.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/register')} className="text-xs bg-slate-900 px-8 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold tracking-tight">Contact Sales</Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
