import { getSupabase } from '@/utils/supabase'

import RevenueTrend from './salesRevenue'
import TopMedicines from './bestSellingMedicine'

export type Medicine = {
  medicine_id: number;
  name: string;
  generic_name: string;
  dosage: string;
  form: string;
  manufacturer: string;
  price: number;
  stock_quantity: number;
  // add other fields as needed
};

export default async function AdminPanel() {

  const supabase = await getSupabase();
  const { data: medicines } = await supabase.from('medicines').select() as { data: Medicine[] | null };

  return (
  <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
    {/* Main Container - space-y-8 creates the gap between rows */}
      <div className="max-w-7xl mx-auto space-y-8">
    {/* =========================================
            ROW 1: KPI CARDS 
            ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Sales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Sales</p>
              <h3 className="text-2xl font-bold text-slate-800">฿45,234</h3>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-800">128</h3>
            </div>
          </div>

          {/* Card 3: Out of Stock Alert (Dynamically calculated from Supabase data!) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {medicines?.filter(m => m.stock_quantity < 10).length || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* =========================================
            ROW 2: CHARTS 
            ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend</h2>
             <RevenueTrend />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h2 className="text-lg font-bold text-slate-800 mb-6">Top Medicines</h2>
             <TopMedicines />
          </div>
        </div>
        {/* =========================================
            ROW 3: INVENTORY TABLE
            ========================================= */}
   <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6"></div>         
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-semibold text-gray-800">Medicines Inventory</h2>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
      Add Medicine
    </button>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left text-gray-600">
      
      <thead className="bg-slate-100 text-slate-700 uppercase text-xs border-b border-slate-200">
        <tr>
          <th className="px-6 py-4">ID</th>
          <th className="px-6 py-4">Name</th>
          <th className="px-6 py-4">Generic</th>
          <th className="px-6 py-4">Dosage</th>
          <th className="px-6 py-4">Form</th>
          <th className="px-6 py-4">Manufacturer</th>
          <th className="px-6 py-4">Box Price</th>
          <th className="px-6 py-4">Stock (Cards)</th>
          <th className="px-6 py-4">Expiry</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200 bg-white">
        
       
        {medicines?.map((medicine)=>(
              <tr className="hover:bg-gray-50 transition-colors" key={medicine.medicine_id}>
          <td className="px-6 py-4">{medicine.medicine_id}</td>
          <td className="px-6 py-4 font-medium text-gray-900">{medicine.name}</td>
          <td className="px-6 py-4 text-slate-500 italic text-xs">{medicine.generic_name}</td>
          <td className="px-6 py-4">{medicine.dosage}</td>
          <td className="px-6 py-4">{medicine.form}</td>
          <td className="px-6 py-4 text-slate-500">{medicine.manufacturer}</td>  
          <td className="px-6 py-4 font-mono font-medium text-blue-700">{medicine.price} Baht</td>
          <td className="px-6 py-4">
            {/* Dynamic Styling: Red if less than 10, Green if 10 or more */}
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              medicine.stock_quantity < 10 
                ? "bg-red-100 text-red-700" 
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {medicine.stock_quantity} cards
            </span>
          </td>
          <td className="px-6 py-4 text-slate-400 text-xs">2027-12-31</td>
        </tr>
        ))}
    

      </tbody>

    </table>
  </div>

</div>
</div>
  )
}