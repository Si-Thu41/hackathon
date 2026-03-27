"use client"
import { useEffect, useState } from "react";
import { getSupabase } from "@/utils/supabase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function RevenueTrend() {
  const [data, setData] = useState<{ date: string; revenue: number }[]>([]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  async function fetchRevenue() {
    
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("sales")
      .select("sale_date,revenue") as { data: { sale_date: string; revenue: number }[] | null; error: any };

    if (error) return console.error(error);

    if (!data) return;

    const grouped: Record<string, number> = {};

    data.forEach((row) => {
      const date = row.sale_date.split("T")[0];

      if (!grouped[date]) grouped[date] = 0;
      grouped[date] += Number(row.revenue);
    });

    const formatted = Object.entries(grouped).map(([date, revenue]) => ({
      date,
      revenue
    }));

    setData(formatted);
  }

  return (
    <div className="bg-white p-6 rounded-xl  my-4">
      <h2 className="font-semibold mb-4">Revenue Trend</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}