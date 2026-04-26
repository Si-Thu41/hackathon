
"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

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

/* ───────────────────────── HELPERS ───────────────────────── */

function groupRevenue(
  sales: SaleRow[],
  period: Period
): { label: string; revenue: number; time: number }[] {
  const map: Record<string, { revenue: number; time: number }> = {};

  for (const s of sales) {
    const d = new Date(s.sale_date);
    let key = "";

    if (period === "daily") {
      key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "weekly") {
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(
        ((d.getTime() - startOfYear.getTime()) / 86400000 +
          startOfYear.getDay() +
          1) /
          7
      );
      key = `Wk ${week}`;
    } else {
      key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }

    if (!map[key]) {
      map[key] = { revenue: 0, time: d.getTime() };
    }

    map[key].revenue += Number(s.revenue);
  }

  return Object.entries(map)
    .map(([label, v]) => ({
      label,
      revenue: v.revenue,
      time: v.time,
    }))
    .sort((a, b) => a.time - b.time);
}

/* ───────────────────────── REVENUE CHART ───────────────────────── */

function RevenueChart({ sales }: { sales: SaleRow[] }) {
  const [period, setPeriod] = useState<Period>("daily");

  const data = groupRevenue(sales, period);

  const totalRevenue = sales.reduce((s, r) => s + Number(r.revenue), 0);
  const totalOrders = sales.length;
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-800">Revenue Trend</h3>
          <p className="text-xs text-slate-400">
            ฿{totalRevenue.toLocaleString()} total · {totalOrders} orders · avg
            ฿{avgOrderValue.toLocaleString()}
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-bold rounded-md ${
                period === p ? "bg-white shadow-sm" : "text-slate-500"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No sales data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
<YAxis tickFormatter={(v) => `฿${Number(v ?? 0).toLocaleString()}`} />              <Tooltip
formatter={(value) => `฿${Number(value ?? 0).toLocaleString()}`}              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                fill="#2563eb33"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── PROFIT TABLE ───────────────────────── */

function ProfitMarginTable({ items }: { items: SaleItemRow[] }) {
  const map: Record<
    string,
    { name: string; sold: number; revenue: number; cost: number | null }
  > = {};

  for (const item of items) {
    const name = item.medicines?.name ?? `Medicine ${item.medicine_id}`;
    const cost = item.medicines?.cost_price ?? null;

    if (!map[name]) {
      map[name] = { name, sold: 0, revenue: 0, cost };
    }

    map[name].sold += item.quantity;
    map[name].revenue += item.quantity * item.unit_price;
  }

  const stats = Object.values(map).map((m) => {
    if (m.cost) {
      const totalCost = m.cost * m.sold;
      const profit = m.revenue - totalCost;
      const margin = Math.round((profit / m.revenue) * 100);
      return { ...m, profit, margin };
    }
    return { ...m, profit: null, margin: null };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-bold text-slate-800 mb-4">Profit Margin</h3>

      <table className="w-full text-sm">
        <thead className="text-slate-400 border-b">
          <tr>
            <th className="text-left py-2">Medicine</th>
            <th>Sold</th>
            <th>Revenue</th>
            <th>Profit</th>
            <th>Margin</th>
          </tr>
        </thead>

        <tbody>
          {stats.map((m) => (
            <tr key={m.name} className="border-b">
              <td className="py-2">{m.name}</td>
              <td className="text-center">{m.sold}</td>
              <td className="text-center">฿{m.revenue}</td>
              <td className="text-center">
                {m.profit ? `฿${m.profit}` : "-"}
              </td>
              <td className="text-center">
                {m.margin ? `${m.margin}%` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── SALES BY PHARMACIST ───────────────────────── */

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

function SalesByPharmacist({ sales }: { sales: SaleRow[] }) {
  const map: Record<string, { orders: number; revenue: number }> = {};

  for (const s of sales) {
    const name = s.sold_by ?? "Unknown";

    if (!map[name]) map[name] = { orders: 0, revenue: 0 };

    map[name].orders += 1;
    map[name].revenue += Number(s.revenue);
  }

  const data = Object.entries(map).map(([name, v]) => ({
    name,
    ...v,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-bold text-slate-800 mb-4">Sales by Pharmacist</h3>

      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */

export default function SalesFinance() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [items, setItems] = useState<SaleItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    const supabase = await getSupabase();

    const [
      { data: salesData, error: salesError },
      { data: itemsData, error: itemsError }
    ] = await Promise.all([
      supabase
        .from("sales")
        .select("sale_id, sale_date, revenue")
        .order("sale_date", { ascending: true }),

      supabase
        .from("sale_items")
        .select(`
          medicine_id,
          quantity,
          unit_price,
          medicines(name)
        `)
    ]);

    if (salesError) console.error(salesError);
    if (itemsError) console.error(itemsError);

    setSales(salesData ?? []);
    setItems(itemsData ?? []);
    setLoading(false);
  }

  load();
}, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
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

