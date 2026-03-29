"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import error from "next/dist/api/error";

export default function InventoryHealth() {
  const [data, setData] = useState([
    { name: "Healthy Stock", value: 0, color: "#10b981" }, // Emerald
    { name: "Low Stock", value: 0, color: "#f59e0b" },     // Amber
    { name: "Out of Stock", value: 0, color: "#ef4444" },  // Red
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventoryHealth();
  }, []);

  async function fetchInventoryHealth() {
    try {
      const supabase = await getSupabase();
      // Fetching the stock level of all medicines
        const { data: meds, error } = await supabase.from("medicines").select("stock_quantity") as { data: { stock_quantity: number }[] | null; error: any };
      if (error) throw error;
      if (!meds) return;

      let healthy = 0;
      let low = 0;
      let out = 0;

      meds.forEach((med) => {
  if (med.stock_quantity > 50) healthy++;
  else if (med.stock_quantity > 0 && med.stock_quantity <= 50) low++;
  else out++;
});
      setData([
        { name: "Healthy Stock", value: healthy, color: "#10b981" },
        { name: "Low Stock", value: low, color: "#f59e0b" },
        { name: "Out of Stock", value: out, color: "#ef4444" },
      ]);
    } catch (err) {
      console.error("Error fetching inventory", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full h-full my-4 flex flex-col">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-800">Inventory Health</h2>
        <p className="text-sm text-slate-500">Real-time stock level distribution</p>
      </div>

      <div className="flex-grow w-full h-64">
        {isLoading ? (
           <div className="w-full h-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60} // This makes it a Donut instead of a solid Pie!
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}