"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSupabase } from "@/utils/supabase";
import Prescription from "@/app/gemini/prescription";
import type { Medicine } from "../adminPanel/adminPanel";
import SellMedicineForm from "./sellMedicine";
import MoreMedButton from "./components/moreMedButton";

// Local date in YYYY-MM-DD — avoids UTC timezone shift (e.g. Thailand UTC+7)
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type RecentSale = {
  sale_id: number;
  sale_date: string | null;
  revenue: number;
  payment_method: string;
  medicine_name: string;
};

type Stats = {
  ordersToday: number;
  vaccinesToday: number;
  lowStock: number;
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

export type VaccineBooking = {
  booking_id: number;
  patient_name: string;
  phone: string | null;
  vaccine_name: string;
  booking_date: string;
  booking_time: string | null;
  status: "pending" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
};

// ─── Status config ────────────────────────────────────────────────────────────
const statusStyle: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
};

const statusDot: Record<string, string> = {
  pending:   "bg-amber-400",
  completed: "bg-emerald-400",
  cancelled: "bg-red-400",
};

// ─── New Booking Modal ────────────────────────────────────────────────────────
function NewBookingModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = localToday();
  const [form, setForm] = useState({
    patient_name: "", phone: "", vaccine_name: "",
    booking_date: today, booking_time: "", notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from("vaccine_bookings").insert([{
        patient_name: form.patient_name,
        phone: form.phone || null,
        vaccine_name: form.vaccine_name,
        booking_date: form.booking_date,
        booking_time: form.booking_time || null,
        notes: form.notes || null,
        status: "pending",
      }]);
      if (error) throw error;
      setOpen(false);
      setForm({ patient_name: "", phone: "", vaccine_name: "", booking_date: today, booking_time: "", notes: "" });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to save booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        New Booking
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">New Vaccine Booking</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name *</label>
                  <input required name="patient_name" value={form.patient_name} onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="081-234-5678"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Vaccine *</label>
                  <input required name="vaccine_name" value={form.vaccine_name} onChange={handleChange}
                    placeholder="e.g. Influenza"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
                  <input required type="date" name="booking_date" value={form.booking_date} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                  <input type="time" name="booking_time" value={form.booking_time} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                    placeholder="Allergies, dose number, etc."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                  {saving ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : "Save Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
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
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-bold text-slate-800">{monthNames[month]}, {year}</span>
      </div>
      <div className="mb-2 grid grid-cols-7">
        {dayNames.map(d => <div key={d} className="py-1 text-center text-[10px] font-bold text-slate-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className={`rounded-full py-1.5 text-center text-xs transition ${
            day === today.getDate() ? "bg-blue-600 font-bold text-white"
            : day ? "cursor-pointer text-slate-600 hover:bg-slate-100" : ""
          }`}>{day ?? ""}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PharmacistPanel() {
  const [view, setView] = useState<"dashboard" | "prescription" | "sell" | "bookings">("dashboard");
  const [count, setCount] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stats, setStats] = useState<Stats>({ ordersToday: 0, vaccinesToday: 0, lowStock: 0, totalOrders: 0 });
  const [bookings, setBookings] = useState<VaccineBooking[]>([]);
  const [bookingDate, setBookingDate] = useState(localToday());

  async function fetchAll() {
    const supabase = await getSupabase();
    const today = localToday();

    const [
      { data: medsData },
      { data: salesData },
      { data: itemsData },
      { data: bookingsData },
    ] = await Promise.all([
      supabase.from("medicines").select() as Promise<{ data: Medicine[] | null }>,
      supabase.from("sales").select("sale_id, sale_date, revenue, payment_method") as Promise<{ data: SaleRow[] | null }>,
      supabase.from("sale_items").select("sale_id, quantity, medicines(name)") as Promise<{ data: SaleItemRow[] | null }>,
      supabase.from("vaccine_bookings").select("*").order("booking_time", { ascending: true }) as Promise<{ data: VaccineBooking[] | null }>,
    ]);

    const meds = medsData ?? [];
    const sales = salesData ?? [];
    const items = itemsData ?? [];
    const allBookings = bookingsData ?? [];

    setMedicines(meds);
    setBookings(allBookings);

    const todaySales = sales.filter(s => s.sale_date?.slice(0, 10) === today);
    const vaccinesToday = allBookings.filter(b => b.booking_date?.slice(0, 10) === today && b.status !== "cancelled").length;
    const lowStock = meds.filter(m => m.stock_quantity < 10).length;

    setStats({
      ordersToday: todaySales.length,
      vaccinesToday,
      lowStock,
      totalOrders: sales.length,
    });

    const saleNameMap: Record<number, string> = {};
    for (const item of items) {
      if (!saleNameMap[item.sale_id]) saleNameMap[item.sale_id] = item.medicines?.name ?? "Unknown";
    }
    setRecentSales(
      [...sales].reverse().slice(0, 8).map(s => ({
        sale_id: s.sale_id,
        sale_date: s.sale_date,
        revenue: Number(s.revenue),
        payment_method: s.payment_method,
        medicine_name: saleNameMap[s.sale_id] ?? "-",
      }))
    );
  }

  async function updateStatus(booking_id: number, status: VaccineBooking["status"]) {
    const supabase = await getSupabase();
    await supabase.from("vaccine_bookings").update({ status }).eq("booking_id", booking_id);
    await fetchAll();
  }

  useEffect(() => { queueMicrotask(() => { void fetchAll(); }); }, []);

  const today = localToday();
  const todayBookings = bookings.filter(b => b.booking_date?.slice(0, 10) === today);
  const filteredBookings = bookings.filter(b => b.booking_date?.slice(0, 10) === bookingDate);
  const lowStockMeds = medicines.filter(m => m.stock_quantity < 10).slice(0, 5);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* ── Sidebar ── */}
      <aside className="flex w-16 flex-shrink-0 flex-col items-center gap-1 border-r border-slate-100 bg-white py-5">
        <div className="mb-5 h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl shadow-sm">
          <Image src="/pharmacy_photo/pharmacy_logo.jpg" alt="logo" width={36} height={36} className="h-full w-full object-cover" />
        </div>

        <NavIcon active={view === "dashboard"} onClick={() => setView("dashboard")} title="Dashboard"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
        />
        <NavIcon active={view === "bookings"} onClick={() => setView("bookings")} title="Vaccine Bookings"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
        />
        <NavIcon active={view === "prescription"} onClick={() => setView("prescription")} title="Prescription Scanner"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
        />
        <NavIcon active={view === "sell"} onClick={() => setView("sell")} title="Sell Medicine"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />}
        />

        <div className="flex-1" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-sm font-bold text-emerald-700">P</div>
      </aside>

      {/* ── Main ── */}
      <main className="min-w-0 flex-1 overflow-y-auto">

        {/* ══ DASHBOARD ══ */}
        {view === "dashboard" && (
          <div className="p-8 max-w-3xl space-y-7">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Pharmacist Portal</p>
                <h1 className="text-2xl font-black text-slate-800">{greeting} 👋</h1>
                <p className="mt-0.5 text-sm text-slate-400">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button onClick={fetchAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-4">
              <KpiCard
                label="Orders Today"
                value={String(stats.ordersToday)}
                sub={`${stats.totalOrders} all time`}
                color="blue"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
              />
              <KpiCard
                label="Vaccines Today"
                value={String(stats.vaccinesToday)}
                sub="appointments"
                color="emerald"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
              />
              <KpiCard
                label="Low Stock"
                value={String(stats.lowStock)}
                sub="need restocking"
                color={stats.lowStock > 0 ? "red" : "slate"}
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />}
              />
            </div>

            {/* Today's schedule + Low stock — side by side */}
            <div className="grid grid-cols-2 gap-5">

              {/* Today's vaccine schedule */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Today's Schedule</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{todayBookings.length} appt{todayBookings.length !== 1 ? "s" : ""}</span>
                </div>

                {todayBookings.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-slate-400">No appointments today</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {todayBookings.slice(0, 5).map(b => (
                      <div key={b.booking_id} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 text-right">
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {b.booking_time ? b.booking_time.slice(0, 5) : "—"}
                          </span>
                        </div>
                        <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${statusDot[b.status]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{b.patient_name}</p>
                          <p className="text-xs text-slate-400 truncate">{b.vaccine_name}</p>
                        </div>
                      </div>
                    ))}
                    {todayBookings.length > 5 && (
                      <button onClick={() => setView("bookings")} className="w-full text-xs text-blue-500 font-semibold hover:text-blue-600 pt-1">
                        +{todayBookings.length - 5} more → View all
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Low stock alert */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Low Stock</h3>
                </div>

                {lowStockMeds.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-emerald-500 font-medium">All stocked up ✓</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lowStockMeds.map(m => (
                      <div key={m.medicine_id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 truncate">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.dosage}</p>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-md ${
                          m.stock_quantity === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {m.stock_quantity === 0 ? "Out" : `${m.stock_quantity} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Recent Sales</h3>
                <span className="text-xs text-slate-400">{recentSales.length} latest</span>
              </div>
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-50 text-xs uppercase text-slate-400 bg-slate-50/50">
                    <th className="px-6 pb-3 pt-3 font-semibold">#</th>
                    <th className="px-4 pb-3 pt-3 font-semibold">Medicine</th>
                    <th className="px-4 pb-3 pt-3 font-semibold">Date</th>
                    <th className="px-4 pb-3 pt-3 font-semibold">Payment</th>
                    <th className="px-4 pb-3 pt-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSales.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No sales recorded yet</td></tr>
                  ) : recentSales.map((sale, i) => (
                    <tr key={sale.sale_id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-300">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-slate-700">{sale.medicine_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{sale.sale_date ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">{sale.payment_method}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">฿{sale.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ BOOKINGS ══ */}
        {view === "bookings" && (
          <div className="p-8 max-w-4xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Appointments</p>
                <h1 className="text-2xl font-black text-slate-800">Vaccine Bookings</h1>
                <p className="mt-0.5 text-sm text-slate-400">Manage and update appointment status</p>
              </div>
              <NewBookingModal onSuccess={fetchAll} />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600">Date</label>
              <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
              <span className="text-sm text-slate-400">
                {filteredBookings.length} appointment{filteredBookings.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <svg className="w-10 h-10 mx-auto mb-3 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-medium">No bookings for this date</p>
                </div>
              ) : (
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Time</th>
                      <th className="px-5 py-3 font-semibold">Patient</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">Vaccine</th>
                      <th className="px-5 py-3 font-semibold">Notes</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBookings.map(b => (
                      <tr key={b.booking_id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          {b.booking_time ? b.booking_time.slice(0, 5) : "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{b.patient_name}</td>
                        <td className="px-5 py-4 text-xs text-slate-400">{b.phone ?? "—"}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                            {b.vaccine_name}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 max-w-[150px] truncate">{b.notes ?? "—"}</td>
                        <td className="px-5 py-4">
                          <select value={b.status}
                            onChange={e => updateStatus(b.booking_id, e.target.value as VaccineBooking["status"])}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer outline-none ${statusStyle[b.status]}`}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ══ PRESCRIPTION ══ */}
        {view === "prescription" && (
          <div className="p-8 max-w-2xl space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">AI Scanner</p>
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

        {/* ══ SELL ══ */}
        {view === "sell" && (
          <div className="p-8 max-w-xl space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Point of Sale</p>
              <h1 className="text-2xl font-black text-slate-800">Sell Medicine</h1>
              <p className="mt-0.5 text-sm text-slate-400">Process a direct sale</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {Array.from({ length: count }, (_, i) => (
                  <SellMedicineForm key={i} medicines={medicines} count={i + 1} onSaleComplete={fetchAll} />
                ))}
              </div>
              <div className="mt-6">
                <MoreMedButton medCount={count} setMedCount={setCount} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Right sidebar ── */}
      <aside className="w-64 flex-shrink-0 overflow-y-auto border-l border-slate-100 bg-white">
        <div className="border-b border-slate-100"><MiniCalendar /></div>
        <div className="p-5">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Recent Sales</h4>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No recent sales</p>
            ) : recentSales.slice(0, 6).map(sale => (
              <div key={sale.sale_id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <svg className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-700">{sale.medicine_name}</p>
                  <p className="text-[11px] text-slate-400">{sale.sale_date ?? "—"}</p>
                </div>
                <span className="flex-shrink-0 text-xs font-bold text-slate-700">฿{sale.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function NavIcon({ active, onClick, title, icon }: { active: boolean; onClick: () => void; title: string; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
        active ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}>
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
    </button>
  );
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   num: "text-blue-700" },
  emerald:{ bg: "bg-emerald-50",icon: "text-emerald-500", num: "text-emerald-700" },
  red:    { bg: "bg-red-50",    icon: "text-red-500",    num: "text-red-700" },
  slate:  { bg: "bg-slate-100", icon: "text-slate-400",  num: "text-slate-700" },
};

function KpiCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string;
  color: keyof typeof colorMap; icon: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg}`}>
          <svg className={`h-4.5 w-4.5 ${c.icon}`} style={{ width: "1.125rem", height: "1.125rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
        </div>
      </div>
      <p className={`text-2xl font-black ${c.num}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}
