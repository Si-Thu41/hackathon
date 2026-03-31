"use client";

import { useState } from "react";
import { getSupabase } from "@/utils/supabase";
import type { Medicine } from "./adminPanel";

const EMPTY_FORM = {
  unit_code: "", name: "", generic_name: "", dosage: "", form: "tablet",
  manufacturer: "", price: "", stock_quantity: "", expiry_date: "",
};

// ─── ADD MEDICINE MODAL ──────────────────────────────────────────────────────
export function AddMedicineModal({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const supabase = await getSupabase();

      let image_url: string | null = null;
      if (imageFile) {
        setIsUploadingImage(true);
        const ext = imageFile.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("medicine-images")
          .upload(path, imageFile, { upsert: true });
        setIsUploadingImage(false);
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from("medicine-images")
            .getPublicUrl(uploadData.path);
          image_url = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("medicines").insert([{
        unit_code: formData.unit_code || null,
        name: formData.name,
        generic_name: formData.generic_name,
        dosage: formData.dosage,
        form: formData.form,
        manufacturer: formData.manufacturer,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        expiry_date: formData.expiry_date || null,
        image_url,
      }]);
      if (error) throw error;
      setIsOpen(false);
      setFormData(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding medicine:", error);
      alert("Failed to add medicine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Medicine
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Add New Medicine</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Unit Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Code</label>
                  <input type="text" name="unit_code" value={formData.unit_code} onChange={handleChange}
                    placeholder="e.g. TL001"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                </div>
                {/* Form */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Form</label>
                  <select name="form" value={formData.form} onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                  </select>
                </div>
                {/* Brand Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. Tylenol"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {/* Generic Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Generic Name</label>
                  <input type="text" name="generic_name" value={formData.generic_name} onChange={handleChange}
                    placeholder="e.g. paracetamol"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none italic" />
                </div>
                {/* Dosage */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dosage *</label>
                  <input required type="text" name="dosage" value={formData.dosage} onChange={handleChange}
                    placeholder="e.g. 500 mg"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange}
                    placeholder="e.g. Kenvue"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price (Baht) *</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                </div>
                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Initial Stock *</label>
                  <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                </div>
                {/* Expiry Date */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Medicine Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                    )}
                    <label className="flex-1 flex items-center gap-2 cursor-pointer px-4 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-sm text-slate-500">{imageFile ? imageFile.name : "Upload image..."}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : "Save Medicine"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── REMOVE MEDICINE BUTTON ──────────────────────────────────────────────────
export function RemoveMedicineButton({ medicine, onSuccess }: { medicine: Medicine; onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("medicines")
        .delete()
        .eq("medicine_id", medicine.medicine_id);
      if (error) throw error;
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error deleting medicine:", err);
      alert("Failed to delete medicine.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        title="Remove medicine"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Remove Medicine</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
              <p className="font-bold text-slate-800 text-sm">{medicine.name}</p>
              <p className="text-xs text-slate-400 italic mt-0.5">{medicine.generic_name} · {medicine.dosage}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition text-sm">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2 text-sm">
                {isDeleting
                  ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Removing...</>
                  : <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                      </svg>
                      Remove
                    </>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Default export kept for any legacy imports
export default AddMedicineModal;
