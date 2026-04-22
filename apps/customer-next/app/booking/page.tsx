'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    date: '2026-04-22',
    time: '07:00 PM',
    guests: 4,
    tableType: 'Indoor (AC)',
    notes: '',
  });

  const bookingFee = 50000;

  const handleNext = () => setStep(step + 1);

  return (
    <div className="min-h-screen bg-[#0A0906] text-[#E8D5B0] font-karla pb-20">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center bg-[#0D0B08] border-b border-[#3D3320] sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-tighter text-[#FBBF24] font-playfair-display-sc">CAFE·X</Link>
        <Link href="/" className="px-5 py-2 bg-[#1A160F] border border-[#3D3320] rounded-full text-xs font-black uppercase tracking-widest text-[#FBBF24]">
          Cancel
        </Link>
      </nav>

      <div className="max-w-xl mx-auto p-6 mt-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-2 text-[#FFFBF5] font-playfair-display-sc">Reserve a Table</h1>
          <p className="text-[#8B7355] font-medium uppercase tracking-widest text-xs">Experience Jakarta's finest cafe culture</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex gap-3 mb-12">
           {[1, 2, 3].map(s => (
             <div key={s} className="flex-1 space-y-2">
               <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#FBBF24] shadow-[0_0_10px_#FBBF24]' : 'bg-[#1A160F]'}`}></div>
               <p className={`text-[10px] font-black uppercase text-center ${step >= s ? 'text-[#FBBF24]' : 'text-[#3D3320]'}`}>Step 0{s}</p>
             </div>
           ))}
        </div>

        {step === 1 && (
          <div className="bg-[#0D0B08] p-8 rounded-[2rem] border border-[#3D3320] space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-[#FFFBF5] font-playfair-display-sc uppercase tracking-widest border-l-4 border-[#FBBF24] pl-4">01. Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em]">Select Date</label>
                  <input type="date" className="w-full p-4 bg-[#1A160F] rounded-2xl border border-[#3D3320] text-[#FFFBF5] font-bold focus:ring-2 focus:ring-[#FBBF24] outline-none" 
                    defaultValue={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em]">Select Time</label>
                  <select className="w-full p-4 bg-[#1A160F] rounded-2xl border border-[#3D3320] text-[#FFFBF5] font-bold focus:ring-2 focus:ring-[#FBBF24] outline-none appearance-none"
                    defaultValue={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}>
                     <option>10:00 AM</option>
                     <option>12:00 PM</option>
                     <option>04:00 PM</option>
                     <option>07:00 PM</option>
                     <option>09:00 PM</option>
                  </select>
               </div>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em]">Number of Guests</label>
               <div className="flex items-center gap-4 bg-[#1A160F] p-2 rounded-2xl border border-[#3D3320]">
                  <button onClick={() => setBookingData({...bookingData, guests: Math.max(1, bookingData.guests - 1)})} className="w-12 h-12 rounded-xl bg-[#0D0B08] text-[#FBBF24] font-black text-xl">-</button>
                  <div className="flex-1 text-center font-black text-xl text-[#FFFBF5]">{bookingData.guests} <span className="text-xs text-[#8B7355]">Persons</span></div>
                  <button onClick={() => setBookingData({...bookingData, guests: bookingData.guests + 1})} className="w-12 h-12 rounded-xl bg-[#78350F] text-[#FBBF24] font-black text-xl">+</button>
               </div>
            </div>
            <button onClick={handleNext} className="w-full py-5 bg-[#78350F] text-[#FBBF24] rounded-2xl font-black text-lg shadow-xl shadow-[#78350F]/20 hover:scale-[1.02] active:scale-95 transition-all">
               Continue to Atmosphere
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#0D0B08] p-8 rounded-[2rem] border border-[#3D3320] space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-[#FFFBF5] font-playfair-display-sc uppercase tracking-widest border-l-4 border-[#FBBF24] pl-4">02. Atmosphere</h2>
            <div className="grid grid-cols-2 gap-4">
               {['Indoor (AC)', 'Outdoor (Garden)', 'Private (Sultan)', 'Bar Counter'].map(type => (
                 <button key={type} 
                   onClick={() => setBookingData({...bookingData, tableType: type})}
                   className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${bookingData.tableType === type ? 'border-[#FBBF24] bg-[#FBBF24]/10' : 'border-[#1A160F] bg-[#1A160F] hover:border-[#3D3320]'}`}>
                   <span className={`block font-black mb-1 ${bookingData.tableType === type ? 'text-[#FBBF24]' : 'text-[#FFFBF5]'}`}>{type}</span>
                   <span className="text-[10px] text-[#8B7355] font-bold uppercase tracking-wider">Available</span>
                   {bookingData.tableType === type && <div className="absolute top-2 right-2 text-[#FBBF24]">✨</div>}
                 </button>
               ))}
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em]">Special Requests</label>
               <textarea className="w-full p-5 bg-[#1A160F] rounded-2xl border border-[#3D3320] text-[#FFFBF5] font-medium focus:ring-2 focus:ring-[#FBBF24] outline-none" rows={3} placeholder="Eg: Birthday celebration, High chair needed..."
                 onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}></textarea>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setStep(1)} className="flex-1 py-5 bg-[#1A160F] text-[#8B7355] rounded-2xl font-black text-lg border border-[#3D3320]">Back</button>
               <button onClick={handleNext} className="flex-[2] py-5 bg-[#78350F] text-[#FBBF24] rounded-2xl font-black text-lg shadow-xl shadow-[#78350F]/20">Go to Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#0D0B08] p-8 rounded-[2rem] border border-[#3D3320] space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black text-[#FFFBF5] font-playfair-display-sc uppercase tracking-widest border-l-4 border-[#FBBF24] pl-4">03. Review & Pay</h2>
            
            <div className="bg-[#1A160F] p-8 rounded-3xl space-y-5 border border-[#3D3320]">
               <div className="flex justify-between items-center"><span className="text-xs font-bold text-[#8B7355] uppercase">Party Size</span><span className="font-black text-[#FFFBF5]">{bookingData.guests} Persons</span></div>
               <div className="flex justify-between items-center"><span className="text-xs font-bold text-[#8B7355] uppercase">Date & Time</span><span className="font-black text-[#FFFBF5]">{bookingData.date} @ {bookingData.time}</span></div>
               <div className="flex justify-between items-center"><span className="text-xs font-bold text-[#8B7355] uppercase">Area</span><span className="font-black text-[#FFFBF5]">{bookingData.tableType}</span></div>
               
               <div className="border-t border-[#3D3320] pt-6 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-black text-[#FBBF24] uppercase tracking-widest block mb-1">Booking Fee</span>
                    <span className="text-[10px] text-[#8B7355] font-medium">Guarantee for No-Show</span>
                  </div>
                  <span className="text-3xl font-black text-[#FBBF24] font-playfair-display-sc">Rp {bookingFee.toLocaleString()}</span>
               </div>
               <p className="text-[10px] text-[#6B5A40] mt-4 italic text-center">* This fee will be 100% deducted from your total bill at the outlet.</p>
            </div>
            
            <div className="bg-[#10B981]/10 p-6 rounded-2xl flex items-center gap-4 border border-[#10B981]/20">
               <div className="text-3xl">🛡️</div>
               <p className="text-xs text-[#10B981] font-bold leading-relaxed uppercase tracking-wide">Secure encrypted payment via <b>Cafe-X Sultan Pay</b>. Your spot is guaranteed.</p>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setStep(2)} className="flex-1 py-5 bg-[#1A160F] text-[#8B7355] rounded-2xl font-black text-lg border border-[#3D3320]">Back</button>
               <button onClick={() => {
                 alert('Booking Successful! We have reserved your Sultan Table.');
                 window.location.href = '/';
               }} className="flex-[2] py-5 bg-[#78350F] text-[#FBBF24] rounded-2xl font-black text-lg shadow-2xl shadow-[#78350F]/40 hover:scale-105 transition-all">
                  Confirm & Pay Now
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
