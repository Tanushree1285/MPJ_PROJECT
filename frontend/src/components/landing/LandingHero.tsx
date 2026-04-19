import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import UIProductMockup from './UIProductMockup';

const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center text-center lg:text-left">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Available Now across Europe</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-slate-900 leading-[1.05] tracking-tight">
              Smart Banking. <br />
              <span className="text-blue-600">Simplified.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
              Manage your spending, detect transaction risks, and stay in control with our bank-grade encrypted platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => navigate('/register')}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-2xl shadow-blue-600/20 text-lg group active:scale-95 transition-all"
              >
                Get Started <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
                className="px-10 py-5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg active:scale-95 transition-all"
              >
                Sign In
              </Button>
            </div>

            {/* Micro-Features */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-8 gap-y-4 pt-10 border-t border-slate-100">
              {[
                "Free account setup",
                "No hidden fees",
                "Instant card issuance"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                  <CheckCircle2 size={16} className="text-green-500" /> {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full relative"
          >
            <UIProductMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
