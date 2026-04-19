import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingHowItWorks from '../components/landing/LandingHowItWorks';
import LandingSecurity from '../components/landing/LandingSecurity';
import LandingFooter from '../components/landing/LandingFooter';

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Add smooth scroll behavior to HTML
    document.documentElement.style.scrollBehavior = 'smooth';
    document.title = 'FinanceHub | Premium Digital Banking';

    // Set explicit body background to white
    document.body.style.backgroundColor = '#FFFFFF';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Subtle Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]"
        style={{ scaleX }}
      />

      <LandingNavbar />

      <main>
        <LandingHero />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <LandingFeatures />

          <div className="py-20 md:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-[11px] font-extrabold text-blue-600 uppercase tracking-[0.3em] mb-4">Trust is built-in</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">
                Join 100,000+ users worldwide.
              </h2>
            </div>
          </div>

          <LandingHowItWorks />
          <LandingSecurity />

          {/* Why FinanceHub / Final CTA */}
          <section className="py-32 bg-white text-center">
            <div className="max-w-4xl mx-auto px-6 space-y-12">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight">
                Ready to take control of <br /> your <span className="text-blue-600">financial future?</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Join FinanceHub today and experience the most intuitive, secure, and powerful banking platform ever built.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/20 text-lg transition-all active:scale-95"
                >
                  Open your free account
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-12 py-5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg transition-all active:scale-95"
                >
                  Talk to an expert
                </button>
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
