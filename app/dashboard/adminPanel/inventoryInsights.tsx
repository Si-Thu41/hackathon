"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";
import type { Medicine } from "./adminPanel";

// ─── EXPIRY DATE TRACKER ─────────────────────────────────────────────────────

type ExpiryFilter = 7 | 30 | 90;

export function ExpiryTracker({ medicines }: { medicines: Medicine[] }) {
  const [filter, setFilter] = useState<ExpiryFilter>(30);

  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(today.getDate() + filter);

  const expiring = medicines
    .filter(m => {
      if (!m.expiry_date) return false;
      const d = new Date(m.expiry_date);
      return d >= today && d <= cutoff;
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const urgencyStyle = (days: number) => {
    if (days <= 7) return { row: "bg-red-50", badge: "bg-red-500 text-white", text: "text-red-700" };
    if (days <= 30) return { row: "bg-amber-50", badge: "bg-amber-500 text-white", text: "text-amber-700" };
    return { row: "bg-blue-50", badge: "bg-blue-400 text-white", text: "text-blue-700" };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Expiry Date Tracker</h3>
          <p className="text-xs text-slate-400 mt-0.5">{expiring.length} medicine{expiring.length !== 1 ? "s" : ""} expiring within {filter} days</p>
        </div>
        <div className="flex gap-1">
          {([7, 30, 90] as ExpiryFilter[]).map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                filter === d ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {expiring.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">No medicines expiring within {filter} days</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2 font-semibold">Medicine</th>
                <th className="px-4 py-2 font-semibold">Dosage</th>
                <th className="px-4 py-2 font-semibold">Stock</th>
                <th className="px-4 py-2 font-semibold">Expiry Date</th>
                <th className="px-4 py-2 font-semibold">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expiring.map(m => {
                const days = daysUntil(m.expiry_date!);
                const style = urgencyStyle(days);
                return (
                  <tr key={m.medicine_id} className={`${style.row} transition`}>
                    <td className="px-4 py-3">
                      <p className={`font-bold text-sm ${style.text}`}>{m.name}</p>
                      <p className="text-xs text-slate-400 italic">{m.generic_name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{m.dosage} · {m.form}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{m.stock_quantity} units</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{m.expiry_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${style.badge}`}>
                        {days}d
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── DEAD STOCK ──────────────────────────────────────────────────────────────

type DeadMedicine = Medicine & { last_sold: string | null };

export function DeadStock({ medicines }: { medicines: Medicine[] }) {
  const [deadStock, setDeadStock] = useState<DeadMedicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = await getSupabase();
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data: recentSales } = await supabase
        .from("sale_items")
        .select("medicine_id, sales(sale_date)")
        .gte("sales.sale_date", since.toISOString().split("T")[0]) as {
          data: { medicine_id: number; sales: { sale_date: string } | null }[] | null;
        };

      const soldIds = new Set(
        recentSales?.filter(r => r.sales !== null).map(r => r.medicine_id) ?? []
      );

      const dead: DeadMedicine[] = medicines
        .filter(m => !soldIds.has(m.medicine_id) && m.stock_quantity > 0)
        .map(m => ({ ...m, last_sold: null }));

      setDeadStock(dead);
      setLoading(false);
    }
    fetch();
  }, [medicines]);

  if (loading) return <div className="py-10 text-center text-slate-400 text-sm">Loading...</div>;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">Dead Stock</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {deadStock.length} medicine{deadStock.length !== 1 ? "s" : ""} with no sales in the last 30 days
        </p>
      </div>

      {deadStock.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">All stocked medicines have been sold recently</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2 font-semibold">Medicine</th>
                <th className="px-4 py-2 font-semibold">Dosage</th>
                <th className="px-4 py-2 font-semibold">Stock</th>
                <th className="px-4 py-2 font-semibold">Price</th>
                <th className="px-4 py-2 font-semibold">Tied-up Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deadStock.map(m => (
                <tr key={m.medicine_id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-700">{m.name}</p>
                    <p className="text-xs text-slate-400 italic">{m.generic_name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{m.dosage} · {m.form}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">
                      {m.stock_quantity} units
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">฿{m.price.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-orange-600">
                    ฿{(m.price * m.stock_quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── RESTOCK ALERTS ──────────────────────────────────────────────────────────

const RESTOCK_TARGET = 50;

export function RestockAlerts({ medicines }: { medicines: Medicine[] }) {
  const needsRestock = medicines
    .filter(m => m.stock_quantity < 10)
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">Restock Alerts</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {needsRestock.length} medicine{needsRestock.length !== 1 ? "s" : ""} need restocking · Target stock: {RESTOCK_TARGET} units
        </p>
      </div>

      {needsRestock.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">All medicines are sufficiently stocked</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2 font-semibold">Medicine</th>
                <th className="px-4 py-2 font-semibold">Current Stock</th>
                <th className="px-4 py-2 font-semibold">Reorder Qty</th>
                <th className="px-4 py-2 font-semibold">Est. Cost</th>
                <th className="px-4 py-2 font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {needsRestock.map(m => {
                const reorderQty = RESTOCK_TARGET - m.stock_quantity;
                const isOut = m.stock_quantity === 0;
                return (
                  <tr key={m.medicine_id} className={`transition ${isOut ? "bg-red-50" : "bg-amber-50/50"}`}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-700">{m.name}</p>
                      <p className="text-xs text-slate-400 italic">{m.generic_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        isOut ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {m.stock_quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">
                      + {reorderQty} units
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-bold font-mono text-xs">
                      ฿{(m.price * reorderQty).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isOut
                          ? "bg-red-500 text-white"
                          : m.stock_quantity <= 5
                          ? "bg-orange-400 text-white"
                          : "bg-amber-400 text-white"
                      }`}>
                        {isOut ? "Critical" : m.stock_quantity <= 5 ? "High" : "Medium"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
