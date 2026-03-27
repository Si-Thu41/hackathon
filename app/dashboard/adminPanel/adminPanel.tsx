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

  return (<div>
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">

  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-semibold text-gray-800">Medicines Inventory</h2>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
      Add Medicine
    </button>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left text-gray-600">
      
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Generic</th>
          <th className="px-6 py-3">Dosage</th>
          <th className="px-6 py-3">Form</th>
          <th className="px-6 py-3">Manufacturer</th>
          <th className="px-6 py-3">Box Price</th>
          <th className="px-6 py-3">Stock (Cards)</th>
          <th className="px-6 py-3">Expiry</th>
        </tr>
      </thead>

      <tbody className="divide-y">
        
       
        {medicines?.map((medicine)=>(
              <tr className="hover:bg-gray-50" key={medicine.medicine_id}>
          <td className="px-6 py-4">{medicine.medicine_id}</td>
          <td className="px-6 py-4 font-medium text-gray-900">{medicine.name}</td>
          <td className="px-6 py-4">{medicine.generic_name}</td>
          <td className="px-6 py-4">{medicine.dosage}</td>
          <td className="px-6 py-4">{medicine.form}</td>
          <td className="px-6 py-4">{medicine.manufacturer}</td>
          <td className="px-6 py-4">{medicine.price} baht</td>
          <td className="px-6 py-4">
            <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
              {medicine.stock_quantity} cards
            </span>
          </td>
          <td className="px-6 py-4">2027-12-31</td>
        </tr>
        ))}
    

      </tbody>

    </table>
  </div>

</div>
<section className='grid grid-cols-2'>
  <RevenueTrend/>
<TopMedicines />
</section>

</div>
  )
}