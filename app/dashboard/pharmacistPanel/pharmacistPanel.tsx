"use client"

import { useState, useEffect } from "react";
import { getSupabase } from "@/utils/supabase";
import type { Medicine } from "../adminPanel/adminPanel";
import SellMedicineForm from "./sellMedicine";
import MoreMedButton from "./components/moreMedButton";
import Prescription from "@/app/gemini/prescription";
import QueueActivityChart from "./components/queueActivityChart";

// Mock data for the live queue demo 
const initialQueue = [
  { id: "Q-104", patient: "Somchai K.", time: "10:42 AM", status: "Waiting", type: "External Rx" },
  { id: "Q-105", patient: "Nattapong V.", time: "10:45 AM", status: "Processing", type: "Internal Clinic" },
  { id: "Q-106", patient: "Priya M.", time: "10:48 AM", status: "Ready", type: "Refill" },
];

export default function PharmacistPanel(){
    const [count, setCount] = useState(1);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [displayComponent,setDisplayComponent]=useState("prescription");

    const [queue, setQueue] = useState(initialQueue);

    function changeDisplayComponent(component: string) {
        setDisplayComponent(component);
    }
    useEffect(() => {
        async function fetchMedicines() {
            const supabase = await getSupabase();
            const { data } = await supabase.from('medicines').select() as { data: Medicine[] };
            setMedicines(data || []);
        }
        fetchMedicines();
    }, []);
    
    return (
        // MAIN WRAPPER: Locks screen height for the dashboard look
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
          
          {/* =========================================
              LEFT SIDEBAR (Clinical Theme)
              ========================================= */}
          <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
            <div className="h-20 flex items-center px-6 border-b border-slate-100">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-md border border-emerald-600">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">Rx Desk</span>
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

               {/* VIEW 2: READ PRESCRIPTION (Queue + Your Prescription Component) */}
                <div className={displayComponent === "prescription" ? "block" : "hidden"}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: The Active Queue & Chart (Takes up 2/3 of the screen) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">Live Queue</h2>
                          <p className="text-sm text-slate-500">Patients waiting for dispensing</p>
                        </div>
                        <div className="text-2xl font-black text-slate-300">03</div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="min-w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4">Token</th>
                              <th className="px-6 py-4">Patient Name</th>
                              <th className="px-6 py-4">Source</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {queue.map((item, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-bold text-slate-700">{item.id}</td>
                                <td className="px-6 py-4 font-semibold text-slate-900">{item.patient}</td>
                                <td className="px-6 py-4 text-slate-500">{item.type}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                    item.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                                    item.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                    'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* ✨ CHART IS NOW SAFELY LOCKED INSIDE THE LEFT COLUMN ✨ */}
                      <div className="mt-6">
                        <QueueActivityChart />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: YOUR Prescription Component */}
                    <div className="lg:col-span-1 self-start">
                            <div className="bg-gradient-to-b from-blue-900 to-slate-900 rounded-2xl p-5 shadow-xl border border-blue-800 text-white relative overflow-hidden h-fit max-w-sm mx-auto flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 transform translate-x-10 -translate-y-10"></div>

                        <div className="mb-6 relative z-10">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </div>
                          <h2 className="text-xl font-bold">Smart Rx Scanner</h2>
                          <p className="text-blue-200 text-sm mt-1">Upload external prescriptions for instant AI validation.</p>
                        </div>

                        {/* THIS IS YOUR EXACT GEMINI COMPONENT */}
                        <div className="relative z-10 mt-2 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 flex-1 overflow-hidden">
                           <Prescription />
                        </div>
                        
                      </div>
                    </div>
                  </div>
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
