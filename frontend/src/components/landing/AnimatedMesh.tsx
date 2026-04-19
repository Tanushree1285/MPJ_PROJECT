import React from 'react';
import { motion } from 'framer-motion';

const AnimatedMesh: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[60px]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-900" />
      
      {/* Animated Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[100px]"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -80, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[80px]"
      />

      <motion.div
        animate={{
          opacity: [0.4, 0.6, 0.4],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          linear: true
        }}
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent top-1/2 -translate-y-1/2"
      />

      {/* Floating Abstract Grid */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Centerpiece - Abstract Fintech Shield/Icon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-64 h-64 border border-white/10 rounded-[48px] backdrop-blur-2xl flex items-center justify-center bg-white/[0.02] shadow-2xl"
      >
         <div className="absolute inset-0 bg-indigo-500/5 rounded-[48px] animate-pulse" />
         <div className="w-32 h-32 border-2 border-indigo-500/30 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20 rotate-45" />
         </div>
         
         {/* Orbiting particles */}
         {[0, 1, 2].map((i) => (
           <motion.div
             key={i}
             animate={{ rotate: 360 }}
             transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
             className="absolute"
             style={{ width: 140 + i * 40, height: 140 + i * 40 }}
           >
             <div className="w-2 h-2 bg-indigo-400 rounded-full absolute top-0 left-1/2 -translate-x-1/2 blur-[1px]" />
           </motion.div>
         ))}
      </motion.div>
    </div>
  );
};

export default AnimatedMesh;
