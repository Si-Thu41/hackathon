"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function RevenueTrend() {
  const [data, setData] = useState<{ date: string; revenue: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  async function fetchRevenue() {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("sales")
        .select("sale_date,revenue") as { data: { sale_date: string; revenue: number }[] | null; error: any };

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      if (!data) return;

      const grouped: Record<string, number> = {};

      data.forEach((row) => {
        // Convert strict ISO date into a clean "Month Day" format (e.g., "Mar 30")
        const dateObj = new Date(row.sale_date);
        const niceDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        if (!grouped[niceDate]) grouped[niceDate] = 0;
        grouped[niceDate] += Number(row.revenue);
      });

      const formatted = Object.entries(grouped).map(([date, revenue]) => ({
        date,
        revenue
      }));

      setData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      // Turn off the loading spinner once data is formatted
      setIsLoading(false); 
    }
  }

  // Enterprise-Grade Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-slate-500">Total Revenue:</span>
            <span className="font-bold text-blue-700">
              ฿{payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full h-full my-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Revenue Trend</h2>
          <p className="text-sm text-slate-500">Daily sales aggregate</p>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
          Live Database
        </div>
      </div>

      <div className="h-72 w-full">
        {isLoading ? (
          // Sleek Loading State
          <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-slate-400 font-medium animate-pulse">Fetching from Supabase...</p>
          </div>
        ) : data.length === 0 ? (
          // Empty State if no sales exist yet
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-400 font-medium">No sales data available yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Unipharma Blue Gradient */}
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `฿${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}