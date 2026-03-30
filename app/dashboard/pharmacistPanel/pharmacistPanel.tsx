"use client"

import MoreMedButton from "./components/moreMedButton";
import { getSupabase } from "@/utils/supabase";
import SellMedicineForm from "./sellMedicine";
import type { Medicine } from "../adminPanel/adminPanel";
import { useState, useEffect } from "react";
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

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinical</p>
              
              {/* BUTTON 1: Read Prescription */}
              <button 
                onClick={() => changeDisplayComponent("prescription")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-bold text-left ${
                  displayComponent === "prescription" 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <span className="text-sm">Read Prescription</span>
              </button>
              
              {/* BUTTON 2: Sell Medicine */}
              <button 
                 onClick={() => changeDisplayComponent("sell")}
                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-bold text-left mt-1 ${
                  displayComponent === "sell" 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span className="text-sm">Sell Medicine</span>
              </button>
            </div>
          </aside>

          {/* =========================================
              RIGHT SIDE (Header + Main Dashboard)
              ========================================= */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* HEADER */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Welcome, Pharmacist</h2>
                <p className="text-sm text-emerald-600 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  On Shift • Pratunam Branch
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold border border-emerald-200 shadow-sm">
                  P
                </div>
              </div>
            </header>

            {/* MAIN SCROLLABLE AREA */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 md:p-8">
              <div className="max-w-7xl mx-auto">
                
                {/* =========================================
                    YOUR RENDER LOGIC WRAPPED IN THE NEW UI 
                    ========================================= */}
                
                {/* VIEW 1: SELL MEDICINE (Using YOUR exact map and MoreMedButton) */}
                <div className={displayComponent === "sell" ? "block" : "hidden"}>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <h2 className="text-2xl font-bold text-slate-800 mb-6">Direct Sale Terminal</h2>
                      
                     
                      <div className="space-y-4">
                        {Array.from({ length: count }, (_, index) => (
                            <SellMedicineForm key={index} medicines={medicines} count={index+1}/>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                          <MoreMedButton medCount={count} setMedCount={setCount}/>
                      </div>
                      
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

              </div>
            </main>

          </div>
        </div>
    );
}

