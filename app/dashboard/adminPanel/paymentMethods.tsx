export default function PaymentMethods() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-800">Payment Methods</h3>
        <button className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative my-4">
         {/* SVG Donut */}
         <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90 drop-shadow-md">
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e1b4b" strokeWidth="6" strokeDasharray="36 64" strokeDashoffset="0"></circle>
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#818cf8" strokeWidth="6" strokeDasharray="24 76" strokeDashoffset="-36"></circle>
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray="22 78" strokeDashoffset="-60"></circle>
            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#93c5fd" strokeWidth="6" strokeDasharray="18 82" strokeDashoffset="-82"></circle>
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-800">5,120</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1e1b4b]"></span><span className="text-xs font-bold text-slate-600">E-Wallet (36%)</span></div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#818cf8]"></span><span className="text-xs font-bold text-slate-600">Cash (24%)</span></div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span><span className="text-xs font-bold text-slate-600">QRIS (22%)</span></div>
         <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#93c5fd]"></span><span className="text-xs font-bold text-slate-600">Debit (18%)</span></div>
      </div>
    </div>
  )
}