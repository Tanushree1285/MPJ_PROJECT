import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Link, PlayCircle } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="text-blue-600" size={24} />,
    title: 'Create Account',
    description: 'Sign up in minutes with easy identity verification.'
  },
  {
    icon: <Link className="text-blue-600" size={24} />,
    title: 'Link Wallet',
    description: 'Connect your accounts securely via encrypted bridge.'
  },
  {
    icon: <PlayCircle className="text-blue-600" size={24} />,
    title: 'Start Banking',
    description: 'Manage assets and send money with total clarity.'
  }
];

const LandingHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Simple as it should be.</h2>
          <p className="text-slate-500 font-medium leading-relaxed">Three steps to a smarter financial future. No paperwork, no hassle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-slate-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group text-center space-y-6"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-premium border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {step.icon}
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-xl font-display font-bold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
