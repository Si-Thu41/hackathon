"use client"

import type { Medicine } from "../adminPanel/adminPanel";
import { getSupabase } from "@/utils/supabase";
import React from "react";

type Step = "form" | "confirm" | "receipt"

type ReceiptData = {
  sale_id: number
  medicine: string
  dosage: string
  quantity: number
  unit_price: number
  total: number
  payment_method: string
  date: string
  time: string
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  "e-wallet": "E-Wallet",
  mobile: "Mobile Payment",
}

function printReceipt(r: ReceiptData) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt #${r.sale_id}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 36px 44px; max-width: 400px; margin: 0 auto; }
    .brand { font-size: 22px; font-weight: 900; text-align: center; margin-bottom: 4px; }
    .brand span { color: #2563eb; }
    .sub { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 20px; }
    .divider { border-top: 1px dashed #cbd5e1; margin: 14px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 7px; font-size: 13px; }
    .row .label { color: #64748b; }
    .row .value { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; margin-top: 10px; }
    .total-row span:last-child { color: #2563eb; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 24px; }
    @media print { body { padding: 16px 20px; } }
  </style>
</head>
<body>
  <div class="brand">Uni<span>pharma</span></div>
  <div class="sub">Official Sale Receipt</div>
  <div class="divider"></div>
  <div class="row"><span class="label">Receipt #</span><span class="value">${r.sale_id}</span></div>
  <div class="row"><span class="label">Date</span><span class="value">${r.date}</span></div>
  <div class="row"><span class="label">Time</span><span class="value">${r.time}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Medicine</span><span class="value">${r.medicine}</span></div>
  <div class="row"><span class="label">Dosage</span><span class="value">${r.dosage}</span></div>
  <div class="row"><span class="label">Qty (cards)</span><span class="value">${r.quantity}</span></div>
  <div class="row"><span class="label">Unit price</span><span class="value">฿${r.unit_price.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="total-row"><span>Total</span><span>฿${r.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Payment</span><span class="value">${PAYMENT_LABELS[r.payment_method] ?? r.payment_method}</span></div>
  <div class="footer">Thank you for your visit · Unipharma</div>
</body>
</html>`

  const win = window.open("", "_blank", "width=480,height=640")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}

const INITIAL_SALE = { medicine_id: 0, quantity: 0, payment_method: "cash", revenue: 0 }

export default function SellMedicineForm({
  medicines,
  count,
  onSaleComplete,
}: {
  medicines: Medicine[]
  count: number
  onSaleComplete?: () => Promise<void> | void
}) {
  const [step, setStep]       = React.useState<Step>("form")
  const [newSale, setNewSale] = React.useState(INITIAL_SALE)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError]     = React.useState("")
  const [receipt, setReceipt] = React.useState<ReceiptData | null>(null)

  const selectedMed  = medicines.find(m => m.medicine_id === newSale.medicine_id)
  const unit_price   = selectedMed ? selectedMed.price / (selectedMed.cards_per_box || 10) : 0
  const inStock      = selectedMed?.stock_quantity ?? 0

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setNewSale(prev => {
      const updated = {
        ...prev,
        [name]: name === "quantity" || name === "medicine_id" || name === "revenue"
          ? Number(value) : value,
      }
      const med = medicines.find(m => m.medicine_id === updated.medicine_id)
      const up  = med ? med.price / (med.cards_per_box || 10) : 0
      updated.revenue = up * updated.quantity
      return updated
    })
    setError("")
  }

  // Step 1 → Step 2: validate then show confirm
  function handleReviewClick(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedMed) return
    if (newSale.quantity <= 0) { setError("Quantity must be at least 1."); return }
    if (newSale.quantity > inStock) {
      setError(`Only ${inStock} card${inStock !== 1 ? "s" : ""} in stock.`)
      return
    }
    setError("")
    setStep("confirm")
  }

  // Step 2 → Step 3: process sale
  async function handleConfirm() {
    setIsLoading(true)
    setError("")
    try {
      const { medicine_id, quantity, payment_method, revenue } = newSale
      const supabase = await getSupabase()

      // Re-check stock right before committing
      const { data: fresh, error: fetchErr } = await supabase
        .from("medicines")
        .select("stock_quantity")
        .eq("medicine_id", medicine_id)
        .single()

      if (fetchErr || !fresh) throw new Error("Could not verify stock.")
      if (quantity > fresh.stock_quantity) {
        setError(`Stock changed — only ${fresh.stock_quantity} left. Please go back and adjust.`)
        setStep("form")
        return
      }

      const now  = new Date()
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

      // Insert sale
      const { data: sale, error: saleErr } = await supabase
        .from("sales")
        .insert([{ payment_method, revenue, sale_date: date }])
        .select()
        .single()
      if (saleErr || !sale) throw new Error("Failed to record sale.")

      // Insert sale item
      const { error: itemErr } = await supabase
        .from("sale_items")
        .insert([{ sale_id: sale.sale_id, medicine_id, quantity, unit_price }])
      if (itemErr) throw new Error("Failed to record sale item.")

      // Reduce stock
      const { error: stockErr } = await supabase
        .from("medicines")
        .update({ stock_quantity: fresh.stock_quantity - quantity })
        .eq("medicine_id", medicine_id)
      if (stockErr) throw new Error("Failed to update stock.")

      setReceipt({
        sale_id: sale.sale_id,
        medicine: selectedMed?.name ?? "",
        dosage: selectedMed?.dosage ?? "",
        quantity,
        unit_price,
        total: revenue,
        payment_method,
        date,
        time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      })
      setStep("receipt")
      if (onSaleComplete) await onSaleComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleNewSale() {
    setNewSale(INITIAL_SALE)
    setReceipt(null)
    setError("")
    setStep("form")
  }

  // ─── RECEIPT VIEW ─────────────────────────────────────────────────────────
  if (step === "receipt" && receipt) {
    return (
      <div className="my-5 space-y-5">
        {/* Success header */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-800">Sale Complete</p>
          <p className="text-xs text-gray-400">Receipt #{receipt.sale_id}</p>
        </div>

        {/* Receipt card */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50 divide-y divide-dashed divide-gray-200 overflow-hidden">
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold text-gray-700">{receipt.date}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-semibold text-gray-700">{receipt.time}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">Medicine</span>
            <span className="font-semibold text-gray-700 text-right max-w-[55%]">{receipt.medicine} <span className="text-gray-400 font-normal">({receipt.dosage})</span></span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">Qty (cards)</span>
            <span className="font-semibold text-gray-700">{receipt.quantity}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">Unit price</span>
            <span className="font-semibold text-gray-700">฿{receipt.unit_price.toFixed(2)}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-semibold text-gray-700">{PAYMENT_LABELS[receipt.payment_method] ?? receipt.payment_method}</span>
          </div>
          <div className="px-5 py-4 flex justify-between items-center bg-white">
            <span className="text-base font-bold text-gray-800">Total</span>
            <span className="text-xl font-black text-blue-600">
              ฿{receipt.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => printReceipt(receipt)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
          <button
            onClick={handleNewSale}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            New Sale
          </button>
        </div>
      </div>
    )
  }

  // ─── CONFIRM VIEW ──────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="my-5 space-y-5">
        <h2 className="text-xl font-semibold text-gray-800">Confirm Sale</h2>

        {/* Summary card */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 divide-y divide-blue-100 overflow-hidden">
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-blue-500 font-medium">Medicine</span>
            <span className="font-bold text-gray-800 text-right max-w-[55%]">
              {selectedMed?.name} <span className="text-gray-400 font-normal">({selectedMed?.dosage})</span>
            </span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-blue-500 font-medium">Quantity</span>
            <span className="font-bold text-gray-800">{newSale.quantity} card{newSale.quantity !== 1 ? "s" : ""}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-blue-500 font-medium">Unit price</span>
            <span className="font-bold text-gray-800">฿{unit_price.toFixed(2)}</span>
          </div>
          <div className="px-5 py-3 flex justify-between text-sm">
            <span className="text-blue-500 font-medium">Payment</span>
            <span className="font-bold text-gray-800">{PAYMENT_LABELS[newSale.payment_method] ?? newSale.payment_method}</span>
          </div>
          <div className="px-5 py-4 flex justify-between items-center bg-white">
            <span className="text-base font-bold text-gray-800">Total</span>
            <span className="text-xl font-black text-blue-600">
              ฿{newSale.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Stock warning if low */}
        {inStock <= 10 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 font-medium">
            ⚠ Only {inStock} card{inStock !== 1 ? "s" : ""} remaining after this sale: {inStock - newSale.quantity}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep("form")}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            ← Go Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : "Confirm & Complete"}
          </button>
        </div>
      </div>
    )
  }

  // ─── FORM VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="my-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Sell Medicine #{count}</h2>

      <form onSubmit={handleReviewClick} className="space-y-5">

        {/* Medicine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
          <select
            name="medicine_id"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            value={newSale.medicine_id}
            onChange={handleChange}
          >
            <option value={0}>Select Medicine</option>
            {medicines?.map(m => (
              <option key={m.medicine_id} value={m.medicine_id}>
                {m.name} ({m.dosage})
              </option>
            ))}
          </select>
          {selectedMed && (
            <p className="mt-1 text-xs text-gray-400">
              In stock: <span className={selectedMed.stock_quantity < 10 ? "text-amber-600 font-semibold" : "text-gray-500"}>{selectedMed.stock_quantity} cards</span>
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Cards)</label>
          <input
            type="number"
            name="quantity"
            onChange={handleChange}
            value={newSale.quantity || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter quantity"
            required
            min="1"
            max={inStock || undefined}
          />
        </div>

        {/* Price breakdown */}
        {newSale.medicine_id !== 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Price Breakdown</p>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Price per card</span>
              <span className="font-mono font-semibold text-slate-700">
                ฿{unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Number of cards</span>
              <span className="font-mono font-semibold text-slate-700">× {newSale.quantity || 0}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-lg font-black text-blue-600">
                ฿{newSale.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            name="payment_method"
            value={newSale.payment_method}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="e-wallet">E-Wallet</option>
            <option value="mobile">Mobile Payment</option>
          </select>
        </div>

        {/* Validation error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Review button */}
        <button
          type="submit"
          disabled={!selectedMed || newSale.quantity <= 0}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review Order →
        </button>

      </form>
    </div>
  )
}
