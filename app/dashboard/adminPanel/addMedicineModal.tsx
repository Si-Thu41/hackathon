"use client";

import { useState } from "react";
import { getSupabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function AddMedicineModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    dosage: "",
    form: "tablet", // default value
    manufacturer: "",
    price: "",
    stock_quantity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = await getSupabase();
      
      const { error } = await supabase.from("medicines").insert([
        {
          name: formData.name,
          generic_name: formData.generic_name,
          dosage: formData.dosage,
          form: formData.form,
          manufacturer: formData.manufacturer,
          price: Number(formData.price),
          stock_quantity: Number(formData.stock_quantity),
        }
      ]);

      if (error) throw error;

      // Close modal and clear form
      setIsOpen(false);
      setFormData({
        name: "", generic_name: "", dosage: "", form: "tablet", manufacturer: "", price: "", stock_quantity: ""
      });

      // Refresh the server component to show the new data instantly!
      router.refresh(); 

    } catch (error) {
      console.error("Error adding medicine:", error);
      alert("Failed to add medicine. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* The Button that sits on the Admin Panel */}
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        Add Medicine
      </button>

      {/* The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New Medicine</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Tylenol" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Generic Name</label>
                  <input type="text" name="generic_name" value={formData.generic_name} onChange={handleChange} placeholder="e.g. paracetamol" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none italic" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dosage *</label>
                  <input required type="text" name="dosage" value={formData.dosage} onChange={handleChange} placeholder="e.g. 500 mg" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Form</label>
                  <select name="form" value={formData.form} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="e.g. Kenvue" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price (Baht) *</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Stock *</label>
                  <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} placeholder="0" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                  ) : "Save Medicine"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}