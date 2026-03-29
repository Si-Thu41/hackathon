import { getSupabase } from '@/utils/supabase'
import AddMedicineModal from "./addMedicineModal";
import RevenueTrend from './salesRevenue'
import TopMedicines from './bestSellingMedicine'
import InventoryHealth from "./inventoryHealth";

export type Medicine = {
  medicine_id: number;
  name: string;
  generic_name: string;
  dosage: string;
  form: string;
  manufacturer: string;
  price: number;
  stock_quantity: number;
};

type Sale = {
  revenue: number;
}

export default async function AdminPanel() {
  const supabase = await getSupabase();
  
  // Fetch medicines
  const { data: medicines } = await supabase
    .from("medicines")
    .select() as { data: Medicine[] | null };

  // Fetch sales
  const { data: sales } = await supabase
    .from("sales")
    .select("revenue") as {data: Sale[] | null};
    
  const totalOrders = sales?.length ?? 0;
  const totalSales = sales?.reduce((sum, sale) => sum + (sale.revenue ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* =========================================
            ROW 1: KPI CARDS (Server Rendered)
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Sales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Sales</p>
              <h3 className="text-2xl font-bold text-slate-800">฿{totalSales.toLocaleString()}</h3>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalOrders}</h3>
            </div>
          </div>

          {/* Card 3: Out of Stock Alert */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-red-600 animate-pulse">
                {medicines?.filter(m => m.stock_quantity < 10).length || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* =========================================
            ROW 2: PRIMARY CHARTS 
            ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <RevenueTrend />
          </div>
          <div className="lg:col-span-1">
             <InventoryHealth /> 
          </div>
        </div>

        {/* =========================================
            ROW 3: SECONDARY CHART & TABLE
            ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Medicines sits on the left */}
          <div className="lg:col-span-1">
             <TopMedicines />
          </div>

          {/* FIXED: The Table wrapper now correctly surrounds the table! */}
          <div className="lg:col-span-2 bg-white shadow-sm border border-slate-100 rounded-2xl p-6 my-4">
              <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Medicines Inventory</h2>
              <AddMedicineModal />
        </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Dosage</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {medicines?.map((medicine)=>(
                    <tr className="hover:bg-slate-50 transition-colors" key={medicine.medicine_id}>
                      <td className="px-4 py-4 text-slate-400">{medicine.medicine_id}</td>
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {medicine.name}
                        <span className="block text-slate-400 font-normal italic text-xs mt-0.5">{medicine.generic_name}</span>
                      </td>
                      <td className="px-4 py-4">{medicine.dosage} {medicine.form}</td>
                      <td className="px-4 py-4 font-medium text-blue-600">฿{medicine.price}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          medicine.stock_quantity < 10 
                            ? "bg-red-50 text-red-600 border border-red-100" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {medicine.stock_quantity} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* End of Table Wrapper */}

        </div>

      </div>
    </div>
  )
}