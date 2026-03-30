"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/utils/supabase";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type MonthlySales = {
  month: string;
  [year: number]: number;
};

export default function SalesPerformance() {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const [activeYear, setActiveYear] = useState<"all" | "last" | "current">("all");
  const [chartData, setChartData] = useState<MonthlySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("sales")
        .select("sale_date, revenue") as {
          data: { sale_date: string; revenue: number }[] | null;
          error: any;
        };

      if (error) throw error;
      if (!data) return;

      // Group revenue by year+month
      const grouped: Record<string, Record<number, number>> = {};

      MONTHS.forEach((m) => {
        grouped[m] = { [lastYear]: 0, [currentYear]: 0 };
      });

      data.forEach((row) => {
        const d = new Date(row.sale_date);
        const year = d.getFullYear();
        const month = MONTHS[d.getMonth()];
        if ((year === currentYear || year === lastYear) && grouped[month]) {
          grouped[month][year] = (grouped[month][year] ?? 0) + Number(row.revenue);
        }
      });

      setChartData(
        MONTHS.map((m) => ({
          month: m,
          [lastYear]: grouped[m][lastYear] ?? 0,
          [currentYear]: grouped[m][currentYear] ?? 0,
        }))
      );
    } catch (err) {
      console.error("SalesPerformance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 min-w-[160px]">
        <p className="text-xs text-slate-400 font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500">{p.dataKey}</span>
            <span className="text-sm font-bold" style={{ color: p.color }}>
              ฿{Number(p.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const showLast = activeYear === "all" || activeYear === "last";
  const showCurrent = activeYear === "all" || activeYear === "current";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Sales Performance</h3>
          <p className="text-sm text-slate-500 mt-1">Monthly revenue comparison</p>
        </div>

        <div className="flex gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <button
            onClick={() => setActiveYear(activeYear === "last" ? "all" : "last")}
            className={`text-xs font-bold px-2 py-0.5 rounded-md transition ${
              activeYear === "last" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {lastYear}
          </button>
          <button
            onClick={() => setActiveYear(activeYear === "current" ? "all" : "current")}
            className={`text-xs font-bold px-2 py-0.5 rounded-md transition ${
              activeYear === "current" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"
            }`}
          >
            {currentYear}
          </button>
        </div>
      </div>

      {/* CHART */}
      <div className="flex-1 min-h-[260px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLast && (
                <Line
                  type="monotone"
                  dataKey={lastYear}
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              )}
              {showCurrent && (
                <Line
                  type="monotone"
                  dataKey={currentYear}
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              )}
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 12 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
