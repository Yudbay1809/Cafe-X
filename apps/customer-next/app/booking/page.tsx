'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(3);

  return (
    <div className="min-h-screen bg-[#0A0906] text-[#FFFBF5] font-karla selection:bg-[#FBBF24]">
      {/* Top Hero Section - Exact IOw57 Layout */}
      <div className="relative h-[45vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000" 
          className="w-full h-full object-cover opacity-60"
          alt="Cafe-X Ambience"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0906] to-transparent"></div>
        
        {/* Navbar */}
        <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-10">
           <button onClick={() => router.back()} className="text-2xl text-[#E8D5B0]">←</button>
           <h1 className="text-xl font-black font-playfair-display-sc uppercase tracking-widest text-white">Reserve a Table</h1>
           <button onClick={() => router.push('/')} className="text-2xl text-[#E8D5B0]">✕</button>
        </div>

        {/* Progress Bar - 3 Segments */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-10 flex gap-3">
           <div className="h-1 flex-1 bg-[#FBBF24] rounded-full"></div>
           <div className="h-1 flex-1 bg-[#FBBF24] rounded-full"></div>
           <div className="h-1 flex-1 bg-[#FBBF24] rounded-full shadow-[0_0_10px_#FBBF24]"></div>
        </div>
      </div>

      {/* Booking Content */}
      <div className="px-6 -mt-10 relative z-20 space-y-6 max-w-lg mx-auto pb-20">
         {/* Summary Card */}
         <div className="bg-[#1A160F] p-8 rounded-[2rem] border border-[#3D3320] space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
               <h2 className="text-xl font-black font-playfair-display-sc text-white uppercase">Booking Summary</h2>
               <span className="px-4 py-1 bg-[#10B98115] text-[#10B981] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#10B98130]">Confirmed</span>
            </div>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#8B7355]">Date & Time</span>
                  <span className="text-sm font-black text-white">Today @ 07:00 PM</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#8B7355]">Guests</span>
                  <span className="text-sm font-black text-white">4 Persons</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#8B7355]">Location</span>
                  <span className="text-sm font-black text-white">Indoor (AC) — Table 5</span>
               </div>
            </div>
         </div>

         {/* Fee Box */}
         <div className="bg-[#FBBF2408] p-8 rounded-[1.5rem] border border-[#FBBF2420] flex justify-between items-center group hover:bg-[#FBBF2410] transition-all">
            <div>
               <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Booking Guarantee</p>
               <h3 className="text-xl font-black text-[#FBBF24] font-playfair-display-sc mt-1">Booking Fee</h3>
            </div>
            <div className="text-right">
               <span className="text-3xl font-black text-[#FBBF24] font-playfair-display-sc">RP 50.000</span>
            </div>
         </div>

         <p className="text-[11px] text-[#6B5A40] text-center italic">
            * This fee will be deducted from your total bill at the cafe.
         </p>

         {/* Action Button */}
         <button 
           className="w-full py-6 bg-[#FBBF24] text-[#451A03] rounded-[1.5rem] font-black text-lg shadow-glow-gold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
         >
           <span>💳</span>
           <span>Confirm & Pay Now</span>
         </button>
      </div>
    </div>
  );
}
