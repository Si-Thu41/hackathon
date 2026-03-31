import OpenAI from "openai";
import { getSupabase } from "@/utils/supabase";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPEN_ROUTER!,
  baseURL: "https://openrouter.ai/api/v1",
});

function localDateRange(period: "today" | "month") {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (period === "today") {
    return { start: today, end: today, label: `Today (${today})` };
  }
  const firstDay = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const monthName = now.toLocaleString("en", { month: "long" });
  return { start: firstDay, end: today, label: `${monthName} ${now.getFullYear()}` };
}

export async function POST(req: Request) {
  try {
    const { period = "month", lang = "en" } = (await req.json()) as { period: "today" | "month"; lang: "en" | "th" | "ja" };
    const { start, end, label } = localDateRange(period);

    const supabase = await getSupabase();

    const [medicinesRes, salesRes, saleItemsRes, bookingsRes] = await Promise.all([
      supabase.from("medicines").select("medicine_id, name, stock_quantity, expiry_date, price, category"),
      supabase.from("sales").select("revenue, sale_date, payment_method").gte("sale_date", start).lte("sale_date", end),
      supabase.from("sale_items").select("medicine_id, quantity, unit_price"),
      supabase.from("vaccine_bookings").select("booking_date, status, vaccine_name").gte("booking_date", start).lte("booking_date", end),
    ]);

    const medicines: { medicine_id: number; name: string; stock_quantity: number; expiry_date: string | null; price: number; category: string | null }[] = medicinesRes.data ?? [];
    const sales: { revenue: number; sale_date: string; payment_method: string }[] = salesRes.data ?? [];
    const saleItems: { medicine_id: number; quantity: number; unit_price: number }[] = saleItemsRes.data ?? [];
    const bookings: { booking_date: string; status: string; vaccine_name: string }[] = bookingsRes.data ?? [];

    // ── Revenue metrics ───────────────────────────────────────────────────────
    const totalRevenue = sales.reduce((s, r) => s + (r.revenue ?? 0), 0);
    const totalOrders = sales.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // ── Payment breakdown ─────────────────────────────────────────────────────
    const paymentBreakdown = sales.reduce<Record<string, number>>((acc, s) => {
      acc[s.payment_method] = (acc[s.payment_method] ?? 0) + (s.revenue ?? 0);
      return acc;
    }, {});

    // ── Top medicines by revenue sold ─────────────────────────────────────────
    const medMap = new Map(medicines.map(m => [m.medicine_id, m.name]));
    const medSales: Record<number, { name: string; qty: number; revenue: number }> = {};
    for (const item of saleItems) {
      if (!medSales[item.medicine_id]) {
        medSales[item.medicine_id] = { name: medMap.get(item.medicine_id) ?? `Med#${item.medicine_id}`, qty: 0, revenue: 0 };
      }
      medSales[item.medicine_id].qty += item.quantity;
      medSales[item.medicine_id].revenue += item.quantity * item.unit_price;
    }
    const topMeds = Object.values(medSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // ── Stock health ──────────────────────────────────────────────────────────
    const lowStockMeds = medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < 10);
    const outOfStockMeds = medicines.filter(m => m.stock_quantity === 0);
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in30Str = `${in30.getFullYear()}-${String(in30.getMonth() + 1).padStart(2, "0")}-${String(in30.getDate()).padStart(2, "0")}`;
    const expiringSoon = medicines.filter(m => m.expiry_date && m.expiry_date <= in30Str && m.expiry_date >= start);

    // ── Vaccine bookings ──────────────────────────────────────────────────────
    const vaccineTypes = [...new Set(bookings.map(b => b.vaccine_name).filter(Boolean))];
    const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
    const pendingBookings = bookings.filter(b => b.status === "pending").length;

    // ── Build prompt ──────────────────────────────────────────────────────────
    const langInstruction = lang === "th"
      ? "IMPORTANT: Write the entire summary in Thai language (ภาษาไทย)."
      : lang === "ja"
      ? "IMPORTANT: Write the entire summary in Japanese language (日本語)."
      : "Write the summary in English.";

    const prompt = `You are a senior pharmacy business analyst writing an executive report for a pharmacy owner. ${langInstruction} Analyze the data below and write a concise 4-5 sentence business performance summary for ${label}.

PHARMACY METRICS (${label}):
Revenue: ฿${totalRevenue.toLocaleString()} across ${totalOrders} orders (avg ฿${avgOrderValue.toFixed(0)} per order)
Payment Methods: ${Object.entries(paymentBreakdown).map(([k, v]) => `${k}: ฿${v.toFixed(0)}`).join(", ") || "No data"}
Top Selling Medicines: ${topMeds.map((m, i) => `#${i + 1} ${m.name} (${m.qty} units, ฿${m.revenue.toFixed(0)})`).join("; ") || "No sales in this period"}
Inventory Status: ${medicines.length} total medicines, ${lowStockMeds.length} low stock (<10 units), ${outOfStockMeds.length} out of stock
Low Stock Items: ${lowStockMeds.slice(0, 5).map(m => `${m.name} (${m.stock_quantity} left)`).join(", ") || "None"}
Expiring within 30 days: ${expiringSoon.length} medicines
Vaccine Bookings: ${bookings.length} total (${confirmedBookings} confirmed, ${pendingBookings} pending), types: ${vaccineTypes.join(", ") || "None"}

Write a flowing executive summary (no bullet points or headers) that covers:
1. Revenue performance and standout medicines
2. Inventory risk (stockouts or expiry)
3. One specific, measurable recommendation with a success indicator (e.g., targeting 20% improvement in X)

Be specific with numbers from the data. Keep the tone professional and action-oriented.`;

    const response = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const summary = response.choices[0]?.message?.content?.trim() ?? "Unable to generate summary.";

    return Response.json({
      summary,
      metrics: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        lowStockCount: lowStockMeds.length,
        outOfStockCount: outOfStockMeds.length,
        expiringCount: expiringSoon.length,
        vaccineBookings: bookings.length,
        topMeds: topMeds.slice(0, 3),
        label,
      },
    });
  } catch (err) {
    console.error("AI Summary error:", err);
    return Response.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
