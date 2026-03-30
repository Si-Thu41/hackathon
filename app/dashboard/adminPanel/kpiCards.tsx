"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";

type Stats = {
  totalSales: number;
  avgOrderValue: number;
  todayRevenue: number;
  totalOrders: number;
  lowStock: number;
  outOfStock: number;
};

export default function KpiCards() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    avgOrderValue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const supabase = await getSupabase();
      const today = new Date().toISOString().split("T")[0];

      const [{ data: sales }, { data: medicines }] = await Promise.all([
        supabase.from("sales").select("revenue, sale_date") as Promise<{
          data: { revenue: number | string; sale_date: string }[] | null;
        }>,
        supabase.from("medicines").select("stock_quantity") as Promise<{
          data: { stock_quantity: number }[] | null;
        }>,
      ]);

      const totalOrders = sales?.length ?? 0;
      const totalSales = sales?.reduce((sum, s) => sum + Number(s.revenue), 0) ?? 0;
      const todayRevenue = sales
        ?.filter(s => s.sale_date?.startsWith(today))
        .reduce((sum, s) => sum + Number(s.revenue), 0) ?? 0;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
      const lowStock = medicines?.filter(m => m.stock_quantity > 0 && m.stock_quantity < 10).length ?? 0;
      const outOfStock = medicines?.filter(m => m.stock_quantity === 0).length ?? 0;

      setStats({ totalSales, avgOrderValue, todayRevenue, totalOrders, lowStock, outOfStock });
    }

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* Total Sales */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Total Sales</p>
          <h3 className="text-2xl font-bold text-slate-800">฿{stats.totalSales.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Avg order ฿{stats.avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Today's Revenue */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Today&apos;s Revenue</p>
          <h3 className="text-2xl font-bold text-slate-800">฿{stats.todayRevenue.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{stats.totalOrders} orders total</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Low Stock Items</p>
          <h3 className="text-2xl font-bold text-red-600">{stats.lowStock}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{stats.outOfStock} out of stock</p>
        </div>
      </div>

    </div>
  );
}
