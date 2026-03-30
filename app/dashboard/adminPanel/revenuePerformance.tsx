export default function RevenuePerformance() {
  const data = [
    { day: 'Sun', target: 'h-[80%]', actual: 'h-[40%]' },
    { day: 'Mon', target: 'h-[70%]', actual: 'h-[60%]' },
    { day: 'Tue', target: 'h-[60%]', actual: 'h-[50%]' },
    { day: 'Wed', target: 'h-[90%]', actual: 'h-[75%]' },
    { day: 'Thr', target: 'h-[85%]', actual: 'h-[80%]' },
    { day: 'Fri', target: 'h-[100%]', actual: 'h-[90%]' },
    { day: 'Sat', target: 'h-[95%]', actual: 'h-[100%]' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Revenue Performance</h3>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-200 rounded-sm"></span><span className="text-xs font-bold text-slate-500">Target Revenue</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span><span className="text-xs font-bold text-slate-500">Actual Revenue</span></div>
          </div>
        </div>
        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg outline-none font-bold shadow-sm">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 min-h-[200px] mt-auto pt-4 border-b border-slate-100 pb-2">
         {data.map((col, i) => (
            <div key={i} className="flex flex-col items-center justify-end w-full h-full relative group">
               <div className="flex items-end justify-center w-full h-full gap-1.5">
                 {/* Target Bar */}
                 <div className={`w-full max-w-[14px] ${col.target} bg-slate-100 rounded-t-md transition-all`}></div>
                 {/* Actual Bar */}
                 <div className={`w-full max-w-[14px] ${col.actual} bg-indigo-600 rounded-t-md group-hover:bg-indigo-500 transition-colors`}></div>
               </div>
               <span className="text-xs font-bold text-slate-400 mt-3">{col.day}</span>
            </div>
         ))}
      </div>
    </div>
  )
}