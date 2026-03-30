export default function SalesPerformance() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Sales Performance</h3>
          <p className="text-sm text-slate-500 mt-1">See how your sales grow month by month</p>
        </div>
        <div className="flex gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span className="text-xs font-bold text-slate-600">2024</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span><span className="text-xs font-bold text-slate-600">2025</span></div>
        </div>
      </div>
      
      <div className="flex-1 relative w-full flex items-end min-h-[200px]">
        {/* SVG Line Chart */}
        <svg viewBox="0 0 800 200" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
          {/* 2024 Line (Emerald) */}
          <path d="M0,150 C100,100 200,180 300,120 C400,60 500,140 600,80 C700,20 800,100" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          
          {/* 2025 Line (Blue) with gradient fill */}
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,180 C100,150 200,190 300,140 C400,90 500,170 600,120 C700,70 800,130 L800,200 L0,200 Z" fill="url(#blueGradient)" />
          <path d="M0,180 C100,150 200,190 300,140 C400,90 500,170 600,120 C700,70 800,130" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      
      <div className="flex justify-between text-xs font-bold text-slate-400 mt-4 px-2">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
      </div>
    </div>
  )
}