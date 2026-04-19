import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Fingerprint, EyeOff, Server, Database } from 'lucide-react';

const trustItems = [
   { icon: <Lock size={20} />, text: 'AES-256 Encryption' },
   { icon: <Fingerprint size={20} />, text: 'Biometric Login' },
   { icon: <ShieldCheck size={20} />, text: 'DDoS Protection' },
   { icon: <EyeOff size={20} />, text: 'Data Anonymization' },
   { icon: <Server size={20} />, text: 'Global Availability' },
   { icon: <Database size={20} />, text: 'PCI-DSS Compliant' },
];

const LandingSecurity: React.FC = () => {
   return (
      <section id="security" className="py-24 bg-white border-y border-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="bg-slate-50 rounded-[48px] p-10 lg:p-24 border border-slate-100 relative overflow-hidden">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-10">
                     <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                        <ShieldCheck className="text-white" size={32} />
                     </div>
                     <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                           Fortified by <span className="text-blue-600">Enterprise</span> Security
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed font-medium">
                           Your financial security is non-negotiable. We integrate bank-grade encryption
                           and real-time monitoring to provide total peace of mind for every transaction.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                        {trustItems.map((item, idx) => (
                           <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center gap-4 text-slate-900 font-bold"
                           >
                              <div className="text-blue-600 shadow-sm shrink-0">{item.icon}</div>
                              <span className="text-sm tracking-tight">{item.text}</span>
                           </motion.div>
                        ))}
                     </div>
                  </div>

                  <div className="relative">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10 bg-white border border-slate-200 rounded-[40px] p-10 shadow-premium"
                     >
                        <div className="flex justify-between items-center mb-10">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Security Protocol</span>
                           <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Status</span>
                        </div>

                        <div className="space-y-8">
                           <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                              <motion.div
                                 initial={{ width: 0 }}
                                 whileInView={{ width: '100%' }}
                                 viewport={{ once: true }}
                                 transition={{ duration: 2, ease: "easeInOut" }}
                                 className="h-full bg-blue-600 shadow-sm"
                              />
                           </div>
                           <div className="flex justify-between text-xs font-bold font-mono text-slate-400 uppercase tracking-tighter">
                              <span>Connection Integrity</span>
                              <span className="text-slate-900">Verified 100%</span>
                           </div>

                           <div className="grid grid-cols-4 gap-4 pt-4">
                              {[1, 2, 3, 4].map(i => (
                                 <div key={i} className="aspect-square bg-slate-50 border border-slate-100 rounded-xl" />
                              ))}
                           </div>
                        </div>
                     </motion.div>

                     {/* Decorative background glow */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 rounded-full blur-[100px] -z-10" />
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default LandingSecurity;
