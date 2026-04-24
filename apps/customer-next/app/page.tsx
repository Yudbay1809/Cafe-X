'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Menu', href: '/menu' },
    { name: 'Reservations', href: '#' },
    { name: 'Loyalty', href: '#' },
    { name: 'Outlets', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#070710] text-[#FFFBF5] font-karla selection:bg-[#FBBF24] selection:text-[#451A03] overflow-x-hidden">
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 px-6 lg:px-20 py-6 flex justify-between items-center ${
        isScrolled ? 'bg-[#070710]/90 backdrop-blur-xl border-b border-[#3D3320] py-4' : 'bg-transparent'
      }`}>
        <div className="flex flex-col">
          <span className="text-xl lg:text-2xl font-black font-playfair-display-sc text-[#FBBF24] leading-none tracking-tighter uppercase">CAFE·X</span>
          <span className="text-[8px] lg:text-[9px] font-bold text-[#8B7355] uppercase tracking-[0.3em] mt-1">Jakarta, Indonesia</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href} className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-[#FBBF24] transition-colors">{link.name}</Link>
          ))}
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => router.push('/menu')}
            className="hidden sm:block px-6 lg:px-8 py-2.5 lg:py-3 bg-[#FBBF24] text-[#451A03] rounded-full font-black text-[10px] lg:text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow-gold"
          >
            Order Now
          </button>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-[#1A160F] border border-[#3D3320] rounded-xl text-[#FBBF24]"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#070710]/95 backdrop-blur-xl z-[1000]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-full sm:w-80 bg-[#1A160F] z-[1001] p-10 flex flex-col border-l border-[#3D3320]"
            >
              <button onClick={() => setMobileMenuOpen(false)} className="self-end text-[#FBBF24] text-2xl mb-12">✕</button>
              <div className="space-y-8">
                {navLinks.map((link, i) => (
                  <motion.div key={link.name} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                    <Link href={link.href} className="text-2xl font-black font-playfair-display-sc text-white hover:text-[#FBBF24] transition-colors uppercase block">
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-auto space-y-4">
                <button 
                  onClick={() => router.push('/menu')}
                  className="w-full bg-[#FBBF24] text-[#451A03] py-5 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Start Ordering
                </button>
                <p className="text-[10px] text-[#8B7355] text-center uppercase tracking-widest font-black">Experience Sultan Culture</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-20 pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20 lg:opacity-30"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-[#070710] via-[#070710]/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 lg:space-y-12"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#FBBF2415] border border-[#FBBF2430] rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">
               <div className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse"></div>
               Sultan Experience Now Live
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black font-playfair-display-sc leading-[1.1] tracking-tight text-white uppercase">
               Imperial <br/><span className="text-white/40 italic">Coffee</span> Culture
            </h1>
            <p className="text-sm lg:text-lg text-[#C8B89A] font-medium leading-relaxed max-w-lg">
               Crafted with passion. Served with purpose. From single-origin espresso to artisanal pastries — experience Jakarta's finest cafe culture at Cafe-X.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
              <button 
                onClick={() => router.push('/menu')}
                className="w-full sm:w-auto bg-[#FBBF24] text-[#451A03] px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
              >
                Scan & Order
              </button>
              <button className="w-full sm:w-auto border-2 border-white/20 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-white transition-all">
                Our Outlets
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-8 lg:gap-16 pt-8 lg:pt-12 border-t border-white/10">
               <div>
                  <h3 className="text-2xl lg:text-4xl font-black text-[#FBBF24] font-playfair-display-sc leading-none">1,200<span className="text-xl text-[#FBBF24]/50 ml-1">+</span></h3>
                  <p className="text-[8px] lg:text-[10px] font-black text-[#8B7355] uppercase tracking-widest mt-1 lg:mt-2">Daily Brews</p>
               </div>
               <div>
                  <h3 className="text-2xl lg:text-4xl font-black text-[#FBBF24] font-playfair-display-sc leading-none">8</h3>
                  <p className="text-[8px] lg:text-[10px] font-black text-[#8B7355] uppercase tracking-widest mt-1 lg:mt-2">Global Branches</p>
               </div>
               <div>
                  <h3 className="text-2xl lg:text-4xl font-black text-[#FBBF24] font-playfair-display-sc leading-none">4.9<span className="text-xl text-[#FBBF24]/50 ml-1">★</span></h3>
                  <p className="text-[8px] lg:text-[10px] font-black text-[#8B7355] uppercase tracking-widest mt-1 lg:mt-2">User Rating</p>
               </div>
            </div>
          </motion.div>

          {/* Right Side Cards */}
          <div className="hidden lg:flex flex-col gap-8">
             <motion.div 
               initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
               className="relative w-[480px] h-[320px] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl self-end"
             >
                <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070710] to-transparent opacity-60"></div>
                <div className="absolute bottom-8 left-8">
                   <p className="text-[10px] font-black text-[#FBBF24] uppercase tracking-widest mb-1">Recommended</p>
                   <h4 className="text-xl font-black font-playfair-display-sc text-white uppercase">Es Kopi Susu Sultan</h4>
                </div>
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
               className="relative w-[480px] h-[320px] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
             >
                <img src="https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070710] to-transparent opacity-60"></div>
                <div className="absolute bottom-8 left-8">
                   <p className="text-[10px] font-black text-[#FBBF24] uppercase tracking-widest mb-1">Trending</p>
                   <h4 className="text-xl font-black font-playfair-display-sc text-white uppercase">Sultan Avocado Blend</h4>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Mobile */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/menu')}
        className="lg:hidden fixed bottom-10 right-6 w-16 h-16 bg-[#FBBF24] rounded-full shadow-glow-gold-lg flex items-center justify-center text-[#451A03] text-2xl z-[90]"
      >
        ☕
      </motion.button>
    </div>
  );
}