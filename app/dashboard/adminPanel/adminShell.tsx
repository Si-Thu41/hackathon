"use client";

import RevenueTrend from './salesRevenue';
import TopMedicines from './bestSellingMedicine';
import InventoryHealth from './inventoryHealth';
import SalesPerformance from './salesPerformance';
import PaymentMethods from './paymentMethods';
import RevenuePerformance from './revenuePerformance';
import AddMedicineModal, { RemoveMedicineButton } from './addMedicineModal';
import type { Medicine } from './adminPanel';
import { useState } from 'react';

type Props = {
  medicines: Medicine[];
  totalSales: number;
  totalOrders: number;
  lowStockCount: number;
};

export default function AdminShell({ medicines, totalSales, totalOrders, lowStockCount }: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory'>('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md border border-blue-700">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">Unipharma</span>
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
        </div>
      </aside>

      {/* ── RIGHT SIDE ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Welcome, Admin' : 'Inventory Management'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Pratunam Branch</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder={activeTab === 'inventory' ? "Search medicines..." : "Search inventory..."}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
                {/* ROW 1: KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Sales</p>
                      <h3 className="text-2xl font-bold text-slate-800">฿{totalSales.toLocaleString()}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                      <h3 className="text-2xl font-bold text-slate-800">{totalOrders}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Low Stock Items</p>
                      <h3 className="text-2xl font-bold text-red-600">{lowStockCount}</h3>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19.428 15.341a8 8 0 11-10.77-10.77M8 8l8 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Medicines</p>
                      <h3 className="text-2xl font-bold text-slate-800">{medicines.length}</h3>
                    </div>
                  </div>

                </div>

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
              <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Medicines Inventory</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{medicines.length} medicines total · {lowStockCount} low stock</p>
                  </div>
                  <AddMedicineModal />
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
                        <th className="px-4 py-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {medicines.map((medicine) => (
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
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
