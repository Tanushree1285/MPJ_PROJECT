import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Cpu, QrCode } from 'lucide-react';

const features = [
  {
    icon: <Shield className="text-blue-600" size={24} />,
    title: 'Secure Transactions',
    description: 'Bank-grade encryption ensures your data and money stay protected at all times.'
  },
  {
    icon: <Cpu className="text-blue-600" size={24} />,
    title: 'Smart Insights',
    description: 'Track spending. Detect risks. Stay in total control with automated analysis.'
  },
  {
    icon: <Zap className="text-blue-600" size={24} />,
    title: 'Rapid Transfers',
    description: 'Send and receive money instantly across the globe with zero settlement delay.'
  },
  {
    icon: <QrCode className="text-blue-600" size={24} />,
    title: 'QR P2P Payments',
    description: 'Seamless peer-to-peer payments. Just scan, verify, and complete transfers instantly.'
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-white border-t border-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight"
          >
            Banking features <br /> built for the <span className="text-blue-600">modern era</span>.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
