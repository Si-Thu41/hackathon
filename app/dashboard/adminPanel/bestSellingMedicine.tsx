"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSupabase } from "@/utils/supabase";
import { useState,useEffect } from "react";
export default function TopMedicines() {
  const [data, setData] = useState<{ name: string; sold: number }[]>([]);

  useEffect(() => {
    fetchTop();
  }, []);

  async function fetchTop() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("sale_items")
      .select(`quantity, medicines(name)`) as { data: { quantity: number; medicines: { name: string } }[] | null; error: any };

    if (error) return console.error(error);

    if (!data) return;

    const grouped: Record<string, number> = {};

    data.forEach((item) => {
      const name = item.medicines.name;

      if (!grouped[name]) grouped[name] = 0;
      grouped[name] += item.quantity;
    });

    setData(
      Object.entries(grouped).map(([name, sold]) => ({
        name,
        sold
      }))
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow  my-4">
      <h2 className="font-semibold mb-4">Top Selling Medicines</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sold" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}