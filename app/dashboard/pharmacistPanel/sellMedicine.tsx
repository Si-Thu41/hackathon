"use client"

import type { Medicine } from "../adminPanel/adminPanel";
import { getSupabase } from "@/utils/supabase";
import React from "react";

export default function SellMedicineForm({
  medicines,
  count,
  onSaleComplete,
}: {
  medicines: Medicine[];
  count: number;
  onSaleComplete?: () => Promise<void> | void;
}) {
    const initialSaleState = {
  medicine_id: 0,
  quantity: 0,
  payment_method: "Cash",
  revenue: 0
};
    const [newSale, setNewSale]=React.useState(initialSaleState); 
    const [isLoading,setIsLoading]=React.useState(false)
    const box_price= medicines.find(m=>m.medicine_id==newSale.medicine_id)?.price;
    const unit_price=box_price!/10

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
  const { name, value } = e.target;

  setNewSale((prev) => {
    const updated = {
      ...prev,
      [name]:
        name === "quantity" || name === "medicine_id"
          ? Number(value)
          : value,
    };

    const selectedMedicine = medicines.find(
      (m) => m.medicine_id === updated.medicine_id
    );

    const unitPrice = selectedMedicine ? selectedMedicine.price / 10 : 0;

    return {
      ...updated,
      revenue: unitPrice * updated.quantity,
    };
  });
}

async function handleSale(e: React.SubmitEvent<HTMLFormElement>) {
  e.preventDefault();
    setIsLoading(true)
  const medicine_id = newSale.medicine_id
  const quantity = newSale.quantity
  const payment_method = newSale.payment_method
  const revenue =newSale.revenue;
  
  const supabase = await getSupabase();
    
  //Insert into sales
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert([
      {
        payment_method,
        revenue,
        sale_date: new Date().toISOString().split("T")[0],
      },
    ])
    .select()
    .single();

  if (saleError) {
    console.error("Sale insert error:", saleError);
    return;
  }

  // Insert sale items
  const { error: itemError } = await supabase
    .from("sale_items")
    .insert([
      {
        sale_id: sale.sale_id,
        medicine_id,
        quantity,
        unit_price: unit_price, // optional depending on your logic
      },
    ]);

  if (itemError) {
    console.error("Sale item error:", itemError);
  }
  // Reduce stock quantity
const { data: medicineData, error: fetchError } = await supabase
  .from("medicines")
  .select("stock_quantity")
  .eq("medicine_id", medicine_id)
  .single();

if (fetchError) {
  console.error("Fetch medicine error:", fetchError);
  return;
}

const newStock = medicineData.stock_quantity - quantity;

const { error: stockError } = await supabase
  .from("medicines")
  .update({ stock_quantity: newStock })
  .eq("medicine_id", medicine_id);

if (stockError) {
  console.error("Stock update error:", stockError);
}

if (onSaleComplete) {
  await onSaleComplete();
}

setIsLoading(false)
setNewSale(initialSaleState)
}

  return (
    <div className="my-5">

      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Sell Medicine #{count}
      </h2>

      <form onSubmit={handleSale} className="space-y-5">

        {/* Medicine Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medicine
          </label>
          <select
            name="medicine_id"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            onChange={handleChange}
          >
            <option value={newSale.medicine_id}>Select Medicine</option>

            {medicines?.map((medicine) => (
              <option key={medicine.medicine_id} value={medicine.medicine_id}>
                {medicine.name} ({medicine.dosage})
              </option>
            ))}

          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (Cards)
          </label>
          <input
            type="number"
            name="quantity"
            onChange={handleChange}
            value={newSale.quantity}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter number of cards"
            required
          />
        </div>

          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price 
          </label>
          <input
            readOnly
            type="number"
            name="revenue"
            onChange={handleChange}
            value={newSale.revenue}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter the total amount."
            required
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Payment</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className={`w-full text-white py-2 rounded-lg font-medium transition ${isLoading? "bg-gray-400 cursor-not-allowed": "bg-blue-600 hover:bg-blue-700"}`}>
        {isLoading ? "Loading..." : "Complete Sale"}
</button>

      </form>
    </div>
  );
}

