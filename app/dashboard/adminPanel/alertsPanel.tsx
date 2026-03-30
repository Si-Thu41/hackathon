"use client";

import type { Medicine } from "./adminPanel";

type Props = {
  medicines: Medicine[];
};

export default function AlertsPanel({ medicines }: Props) {
  const outOfStock = medicines.filter(m => m.stock_quantity === 0);
  const lowStock = medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < 10);

  if (outOfStock.length === 0 && lowStock.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <h3 className="text-base font-bold text-slate-800">Alerts</h3>
        <span className="ml-auto text-xs font-semibold text-slate-400">
          {outOfStock.length + lowStock.length} item{outOfStock.length + lowStock.length !== 1 ? "s" : ""} need attention
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {outOfStock.map(m => (
          <div key={m.medicine_id} className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-700 truncate">{m.name}</p>
              <p className="text-xs text-red-400">{m.dosage} · {m.form}</p>
            </div>
            <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full flex-shrink-0">
              Out of Stock
            </span>
          </div>
        ))}

        {lowStock.map(m => (
          <div key={m.medicine_id} className="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-700 truncate">{m.name}</p>
              <p className="text-xs text-amber-400">{m.dosage} · {m.form}</p>
            </div>
            <span className="text-xs font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full flex-shrink-0">
              {m.stock_quantity} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
