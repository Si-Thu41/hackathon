"use client";

import KpiCards from './kpiCards';
import RevenueTrend from './salesRevenue';
import TopMedicines from './bestSellingMedicine';
import InventoryHealth from './inventoryHealth';
import SalesPerformance from './salesPerformance';
import PaymentMethods from './paymentMethods';
import RevenuePerformance from './revenuePerformance';
import AddMedicineModal, { RemoveMedicineButton } from './addMedicineModal';
import AlertsPanel from './alertsPanel';
import { ExpiryTracker, DeadStock, RestockAlerts } from './inventoryInsights';
import SalesFinance from './salesFinance';
import AiSummary from './aiSummary';
import React, { useState, useRef, useCallback } from 'react';
import { Medicine } from './adminPanel';
import { getSupabase } from '@/utils/supabase';
import { translations, Lang } from '@/app/i18n/translations';

type Props = {
  medicines: Medicine[];
  totalSales: number;
  totalOrders: number;
  lowStockCount: number;
};

// ─── CSV helpers ─────────────────────────────────────────────────────────────
const CSV_HEADERS = ["unit_code", "name", "generic_name", "dosage", "form", "manufacturer", "price", "stock_quantity", "expiry_date", "image_url"];

function exportToCSV(medicines: Medicine[]) {
  const rows = medicines.map(m =>
    [
      m.unit_code ?? "",
      m.name,
      m.generic_name,
      m.dosage,
      m.form,
      m.manufacturer,
      m.price,
      m.stock_quantity,
      m.expiry_date ?? "",
      m.image_url ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  );
  const csv = [CSV_HEADERS.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medicines_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Partial<Medicine>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const values = line.match(/("([^"]|"")*"|[^,]*)/g)?.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"')) ?? [];
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return {
      unit_code: obj.unit_code || null,
      name: obj.name,
      generic_name: obj.generic_name,
      dosage: obj.dosage,
      form: obj.form,
      manufacturer: obj.manufacturer,
      price: Number(obj.price) || 0,
      stock_quantity: Number(obj.stock_quantity) || 0,
      expiry_date: obj.expiry_date || null,
      image_url: obj.image_url || null,
    };
  });
}

// ─── Language Switcher ───────────────────────────────────────────────────────
const LANG_LABELS: Record<Lang, string> = { en: "EN", th: "ภาษาไทย", ja: "日本語" };

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {(["en", "th", "ja"] as Lang[]).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
            lang === l ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminShell: React.FC<Props> = ({ medicines: initialMedicines, totalSales: _totalSales, totalOrders: _totalOrders, lowStockCount: _lowStockCount }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales'>('dashboard');
  const [inventoryTab, setInventoryTab] = useState<'all' | 'expiry' | 'deadstock' | 'restock'>('all');

  // ── Language ──
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  // ── Local medicine state (refreshable) ──
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);

  const refreshMedicines = useCallback(async () => {
    const supabase = await getSupabase();
    const { data } = await supabase.from("medicines").select() as { data: Medicine[] | null };
    if (data) setMedicines(data);
  }, []);

  const lowCount = medicines.filter(m => m.stock_quantity < 10).length;

  // ── Search & Filter ──
  const [search, setSearch] = useState("");
  const [formFilter, setFormFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const filtered = medicines.filter(m => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      (m.manufacturer ?? "").toLowerCase().includes(q) ||
      (m.unit_code ?? "").toLowerCase().includes(q);
    const matchForm = formFilter === "all" || m.form === formFilter;
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "out" && m.stock_quantity === 0) ||
      (stockFilter === "low" && m.stock_quantity > 0 && m.stock_quantity < 10);
    return matchSearch && matchForm && matchStock;
  });

  // ── Import CSV ──
  const importRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) throw new Error("No rows");
      const supabase = await getSupabase();
      const { error } = await supabase.from("medicines").insert(rows);
      if (error) throw error;
      await refreshMedicines();
      alert(t.importSuccess);
    } catch {
      alert(t.importError);
    } finally {
      setIsImporting(false);
      if (importRef.current) importRef.current.value = "";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <img
            src="/pharmacy_photo/pharmacy_logo.jpg"
            alt="Unipharma Logo"
            className="w-10 h-10 rounded-xl mr-3 flex-shrink-0 object-cover shadow-md"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-black text-slate-800 tracking-tight">Uni<span className="text-blue-600">pharma</span></span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Admin Portal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.menu}</p>

          {([
            {
              key: "dashboard",
              label: t.dashboard,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
            },
            {
              key: "inventory",
              label: t.inventory,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
            },
            {
              key: "sales",
              label: t.salesFinance,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
            },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {tab.icon}
              </svg>
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── RIGHT SIDE ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? t.welcomeAdmin : activeTab === 'inventory' ? t.inventoryManagement : t.salesFinance}
            </h2>
            <p className="text-sm text-slate-500 font-medium">{t.branch}</p>
          </div>
          <div className="flex items-center gap-4">
            <LangSwitcher lang={lang} setLang={setLang} />
            <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200 shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* MAIN SCROLL AREA */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* ══ DASHBOARD TAB ══ */}
            {activeTab === 'dashboard' && (
              <>
                <AiSummary lang={lang} />
                <AlertsPanel medicines={medicines} />
                <KpiCards />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><RevenueTrend /></div>
                  <div className="lg:col-span-1"><InventoryHealth /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><SalesPerformance /></div>
                  <div className="lg:col-span-1"><PaymentMethods /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><RevenuePerformance /></div>
                  <div className="lg:col-span-1"><TopMedicines /></div>
                </div>
              </>
            )}

            {/* ══ INVENTORY TAB ══ */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">

                {/* Sub-tab nav + action buttons */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {([
                      { key: 'all', label: t.allMedicines },
                      { key: 'expiry', label: t.expiryTracker },
                      { key: 'deadstock', label: t.deadStock },
                      { key: 'restock', label: t.restockAlerts },
                    ] as const).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setInventoryTab(tab.key)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                          inventoryTab === tab.key
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {inventoryTab === 'all' && (
                    <div className="flex items-center gap-2">
                      {/* Export */}
                      <button
                        onClick={() => exportToCSV(medicines)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t.exportCSV}
                      </button>

                      {/* Import */}
                      <label className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm cursor-pointer ${isImporting ? "opacity-50 pointer-events-none" : ""}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {isImporting ? "…" : t.importCSV}
                        <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
                      </label>

                      <AddMedicineModal onSuccess={refreshMedicines} />
                    </div>
                  )}
                </div>

                <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6">

                  {/* ALL MEDICINES */}
                  {inventoryTab === 'all' && (
                    <>
                      {/* Header + stats */}
                      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">{t.medicinesInventory}</h2>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {filtered.length} / {medicines.length} {t.total} · {lowCount} {t.lowStock}
                          </p>
                        </div>
                      </div>

                      {/* Search + Filters */}
                      <div className="flex flex-wrap gap-3 mb-5">
                        {/* Search */}
                        <div className="relative flex-1 min-w-48">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Form filter */}
                        <select
                          value={formFilter}
                          onChange={e => setFormFilter(e.target.value)}
                          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="all">{t.allForms}</option>
                          <option value="tablet">{t.tablet}</option>
                          <option value="capsule">{t.capsule}</option>
                          <option value="syrup">{t.syrup}</option>
                          <option value="injection">{t.injection}</option>
                        </select>

                        {/* Stock filter */}
                        <select
                          value={stockFilter}
                          onChange={e => setStockFilter(e.target.value)}
                          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="all">{t.allStock}</option>
                          <option value="low">{t.lowStock}</option>
                          <option value="out">{t.outOfStock}</option>
                        </select>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
                            <tr>
                              <th className="px-3 py-3 font-semibold">{t.image}</th>
                              <th className="px-3 py-3 font-semibold">{t.unitCode}</th>
                              <th className="px-4 py-3 font-semibold">{t.name}</th>
                              <th className="px-4 py-3 font-semibold">{t.dosage}</th>
                              <th className="px-4 py-3 font-semibold">{t.manufacturer}</th>
                              <th className="px-4 py-3 font-semibold">{t.price}</th>
                              <th className="px-4 py-3 font-semibold">{t.stock}</th>
                              <th className="px-4 py-3 font-semibold">{t.expiry}</th>
                              <th className="px-4 py-3 font-semibold"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filtered.map((medicine: Medicine) => (
                              <tr className="hover:bg-slate-50 transition-colors" key={medicine.medicine_id}>
                                {/* Image */}
                                <td className="px-3 py-3">
                                  {medicine.image_url ? (
                                    <img
                                      src={medicine.image_url}
                                      alt={medicine.name}
                                      className="w-9 h-9 rounded-lg object-cover border border-slate-100"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </td>
                                {/* Unit Code */}
                                <td className="px-3 py-3 font-mono text-xs text-slate-500">
                                  {medicine.unit_code ?? "—"}
                                </td>
                                {/* Name */}
                                <td className="px-4 py-4 font-bold text-slate-800">
                                  {medicine.name}
                                  <span className="block text-slate-400 font-normal italic text-xs mt-0.5">{medicine.generic_name}</span>
                                </td>
                                <td className="px-4 py-4 text-slate-600">{medicine.dosage} · {medicine.form}</td>
                                <td className="px-4 py-4 text-slate-500 text-xs">{medicine.manufacturer || "—"}</td>
                                <td className="px-4 py-4 font-medium text-blue-600">฿{medicine.price.toLocaleString()}</td>
                                <td className="px-4 py-4">
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                                    medicine.stock_quantity === 0
                                      ? "bg-red-100 text-red-700 border border-red-200"
                                      : medicine.stock_quantity < 10
                                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  }`}>
                                    {medicine.stock_quantity} {t.units}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-slate-500 text-xs font-mono">
                                  {medicine.expiry_date ?? "—"}
                                </td>
                                <td className="px-4 py-4">
                                  <RemoveMedicineButton medicine={medicine} onSuccess={refreshMedicines} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {filtered.length === 0 && (
                          <div className="text-center py-16 text-slate-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="font-medium">{medicines.length === 0 ? t.noMedicines : "No medicines match your search."}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {inventoryTab === 'expiry'    && <ExpiryTracker medicines={medicines} />}
                  {inventoryTab === 'deadstock' && <DeadStock medicines={medicines} />}
                  {inventoryTab === 'restock'   && <RestockAlerts medicines={medicines} />}

                </div>
              </div>
            )}

            {/* ══ SALES & FINANCE TAB ══ */}
            {activeTab === 'sales' && <SalesFinance />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
