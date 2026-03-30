"use client"

import { useState, useEffect } from "react";
import { getSupabase } from "@/utils/supabase";
import type { Medicine } from "../adminPanel/adminPanel";
import SellMedicineForm from "./sellMedicine";
import MoreMedButton from "./components/moreMedButton";
import Prescription from "@/app/gemini/prescription";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── MINI CALENDAR ────────────────────────────────────────────────────────────

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < adjustedFirst; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-bold text-slate-800 text-sm">{monthNames[month]}, {year}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => (
          <div key={i} className={`text-center text-xs py-1.5 rounded-full transition ${
            d === today.getDate()
              ? "bg-blue-600 text-white font-bold"
              : d ? "text-slate-600 hover:bg-slate-100 cursor-pointer" : ""
          }`}>
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

type RecentSale = {
  sale_id: number;
  sale_date: string | null;
  revenue: number;
  payment_method: string;
  medicine_name: string;
};

type TrendPoint = { label: string; revenue: number };

type Stats = {
  todayRevenue: number;
  ordersToday: number;
  dispensedToday: number;
  totalOrders: number;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PharmacistPanel() {
  const [view, setView] = useState<"dashboard" | "prescription" | "sell">("dashboard");
  const [count, setCount] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stats, setStats] = useState<Stats>({ todayRevenue: 0, ordersToday: 0, dispensedToday: 0, totalOrders: 0 });
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const supabase = await getSupabase();
      const today = new Date().toISOString().split("T")[0];

      const [{ data: medsData }, { data: salesData }, { data: itemsData }] = await Promise.all([
        supabase.from("medicines").select() as Promise<{ data: Medicine[] | null }>,
        supabase.from("sales").select("sale_id, sale_date, revenue, payment_method") as Promise<{
          data: { sale_id: number; sale_date: string; revenue: number; payment_method: string }[] | null;
        }>,
        supabase.from("sale_items").select("sale_id, quantity, medicines(name)") as Promise<{
          data: { sale_id: number; quantity: number; medicines: { name: string } | null }[] | null;
        }>,
      ]);

      setMedicines(medsData ?? []);

      if (salesData && itemsData) {
        const todaySales = salesData.filter(s => s.sale_date === today);
        const todayIds = new Set(todaySales.map(s => s.sale_id));

        const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.revenue), 0);
        const ordersToday = todaySales.length;
        const dispensedToday = itemsData.filter(i => todayIds.has(i.sale_id)).reduce((sum, i) => sum + i.quantity, 0);
        setStats({ todayRevenue, ordersToday, dispensedToday, totalOrders: salesData.length });

        // Build medicine name map per sale
        const saleNameMap: Record<number, string> = {};
        for (const item of itemsData) {
          if (!saleNameMap[item.sale_id]) saleNameMap[item.sale_id] = item.medicines?.name ?? "Unknown";
        }

        // Recent 8 sales
        setRecentSales(
          [...salesData].reverse().slice(0, 8).map(s => ({
            sale_id: s.sale_id,
            sale_date: s.sale_date,
            revenue: Number(s.revenue),
            payment_method: s.payment_method,
            medicine_name: saleNameMap[s.sale_id] ?? "—",
          }))
        );

        // 7-day trend
        const trendMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          trendMap[d.toISOString().split("T")[0]] = 0;
        }
        for (const s of salesData) {
          if (s.sale_date && trendMap[s.sale_date] !== undefined) {
            trendMap[s.sale_date] += Number(s.revenue);
          }
        }
        setTrend(
          Object.entries(trendMap).map(([date, revenue]) => ({
            label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            revenue,
          }))
        );
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* ── ICON SIDEBAR ──────────────────────────────────────────── */}
      <aside className="w-16 bg-white border-r border-slate-100 flex flex-col items-center py-5 gap-2 flex-shrink-0">
        {/* Logo */}
        <div className="w-9 h-9 mb-4 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
          <img src="/pharmacy_photo/pharmacy_logo.jpg" alt="logo" className="w-full h-full object-cover" />
        </div>

        {/* Dashboard */}
        <NavIcon
          active={view === "dashboard"}
          onClick={() => setView("dashboard")}
          title="Dashboard"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
        />

        {/* Prescription */}
        <NavIcon
          active={view === "prescription"}
          onClick={() => setView("prescription")}
          title="Prescription Scanner"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
        />

        {/* Sell */}
        <NavIcon
          active={view === "sell"}
          onClick={() => setView("sell")}
          title="Sell Medicine"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />}
        />

        <div className="flex-1" />

        {/* Avatar */}
        <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-200">
          P
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0 p-8">

        {/* ── DASHBOARD VIEW ── */}
        {view === "dashboard" && (
          <div className="max-w-3xl space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-5">
              <KpiCard
                label="Today's Revenue"
                value={`฿${stats.todayRevenue.toLocaleString()}`}
                sub={`${stats.ordersToday} orders today`}
                color="blue"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              />
              <KpiCard
                label="Orders Today"
                value={String(stats.ordersToday)}
                sub={`${stats.totalOrders} total all time`}
                color="emerald"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
              />
              <KpiCard
                label="Dispensed Today"
                value={String(stats.dispensedToday)}
                sub="units dispensed"
                color="purple"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
              />
            </div>

            {/* Dark Revenue Chart */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Revenue Trend</p>
                  <p className="text-3xl font-black mt-1">฿{stats.todayRevenue.toLocaleString()}</p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg font-semibold">Last 7 days</span>
              </div>
              <div className="h-44 mt-4">
                {trend.every(t => t.revenue === 0) ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">No sales data yet — complete a sale to see the trend</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => `฿${v}`} />
                      <Tooltip
                        formatter={(v: number) => [`฿${v.toLocaleString()}`, "Revenue"]}
                        contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "12px", color: "#f1f5f9" }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-bold text-slate-800 mb-5">Recent Sales</h3>
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
                    <th className="pb-3 pr-4 font-semibold">No</th>
                    <th className="pb-3 pr-4 font-semibold">Medicine</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 pr-4 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                        No sales recorded yet
                      </td>
                    </tr>
                  ) : recentSales.map((s, i) => (
                    <tr key={s.sale_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 pr-4 text-slate-400 text-xs font-mono">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-slate-700">{s.medicine_name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">{s.sale_date ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md capitalize">
                          {s.payment_method}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-800">฿{s.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRESCRIPTION VIEW ── */}
        {view === "prescription" && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Prescription Scanner</h1>
              <p className="text-sm text-slate-400 mt-0.5">Upload prescriptions for AI validation</p>
            </div>
            <div className="bg-gradient-to-b from-blue-900 to-slate-900 rounded-2xl p-6 shadow-xl border border-blue-800 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 transform translate-x-10 -translate-y-10" />
              <div className="mb-5 relative z-10">
                <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Smart Rx Scanner</h2>
                <p className="text-blue-200 text-sm mt-1">Upload external prescriptions for instant AI validation.</p>
              </div>
              <div className="relative z-10 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <Prescription />
              </div>
            </div>
          </div>
        )}

        {/* ── SELL VIEW ── */}
        {view === "sell" && (
          <div className="max-w-xl space-y-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Sell Medicine</h1>
              <p className="text-sm text-slate-400 mt-0.5">Process a direct sale</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="space-y-4">
                {Array.from({ length: count }, (_, i) => (
                  <SellMedicineForm key={i} medicines={medicines} count={i + 1} />
                ))}
              </div>
              <div className="mt-6">
                <MoreMedButton medCount={count} setMedCount={setCount} />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-l border-slate-100 flex-shrink-0 overflow-y-auto">

        {/* Calendar */}
        <div className="border-b border-slate-100">
          <MiniCalendar />
        </div>

        {/* Recent Activity */}
        <div className="p-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Sales</h4>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No recent sales</p>
            ) : recentSales.slice(0, 6).map(s => (
              <div key={s.sale_id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{s.medicine_name}</p>
                  <p className="text-xs text-slate-400">{s.sale_date ?? "—"}</p>
                </div>
                <span className="text-sm font-bold text-slate-800 flex-shrink-0">฿{s.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}

// ─── SHARED SUB-COMPONENTS ───────────────────────────────────────────────────

function NavIcon({ active, onClick, title, icon }: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
        active ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
    </button>
  );
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500" },
  emerald:{ bg: "bg-emerald-50",icon: "text-emerald-500" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500" },
};

function KpiCard({ label, value, sub, color, icon }: {
  label: string;
  value: string;
  sub: string;
  color: keyof typeof colorMap;
  icon: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <svg className={`w-5 h-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
        </div>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
