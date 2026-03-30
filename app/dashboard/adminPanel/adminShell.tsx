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
import React, { useState } from 'react'; // Added useState import
import { Medicine } from './adminPanel';

type Props = {
  medicines: Medicine[];
  totalSales: number;
  totalOrders: number;
  lowStockCount: number;
};

const AdminShell: React.FC<Props> = ({ medicines, totalSales, totalOrders, lowStockCount }) => { // Changed AdminShellProps to Props
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales'>('dashboard');
  const [inventoryTab, setInventoryTab] = useState<'all' | 'expiry' | 'deadstock' | 'restock'>('all');

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
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <svg className="w-5 h-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="font-medium text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="font-medium text-sm">Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium text-sm">Sales & Finance</span>
          </button>
        </div>
      </aside>

      {/* ── RIGHT SIDE ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Welcome, Admin' : activeTab === 'inventory' ? 'Inventory Management' : 'Sales & Finance'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Pratunam Branch</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200 shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* MAIN SCROLL AREA */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* ══════════════════════════════════════════
                DASHBOARD TAB
            ══════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <>
                {/* ALERTS PANEL */}
                <AlertsPanel medicines={medicines} />

                {/* ROW 1: KPI CARDS */}
                <KpiCards />

                {/* ROW 2: Revenue Trend + Inventory Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><RevenueTrend /></div>
                  <div className="lg:col-span-1"><InventoryHealth /></div>
                </div>

                {/* ROW 3: Sales Performance + Payment Methods */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><SalesPerformance /></div>
                  <div className="lg:col-span-1"><PaymentMethods /></div>
                </div>

                {/* ROW 4: Revenue Performance + Top Medicines */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2"><RevenuePerformance /></div>
                  <div className="lg:col-span-1"><TopMedicines /></div>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════
                INVENTORY TAB
            ══════════════════════════════════════════ */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">

                {/* Sub-tab nav */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {([
                      { key: 'all', label: 'All Medicines' },
                      { key: 'expiry', label: 'Expiry Tracker' },
                      { key: 'deadstock', label: 'Dead Stock' },
                      { key: 'restock', label: 'Restock Alerts' },
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
                  {inventoryTab === 'all' && <AddMedicineModal />}
                </div>

                <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6">

                  {/* ALL MEDICINES */}
                  {inventoryTab === 'all' && (
                    <>
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Medicines Inventory</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{medicines.length} medicines total · {lowStockCount} low stock</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3 font-semibold">ID</th>
                              <th className="px-4 py-3 font-semibold">Name</th>
                              <th className="px-4 py-3 font-semibold">Dosage</th>
                              <th className="px-4 py-3 font-semibold">Manufacturer</th>
                              <th className="px-4 py-3 font-semibold">Price</th>
                              <th className="px-4 py-3 font-semibold">Stock</th>
                              <th className="px-4 py-3 font-semibold">Expiry</th>
                              <th className="px-4 py-3 font-semibold"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {medicines.map((medicine: Medicine) => ( // Added explicit type annotation to fix implicit 'any' type error
                              <tr className="hover:bg-slate-50 transition-colors" key={medicine.medicine_id}>
                                <td className="px-4 py-4 text-slate-400 text-xs">{medicine.medicine_id}</td>
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
                                    {medicine.stock_quantity} units
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-slate-500 text-xs font-mono">
                                  {medicine.expiry_date ?? "—"}
                                </td>
                                <td className="px-4 py-4">
                                  <RemoveMedicineButton medicine={medicine} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {medicines.length === 0 && (
                          <div className="text-center py-16 text-slate-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="font-medium">No medicines yet. Add your first one!</p>
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

            {/* ══════════════════════════════════════════
                SALES & FINANCE TAB
            ══════════════════════════════════════════ */}
            {activeTab === 'sales' && <SalesFinance />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
