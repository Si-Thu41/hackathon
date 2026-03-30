"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayData = {
  day: string;
  actual: number;
  target: number;
};

export default function RevenuePerformance() {
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const supabase = await getSupabase();

      const now = new Date();
      let startDate: Date;

      if (period === "weekly") {
        // Get start of the current week (Sunday)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
      } else {
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data: sales, error } = await supabase
        .from("sales")
        .select("sale_date, revenue")
        .gte("sale_date", startDate.toISOString().split("T")[0]) as {
          data: { sale_date: string; revenue: number }[] | null;
          error: any;
        };

      if (error) throw error;
      if (!sales) return;

      if (period === "weekly") {
        // Group by day of week (0=Sun ... 6=Sat)
        const grouped: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        sales.forEach((row) => {
          const dow = new Date(row.sale_date).getDay();
          grouped[dow] += Number(row.revenue);
        });

        // Calculate a simple target = avg daily * 1.1 (10% growth goal)
        const values = Object.values(grouped);
        const avg = values.reduce((a, b) => a + b, 0) / 7 || 1000;
        const target = Math.round(avg * 1.1);

        setData(
          DAY_LABELS.map((day, i) => ({
            day,
            actual: grouped[i],
            target,
          }))
        );
      } else {
        // Group by week number within the month
        const grouped: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        sales.forEach((row) => {
          const d = new Date(row.sale_date);
          const week = Math.ceil(d.getDate() / 7);
          grouped[week] = (grouped[week] ?? 0) + Number(row.revenue);
        });

        const values = Object.values(grouped).filter((v) => v > 0);
        const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1) || 1000;
        const target = Math.round(avg * 1.1);

        setData(
          [1, 2, 3, 4, 5].map((w) => ({
            day: `Wk${w}`,
            actual: grouped[w] ?? 0,
            target,
          }))
        );
      }
    } catch (err) {
      console.error("RevenuePerformance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Normalize bar heights relative to the max value
  const maxVal = Math.max(...data.map((d) => Math.max(d.actual, d.target)), 1);
  const pct = (val: number) => `${Math.round((val / maxVal) * 100)}%`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Revenue Performance</h3>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-200 rounded-sm"></span>
              <span className="text-xs font-bold text-slate-500">Target Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span>
              <span className="text-xs font-bold text-slate-500">Actual Revenue</span>
            </div>
          </div>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as "weekly" | "monthly")}
          className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg outline-none font-bold shadow-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="flex-1 min-h-[200px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between gap-2 h-48 border-b border-slate-100 pb-2">
              {data.map((col, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-end w-full h-full relative group"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
                    <div className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                      <div>Target: ฿{col.target.toLocaleString()}</div>
                      <div>Actual: ฿{col.actual.toLocaleString()}</div>
                    </div>
                    <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                  </div>

                  <div className="flex items-end justify-center w-full h-full gap-1.5">
                    {/* Target Bar */}
                    <div
                      className="w-full max-w-[14px] bg-slate-100 rounded-t-md transition-all duration-500"
                      style={{ height: pct(col.target) }}
                    ></div>
                    {/* Actual Bar */}
                    <div
                      className={`w-full max-w-[14px] rounded-t-md transition-all duration-500 group-hover:opacity-80 ${
                        col.actual >= col.target ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ height: pct(col.actual) }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-3">{col.day}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
