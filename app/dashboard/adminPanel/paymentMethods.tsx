"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";

const COLORS: Record<string, string> = {
  cash: "#1e1b4b",
  card: "#818cf8",
  mobile: "#3b82f6",
};

const LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  mobile: "Mobile Payment",
};

type MethodStat = {
  method: string;
  count: number;
  percent: number;
  color: string;
  dasharray: string;
  dashoffset: string;
};

export default function PaymentMethods() {
  const [methods, setMethods] = useState<MethodStat[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchPaymentMethods() {
      const supabase = await getSupabase();
      const { data: sales } = await supabase
        .from("sales")
        .select("payment_method") as { data: { payment_method: string }[] | null };

      if (!sales || sales.length === 0) return;

      const counts: Record<string, number> = {};
      for (const sale of sales) {
        const m = sale.payment_method?.toLowerCase() ?? "other";
        counts[m] = (counts[m] ?? 0) + 1;
      }

      const totalCount = sales.length;
      setTotal(totalCount);

      // Build donut segments — each segment needs cumulative offset
      let cumulative = 0;
      const stats: MethodStat[] = Object.entries(counts).map(([method, count]) => {
        const percent = Math.round((count / totalCount) * 100);
        const dasharray = `${percent} ${100 - percent}`;
        const dashoffset = `${-cumulative}`;
        cumulative += percent;
        return {
          method,
          count,
          percent,
          color: COLORS[method] ?? "#94a3b8",
          dasharray,
          dashoffset,
        };
      });

      setMethods(stats);
    }

    fetchPaymentMethods();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-800">Payment Methods</h3>
        <button className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative my-4">
        <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90 drop-shadow-md">
          {methods.map((m) => (
            <circle
              key={m.method}
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={m.color}
              strokeWidth="6"
              strokeDasharray={m.dasharray}
              strokeDashoffset={m.dashoffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-slate-800">{total.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
        {methods.map((m) => (
          <div key={m.method} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
            <span className="text-xs font-bold text-slate-600">
              {LABELS[m.method] ?? m.method} ({m.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
