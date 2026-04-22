'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  const search = useSearchParams();
  const [tableToken, setTableToken] = useState<string | null>(null);

  useEffect(() => {
    const token = search.get('tableToken');
    if (token) setTableToken(token);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#0A0906] text-[#FFFBF5] font-karla selection:bg-[#FBBF24] selection:text-[#451A03] overflow-x-hidden">
      {/* Hero Section - Exact Layout from Pencil */}
      <section className="relative h-screen min-h-[960px] flex items-center px-20">
        {/* Background Image with Exact Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1765894711095-4be58ff7c30a?auto=format&fit=crop&q=80&w=2000" 
            alt="Cafe-X Sultan Hero" 
            className="w-full h-full object-cover opacity-30 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A090680] to-[#0A0906F0]"></div>
        </div>
        
        {/* Navbar - Exact 80px Height/Padding */}
        <nav className="absolute top-0 left-0 w-full h-20 px-20 flex justify-between items-center z-50">
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-black font-playfair-display-sc text-[#FBBF24] leading-none tracking-tighter">CAFE·X</span>
            <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-[0.2em]">Jakarta Reserve</span>
          </div>
          <div className="flex items-center gap-10">
             {['About', 'Menu', 'Gallery', 'Contact'].map(link => (
               <Link key={link} href="#" className="text-xs font-black uppercase tracking-widest text-[#8B7355] hover:text-[#FBBF24] transition-colors">{link}</Link>
             ))}
          </div>
          <Link href="/booking" className="px-8 py-3 bg-[#FBBF24] text-[#451A03] rounded-full font-black text-xs uppercase tracking-widest shadow-glow-gold hover:scale-105 transition-all">
             Book Table
          </Link>
        </nav>

        {/* Hero Content - Exact 700px Width, 72px Headline */}
        <div className="relative z-10 max-w-[700px] space-y-8 mt-20">
          <div className="inline-block px-4 py-1.5 bg-[#FBBF2415] border border-[#FBBF2430] rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">
             Jakarta's Finest Cafe Culture
          </div>
          <h1 className="text-[72px] font-black font-playfair-display-sc leading-[1.15] tracking-tight text-[#FFFBF5]">
             Where Every Sip <span className="text-[#FBBF24]">Tells a Story</span>
          </h1>
          <p className="text-[18px] text-[#C8B89A] font-medium leading-[1.7] max-w-[620px]">
             Crafted with passion. Served with purpose. From single-origin espresso to artisanal pastries — experience the Sultan standard.
          </p>
          
          <div className="flex items-center gap-6 pt-4">
            <button 
              className="px-10 py-5 bg-[#FBBF24] text-[#451A03] rounded-2xl font-black text-lg shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
              onClick={() => router.push('/menu')}
            >
              Order Now
            </button>
            <Link href="/booking" className="flex items-center gap-3 text-[#FFFBF5] font-black text-lg group">
               <span>Explore Experience</span>
               <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Stats Bar - Exact 60px Gaps */}
        <div className="absolute bottom-20 left-20 flex items-center gap-[60px] z-10">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-[#FBBF24] font-playfair-display-sc">12+</span>
              <span className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Global Awards</span>
           </div>
           <div className="w-px h-12 bg-[#3D3320]"></div>
           <div className="flex flex-col">
              <span className="text-3xl font-black text-[#FBBF24] font-playfair-display-sc">24/7</span>
              <span className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Sultan Support</span>
           </div>
           <div className="w-px h-12 bg-[#3D3320]"></div>
           <div className="flex flex-col">
              <span className="text-3xl font-black text-[#FBBF24] font-playfair-display-sc">4.9</span>
              <span className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">User Rating</span>
           </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-40 px-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-center bg-[#0D0B08]">
         <div className="space-y-10">
            <h2 className="text-[52px] font-black font-playfair-display-sc leading-tight text-[#FBBF24]">Artisanal Excellence <br/>In Every Cup</h2>
            <p className="text-[#8B7355] text-lg leading-relaxed max-w-lg">
               Our beans are ethically sourced from the volcanic soils of Mount Ijen, roasted in micro-batches to unlock a symphony of chocolate and berry notes.
            </p>
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-2">
                  <span className="text-2xl">🌍</span>
                  <p className="font-bold text-[#FFFBF5]">Ethically Sourced</p>
               </div>
               <div className="space-y-2">
                  <span className="text-2xl">🔥</span>
                  <p className="font-bold text-[#FFFBF5]">Micro-Roasted</p>
               </div>
            </div>
         </div>
         <div className="relative">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#3D3320]">
               <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-[#FBBF24] p-10 rounded-[2rem] shadow-glow-gold-lg">
               <p className="text-4xl font-black text-[#451A03] font-playfair-display-sc">100%</p>
               <p className="text-[10px] font-black text-[#451A03]/60 uppercase tracking-widest">Organic Arabica</p>
            </div>
         </div>
      </section>
    </div>
  );
}