"use client"

import React, { useState } from "react"
import type { Lang } from "@/app/i18n/translations"

type Period = "today" | "month"

type TopMed = { name: string; qty: number; revenue: number }

type Metrics = {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  lowStockCount: number
  outOfStockCount: number
  expiringCount: number
  vaccineBookings: number
  topMeds: TopMed[]
  label: string
}

type SummaryData = {
  summary: string
  metrics: Metrics
}

const colorMap = {
  blue:  "bg-blue-50   text-blue-700   border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50  text-amber-700  border-amber-100",
  red:   "bg-red-50    text-red-700    border-red-100",
}

function MetricCard({ label, value, color }: { label: string; value: string; color: keyof typeof colorMap }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${colorMap[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
      <p className="text-xl font-black leading-none">{value}</p>
    </div>
  )
}

const langLabel: Record<Lang, string> = { en: "EN", th: "ภาษาไทย", ja: "日本語" }

export default function AiSummary({ lang }: { lang: Lang }) {
  const [period, setPeriod]     = useState<Period>("month")
  const [loading, setLoading]   = useState(false)
  const [data, setData]         = useState<SummaryData | null>(null)
  const [error, setError]       = useState("")
  const [reportLang, setReportLang] = useState<Lang | null>(null)

  // When language changes and a report already exists, clear it so the old
  // report in the wrong language is never shown stale.
  const prevLangRef = React.useRef(lang)
  if (prevLangRef.current !== lang) {
    prevLangRef.current = lang
    if (data) {
      setData(null)
      setReportLang(null)
    }
  }

  async function generate() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, lang }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); return }
      setData(json)
      setReportLang(lang)
    } catch {
      setError("Failed to generate report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          {/* Sparkle icon */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Business Performance Insights</h3>
            <p className="text-[11px] text-slate-400 font-medium">Powered by AI · Unipharma Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Period toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(["today", "month"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setData(null) }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  period === p ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p === "today" ? "Today" : "This Month"}
              </button>
            ))}
          </div>

          {/* Language badge — always shows which language will be used */}
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {langLabel[lang]}
          </span>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              loading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.5 3.5 0 0114.5 20.5H9.5a3.5 3.5 0 01-2.47-1.024l-.347-.347z" />
                </svg>
                {data ? "Regenerate" : "Generate Report"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5">

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="py-8 flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 font-medium">No report generated yet</p>
            <p className="text-xs text-slate-400">Choose a period and click <strong>Generate Report</strong> to get AI-powered insights.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Analyzing pharmacy data…</p>
            <p className="text-xs text-slate-400">This may take a few seconds</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Result */}
        {data && !loading && (
          <div className="space-y-4">

            {/* Disclaimer + report language tag */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                This analysis was generated using artificial intelligence. Please check for inaccuracies.
              </p>
              {reportLang && (
                <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
                  {langLabel[reportLang]}
                </span>
              )}
            </div>

            {/* Summary text */}
            <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>

            {/* KPI badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <MetricCard label="Revenue" value={`฿${data.metrics.totalRevenue.toLocaleString()}`} color="blue" />
              <MetricCard label="Orders" value={String(data.metrics.totalOrders)} color="green" />
              <MetricCard
                label="Low Stock"
                value={String(data.metrics.lowStockCount)}
                color={data.metrics.lowStockCount > 5 ? "red" : data.metrics.lowStockCount > 0 ? "amber" : "green"}
              />
              <MetricCard
                label="Expiring Soon"
                value={String(data.metrics.expiringCount)}
                color={data.metrics.expiringCount > 0 ? "amber" : "green"}
              />
            </div>

            {/* Secondary metrics row */}
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="bg-slate-50 border border-slate-100 text-slate-600 rounded-lg px-3 py-1.5 font-medium">
                Avg order: ฿{data.metrics.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="bg-slate-50 border border-slate-100 text-slate-600 rounded-lg px-3 py-1.5 font-medium">
                Out of stock: {data.metrics.outOfStockCount}
              </span>
              <span className="bg-slate-50 border border-slate-100 text-slate-600 rounded-lg px-3 py-1.5 font-medium">
                Vaccine bookings: {data.metrics.vaccineBookings}
              </span>
            </div>

            {/* Top medicines */}
            {data.metrics.topMeds.length > 0 && (
              <div className="pt-1 border-t border-slate-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Top Medicines · {data.metrics.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.metrics.topMeds.map((med, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-3 py-1">
                      <span className="text-[10px] font-black opacity-60">#{i + 1}</span>
                      <span className="text-xs font-semibold">{med.name}</span>
                      <span className="text-[11px] font-medium opacity-70">
                        · ฿{med.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
