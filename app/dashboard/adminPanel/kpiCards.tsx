"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";

export default function KpiCards() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    async function fetchStats() {
      const supabase = await getSupabase();
      
      // 1. Get Total Revenue & Orders
const { data: sales } = await supabase.from("sales").select("revenue") as { data: { revenue: number | string }[] | null };
const totalRev = sales?.reduce((sum: number, sale: any) => sum + Number(sale.revenue), 0) || 0;
const totalOrd = sales?.length || 0;

      // 2. Get Low Stock Count
      const { data: lowMeds } = await supabase.from("medicines").select("id").lte('stock', 50);
      const lowCount = lowMeds?.length || 0;

      setStats({ revenue: totalRev, orders: totalOrd, lowStock: lowCount });
    }
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
      
      {/* Revenue Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Total Sales</p>
          <h3 className="text-2xl font-bold text-slate-800">฿{stats.revenue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Total Orders</p>
          <h3 className="text-2xl font-bold text-slate-800">{stats.orders}</h3>
        </div>
      </div>

      {/* Low Stock Alert Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Low Stock Items</p>
          <h3 className="text-2xl font-bold text-red-600 animate-pulse">{stats.lowStock}</h3>
        </div>
      </div>

    </div>
  );
}