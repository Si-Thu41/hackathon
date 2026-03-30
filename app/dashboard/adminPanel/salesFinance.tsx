"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type SaleRow = {
  sale_id: number;
  sale_date: string;
  revenue: number;
  sold_by: string | null;
};

type SaleItemRow = {
  medicine_id: number;
  quantity: number;
  unit_price: number;
  medicines: { name: string; cost_price: number | null } | null;
};

type Period = "daily" | "weekly" | "monthly";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function groupRevenue(sales: SaleRow[], period: Period): { label: string; revenue: number }[] {
  const map: Record<string, number> = {};

  for (const s of sales) {
    const d = new Date(s.sale_date);
    let key = "";

    if (period === "daily") {
      key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "weekly") {
      // ISO week label: "Week N"
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      key = `Wk ${week}`;
    } else {
      key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }

    map[key] = (map[key] ?? 0) + Number(s.revenue);
  }

  return Object.entries(map).map(([label, revenue]) => ({ label, revenue }));
}

// ─── REVENUE CHART ───────────────────────────────────────────────────────────

function RevenueChart({ sales }: { sales: SaleRow[] }) {
  const [period, setPeriod] = useState<Period>("daily");
  const data = groupRevenue(sales, period);
  const totalRevenue = sales.reduce((s, r) => s + Number(r.revenue), 0);
  const totalOrders = sales.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean; payload?: { value: number }[]; label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-blue-600">฿{payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Revenue Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">฿{totalRevenue.toLocaleString()} total · {totalOrders} orders · avg ฿{avgOrderValue.toLocaleString()}</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(["daily", "weekly", "monthly"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition capitalize ${
                period === p ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p === "daily" ? "Day" : p === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">No sales data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sfRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `฿${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#sfRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium">Total Revenue</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">฿{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="text-center border-x border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Total Orders</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{totalOrders}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium">Avg Order Value</p>
          <p className="text-lg font-bold text-blue-600 mt-0.5">฿{avgOrderValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ─── PROFIT MARGIN TABLE ─────────────────────────────────────────────────────

function ProfitMarginTable({ items }: { items: SaleItemRow[] }) {
  type MedStat = {
    name: string;
    sold: number;
    revenue: number;
    cost: number | null;
    profit: number | null;
    margin: number | null;
  };

  const map: Record<string, MedStat> = {};

  for (const item of items) {
    const name = item.medicines?.name ?? `Medicine #${item.medicine_id}`;
    const costPrice = item.medicines?.cost_price ?? null;

    if (!map[name]) {
      map[name] = { name, sold: 0, revenue: 0, cost: costPrice, profit: null, margin: null };
    }
    map[name].sold += item.quantity;
    map[name].revenue += item.unit_price * item.quantity;
  }

  const stats = Object.values(map).map(m => {
    if (m.cost !== null && m.cost > 0) {
      const totalCost = m.cost * m.sold;
      const profit = m.revenue - totalCost;
      const margin = Math.round((profit / m.revenue) * 100);
      return { ...m, profit, margin };
    }
    return m;
  }).sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0));

  const hasAnyMargin = stats.some(s => s.margin !== null);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Profit Margin per Medicine</h3>
          <p className="text-xs text-slate-400 mt-0.5">Based on unit_price from sales vs cost_price in medicines</p>
        </div>
        {!hasAnyMargin && (
          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-lg font-semibold">
            Add cost_price to medicines table to see margins
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-4 py-2 font-semibold">Medicine</th>
              <th className="px-4 py-2 font-semibold">Units Sold</th>
              <th className="px-4 py-2 font-semibold">Revenue</th>
              <th className="px-4 py-2 font-semibold">Profit</th>
              <th className="px-4 py-2 font-semibold">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map(m => (
              <tr key={m.name} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-700">{m.name}</td>
                <td className="px-4 py-3 text-slate-500">{m.sold}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">฿{m.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {m.profit !== null
                    ? <span className={m.profit >= 0 ? "text-emerald-600" : "text-red-500"}>฿{m.profit.toLocaleString()}</span>
                    : <span className="text-slate-300">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  {m.margin !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                        <div
                          className={`h-1.5 rounded-full ${m.margin >= 40 ? "bg-emerald-500" : m.margin >= 20 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${Math.min(m.margin, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${m.margin >= 40 ? "text-emerald-600" : m.margin >= 20 ? "text-amber-600" : "text-red-500"}`}>
                        {m.margin}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">No sales data available.</p>
        )}
      </div>
    </div>
  );
}

// ─── SALES BY PHARMACIST ─────────────────────────────────────────────────────

const PHARMACIST_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

function SalesByPharmacist({ sales }: { sales: SaleRow[] }) {
  const hasSoldBy = sales.some(s => s.sold_by);

  if (!hasSoldBy) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-2">Sales by Pharmacist</h3>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-medium">No pharmacist data yet</p>
          <p className="text-xs text-center max-w-xs">
            Add a <code className="bg-slate-100 px-1 rounded">sold_by</code> column to your <code className="bg-slate-100 px-1 rounded">sales</code> table and record the pharmacist&apos;s name when creating a sale.
          </p>
        </div>
      </div>
    );
  }

  const map: Record<string, { orders: number; revenue: number }> = {};
  for (const s of sales) {
    const name = s.sold_by ?? "Unknown";
    if (!map[name]) map[name] = { orders: 0, revenue: 0 };
    map[name].orders += 1;
    map[name].revenue += Number(s.revenue);
  }

  const data = Object.entries(map)
    .map(([name, v]) => ({ name, ...v, avg: Math.round(v.revenue / v.orders) }))
    .sort((a, b) => b.revenue - a.revenue);

  const topRevenue = data[0]?.revenue ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-800 mb-1">Sales by Pharmacist</h3>
      <p className="text-xs text-slate-400 mb-6">{data.length} pharmacist{data.length !== 1 ? "s" : ""} recorded</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `฿${v}`} />
              <Tooltip
                formatter={(value: number) => [`฿${value.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PHARMACIST_COLORS[i % PHARMACIST_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {data.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0`}
                style={{ backgroundColor: PHARMACIST_COLORS[i % PHARMACIST_COLORS.length] }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-bold text-slate-700 truncate">{p.name}</span>
                  <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{p.orders} orders</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(p.revenue / topRevenue) * 100}%`,
                      backgroundColor: PHARMACIST_COLORS[i % PHARMACIST_COLORS.length],
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 flex-shrink-0 font-mono">
                ฿{p.revenue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function SalesFinance() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [items, setItems] = useState<SaleItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = await getSupabase();
      const [{ data: salesData }, { data: itemsData }] = await Promise.all([
        supabase.from("sales").select("sale_id, sale_date, revenue, sold_by") as Promise<{
          data: SaleRow[] | null;
        }>,
        supabase.from("sale_items").select("medicine_id, quantity, unit_price, medicines(name, cost_price)") as Promise<{
          data: SaleItemRow[] | null;
        }>,
      ]);

      setSales(salesData ?? []);
      setItems(itemsData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RevenueChart sales={sales} />
      <ProfitMarginTable items={items} />
      <SalesByPharmacist sales={sales} />
    </div>
  );
}
