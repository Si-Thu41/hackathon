"use client";

import { useState } from "react";

export default function SalesPerformance() {

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const [activeYear, setActiveYear] = useState<"all" | "last" | "current">("all");

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Sales Performance</h3>
          <p className="text-sm text-slate-500 mt-1">See how your sales grow month by month</p>
        </div>

        {/*  CLICKABLE YEAR BADGE */}
        <div className="flex gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">

          {/* LAST YEAR */}
          <button
            onClick={() => setActiveYear(activeYear === "last" ? "all" : "last")}
            className={`text-xs font-bold px-2 py-0.5 rounded-md transition ${
              activeYear === "last"
                ? "bg-emerald-500 text-white"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {lastYear}
          </button>

          {/* CURRENT YEAR */}
          <button
            onClick={() => setActiveYear(activeYear === "current" ? "all" : "current")}
            className={`text-xs font-bold px-2 py-0.5 rounded-md transition ${
              activeYear === "current"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {currentYear}
          </button>

        </div>
      </div>
      
      {/* CHART */}
      <div className="flex-1 relative w-full flex items-end min-h-[260px]">
        <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">

          {/* Emerald Line */}
          {(activeYear === "all" || activeYear === "last") && (
            <path 
              d="M0,150 C100,100 200,180 300,120 C400,60 500,140 600,80 C700,20 800,100" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="4" 
              strokeLinecap="round"
              filter="drop-shadow(0 4px 6px rgba(52,211,153,0.4))"
            />
          )}

          {/* Gradient */}
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Blue Fill */}
          {(activeYear === "all" || activeYear === "current") && (
            <path 
              d="M0,180 C100,150 200,190 300,140 C400,90 500,170 600,120 C700,70 800,130 L800,200 L0,200 Z" 
              fill="url(#blueGradient)" 
            />
          )}

          {/* Blue Line */}
          {(activeYear === "all" || activeYear === "current") && (
            <path 
              d="M0,180 C100,150 200,190 300,140 C400,90 500,170 600,120 C700,70 800,130" 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="4" 
              strokeLinecap="round"
              filter="drop-shadow(0 4px 6px rgba(37,99,235,0.4))"
            />
          )}

        </svg>
      </div>
      
      {/* MONTH LABELS */}
      <div className="flex justify-between text-xs font-bold text-slate-400 mt-4 px-2">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
        <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
        <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
      </div>

    </div>
  )
}