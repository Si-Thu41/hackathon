"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getSupabase } from "@/utils/supabase";
import Prescription from "@/app/gemini/prescription";
import type { Medicine } from "../adminPanel/adminPanel";
import SellMedicineForm from "./sellMedicine";
import MoreMedButton from "./components/moreMedButton";

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < adjustedFirst; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-bold text-slate-800">
            {monthNames[month]}, {year}
          </span>
        </div>
      </div>
      <div className="mb-2 grid grid-cols-7">
        {dayNames.map((day) => (
          <div key={day} className="py-1 text-center text-[10px] font-bold text-slate-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, index) => (
          <div
            key={index}
            className={`rounded-full py-1.5 text-center text-xs transition ${
              day === today.getDate()
                ? "bg-blue-600 font-bold text-white"
                : day
                  ? "cursor-pointer text-slate-600 hover:bg-slate-100"
                  : ""
            }`}
          >
            {day ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

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

type SaleRow = {
  sale_id: number;
  sale_date: string | null;
  revenue: number;
  payment_method: string;
};

type SaleItemRow = {
  sale_id: number;
  quantity: number;
  medicines: { name: string } | null;
};

export default function PharmacistPanel() {
  const [view, setView] = useState<"dashboard" | "prescription" | "sell">("dashboard");
  const [count, setCount] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stats, setStats] = useState<Stats>({ todayRevenue: 0, ordersToday: 0, dispensedToday: 0, totalOrders: 0 });
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  async function fetchAll() {
    const supabase = await getSupabase();
    const today = new Date().toISOString().split("T")[0];

    const [{ data: medsData }, { data: salesData }, { data: itemsData }] = await Promise.all([
      supabase.from("medicines").select() as Promise<{ data: Medicine[] | null }>,
      supabase.from("sales").select("sale_id, sale_date, revenue, payment_method") as Promise<{ data: SaleRow[] | null }>,
      supabase.from("sale_items").select("sale_id, quantity, medicines(name)") as Promise<{ data: SaleItemRow[] | null }>,
    ]);

    setMedicines(medsData ?? []);

    if (!salesData || !itemsData) {
      setStats({ todayRevenue: 0, ordersToday: 0, dispensedToday: 0, totalOrders: 0 });
      setRecentSales([]);
      setTrend([]);
      return;
    }

    const todaySales = salesData.filter((sale) => sale.sale_date === today);
    const todayIds = new Set(todaySales.map((sale) => sale.sale_id));
    const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.revenue), 0);
    const ordersToday = todaySales.length;
    const dispensedToday = itemsData
      .filter((item) => todayIds.has(item.sale_id))
      .reduce((sum, item) => sum + item.quantity, 0);

    setStats({
      todayRevenue,
      ordersToday,
      dispensedToday,
      totalOrders: salesData.length,
    });

    const saleNameMap: Record<number, string> = {};
    for (const item of itemsData) {
      if (!saleNameMap[item.sale_id]) {
        saleNameMap[item.sale_id] = item.medicines?.name ?? "Unknown";
      }
    }

    setRecentSales(
      [...salesData].reverse().slice(0, 8).map((sale) => ({
        sale_id: sale.sale_id,
        sale_date: sale.sale_date,
        revenue: Number(sale.revenue),
        payment_method: sale.payment_method,
        medicine_name: saleNameMap[sale.sale_id] ?? "-",
      }))
    );

    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trendMap[date.toISOString().split("T")[0]] = 0;
    }

    for (const sale of salesData) {
      if (sale.sale_date && trendMap[sale.sale_date] !== undefined) {
        trendMap[sale.sale_date] += Number(sale.revenue);
      }
    }

    setTrend(
      Object.entries(trendMap).map(([date, revenue]) => ({
        label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
      }))
    );
  }

  useEffect(() => {
    queueMicrotask(() => {
      void fetchAll();
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <aside className="flex w-16 flex-shrink-0 flex-col items-center gap-2 border-r border-slate-100 bg-white py-5">
        <div className="mb-4 h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
          <Image
            src="/pharmacy_photo/pharmacy_logo.jpg"
            alt="logo"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>

        <NavIcon
          active={view === "dashboard"}
          onClick={() => setView("dashboard")}
          title="Dashboard"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
        />
        <NavIcon
          active={view === "prescription"}
          onClick={() => setView("prescription")}
          title="Prescription Scanner"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
        />
        <NavIcon
          active={view === "sell"}
          onClick={() => setView("sell")}
          title="Sell Medicine"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />}
        />

        <div className="flex-1" />

        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-sm font-bold text-emerald-700">
          P
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-8">
        {view === "dashboard" && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
              <p className="mt-0.5 text-sm text-slate-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

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

            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <div className="mb-1 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue Trend</p>
                  <p className="mt-1 text-3xl font-black">฿{stats.todayRevenue.toLocaleString()}</p>
                </div>
                <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400">
                  Last 7 days
                </span>
              </div>
              <div className="mt-4 h-44">
                {trend.every((point) => point.revenue === 0) ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No sales data yet - complete a sale to see the trend
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(value) => `฿${value}`} />
                      <Tooltip
                        formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                          const normalizedValue = Array.isArray(value) ? value[0] : value;
                          return [`฿${Number(normalizedValue ?? 0).toLocaleString()}`, "Revenue"];
                        }}
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-base font-bold text-slate-800">Recent Sales</h3>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
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
                      <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                        No sales recorded yet
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale, index) => (
                      <tr key={sale.sale_id} className="transition hover:bg-slate-50">
                        <td className="py-3 pr-4 font-mono text-xs text-slate-400">{index + 1}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                              <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <span className="font-semibold text-slate-700">{sale.medicine_name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-400">{sale.sale_date ?? "-"}</td>
                        <td className="py-3 pr-4">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">
                            {sale.payment_method}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-800">฿{sale.revenue.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "prescription" && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Prescription Scanner</h1>
              <p className="mt-0.5 text-sm text-slate-400">Upload prescriptions for AI validation</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-blue-800 bg-gradient-to-b from-blue-900 to-slate-900 p-6 text-white shadow-xl">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-10 rounded-full bg-blue-500 opacity-20 blur-3xl" />
              <div className="relative z-10 mb-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/20">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Smart Rx Scanner</h2>
                <p className="mt-1 text-sm text-blue-200">Upload external prescriptions for instant AI validation.</p>
              </div>
              <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <Prescription />
              </div>
            </div>
          </div>
        )}

        {view === "sell" && (
          <div className="max-w-xl space-y-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Sell Medicine</h1>
              <p className="mt-0.5 text-sm text-slate-400">Process a direct sale</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {Array.from({ length: count }, (_, index) => (
                  <SellMedicineForm
                    key={index}
                    medicines={medicines}
                    count={index + 1}
                    onSaleComplete={fetchAll}
                  />
                ))}
              </div>
              <div className="mt-6">
                <MoreMedButton medCount={count} setMedCount={setCount} />
              </div>
            </div>
          </div>
        )}
      </main>

      <aside className="w-72 flex-shrink-0 overflow-y-auto border-l border-slate-100 bg-white">
        <div className="border-b border-slate-100">
          <MiniCalendar />
        </div>

        <div className="p-5">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Recent Sales</h4>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No recent sales</p>
            ) : (
              recentSales.slice(0, 6).map((sale) => (
                <div key={sale.sale_id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                    <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700">{sale.medicine_name}</p>
                    <p className="text-xs text-slate-400">{sale.sale_date ?? "-"}</p>
                  </div>
                  <span className="flex-shrink-0 text-sm font-bold text-slate-800">฿{sale.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavIcon({
  active,
  onClick,
  title,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
        active ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </button>
  );
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-500" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500" },
};

function KpiCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: keyof typeof colorMap;
  icon: React.ReactNode;
}) {
  const currentColor = colorMap[color];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${currentColor.bg}`}>
          <svg className={`h-5 w-5 ${currentColor.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}
