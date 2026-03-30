export default function QueueActivityChart() {
  // Mock data for pharmacy peak hours
  const hourlyData = [
    { time: '8 AM', volume: 12, height: 'h-[40%]' },
    { time: '9 AM', volume: 28, height: 'h-[75%]' },
    { time: '10 AM', volume: 45, height: 'h-full' }, // Peak hour
    { time: '11 AM', volume: 32, height: 'h-[80%]' },
    { time: '12 PM', volume: 20, height: 'h-[55%]' },
    { time: '1 PM', volume: 15, height: 'h-[45%]' },
    { time: '2 PM', volume: 22, height: 'h-[60%]' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Hourly Activity</h3>
          <p className="text-sm text-slate-500">Prescriptions dispensed today</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Volume</span>
        </div>
      </div>

      {/* CSS Grid Bar Chart */}
      <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto border-b border-slate-100 pb-2">
        {hourlyData.map((data, index) => (
          <div key={index} className="flex flex-col items-center justify-end w-full h-full group">
            {/* Tooltip (shows on hover) */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-700 mb-2">
              {data.volume}
            </span>
            
            {/* The Bar */}
            <div 
              className={`w-full max-w-[40px] ${data.height} bg-emerald-100 rounded-t-lg group-hover:bg-emerald-500 transition-colors duration-300 relative overflow-hidden`}
            >
              {/* Optional: Add a subtle gradient overlay to the bars */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent"></div>
            </div>
            
            {/* X-Axis Label */}
            <span className="text-xs font-medium text-slate-400 mt-3">{data.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}