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
    if (token) {
      setTableToken(token);
    }
  }, [search]);

  const handleOrderNow = () => {
    if (tableToken) {
      router.push(`/menu?tableToken=${tableToken}`);
    } else {
      router.push('/menu');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0906] text-[#FFFBF5] font-karla selection:bg-[#FBBF24] selection:text-[#451A03]">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=2000" 
            alt="Cafe-X Sultan Interior" 
            className="w-full h-full object-cover opacity-30 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0906] via-[#0A0906]/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl space-y-8">
          <div className="inline-block px-4 py-1.5 bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#FBBF24] mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            Welcome to the Sultan Expansion
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-playfair-display-sc leading-none tracking-tighter text-[#FFFBF5] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The Art of <span className="text-[#FBBF24]">Coffee</span><br/>Reimagined.
          </h1>
          <p className="text-lg md:text-xl text-[#8B7355] font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
            Experience the fusion of traditional brewing mastery and modern digital convenience. 
            Freshly roasted beans, crafted for the true connoisseur.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <button 
              className="px-10 py-5 bg-[#78350F] text-[#FBBF24] rounded-2xl font-black text-lg shadow-2xl shadow-[#78350F]/40 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
              onClick={handleOrderNow}
            >
              {tableToken ? 'Continue Your Order' : 'Order Now'}
            </button>
            <Link 
              href="/booking" 
              className="px-10 py-5 bg-transparent border-2 border-[#3D3320] text-[#FFFBF5] rounded-2xl font-black text-lg hover:border-[#FBBF24] hover:text-[#FBBF24] transition-all w-full md:w-auto text-center"
            >
              Reserve a Table
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-6 h-10 border-2 border-[#FFFBF5] rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-[#FFFBF5] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Sultan Features Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black font-playfair-display-sc text-[#FFFBF5] mb-4">Elite Craftsmanship</h2>
          <div className="w-20 h-1 bg-[#FBBF24] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-10 bg-[#0D0B08] border border-[#3D3320] rounded-[2.5rem] space-y-6 hover:border-[#FBBF24]/30 transition-all group">
            <div className="text-5xl group-hover:scale-110 transition-transform duration-500">☕</div>
            <h3 className="text-2xl font-black font-playfair-display-sc text-[#FBBF24]">Signature Roasts</h3>
            <p className="text-[#8B7355] leading-relaxed">
              Directly sourced from high-altitude estates, roasted in small batches to preserve unique aromatic profiles.
            </p>
          </div>

          <div className="p-10 bg-[#0D0B08] border border-[#3D3320] rounded-[2.5rem] space-y-6 hover:border-[#FBBF24]/30 transition-all group">
            <div className="text-5xl group-hover:scale-110 transition-transform duration-500">🪄</div>
            <h3 className="text-2xl font-black font-playfair-display-sc text-[#FBBF24]">AI-Driven Prep</h3>
            <p className="text-[#8B7355] leading-relaxed">
              Our Sultan ecosystem uses predictive analytics to ensure your favorite beans are always fresh and ready for brewing.
            </p>
          </div>

          <div className="p-10 bg-[#0D0B08] border border-[#3D3320] rounded-[2.5rem] space-y-6 hover:border-[#FBBF24]/30 transition-all group">
            <div className="text-5xl group-hover:scale-110 transition-transform duration-500">💎</div>
            <h3 className="text-2xl font-black font-playfair-display-sc text-[#FBBF24]">Stamp Loyalty</h3>
            <p className="text-[#8B7355] leading-relaxed">
              Exclusive Sultan members enjoy the "Buy 9 Get 1 Free" gamified experience, tracking stamps in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-[#3D3320] text-center bg-[#0D0B08]">
        <div className="text-3xl font-black font-playfair-display-sc text-[#FBBF24] mb-6">CAFE·X</div>
        <p className="text-[#8B7355] text-sm uppercase tracking-widest">&copy; 2026 Cafe-X Enterprise. Crafted for Excellence.</p>
      </footer>
    </div>
  );
}