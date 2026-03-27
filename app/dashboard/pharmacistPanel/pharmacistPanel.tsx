"use client"

import MoreMedButton from "./components/moreMedButton";
import { getSupabase } from "@/utils/supabase";
import SellMedicineForm from "./sellMedicine";
import type { Medicine } from "../adminPanel/adminPanel";
import { useState, useEffect } from "react";

export default function PharmacistPanel(){
    const [count, setCount] = useState(1);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    useEffect(() => {
        async function fetchMedicines() {
            const supabase = await getSupabase();
            const { data } = await supabase.from('medicines').select() as { data: Medicine[] };
            setMedicines(data || []);
        }
        fetchMedicines();
    }, []);
    
    return <div>
        <div className="text-center w-1/2 mx-auto">
        <button className="bg-green-400 py-2 px-3 rounded-lg mx-5 cursor-pointer active:bg-green-300">Read Prescription</button>
        <button className="bg-green-400 py-2 px-3 rounded-lg mx-5 cursor-pointer active:bg-green-300">Sell Medicine</button>
    </div>
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-8" >
        {Array.from({ length: count }, (_, index) => (
            <SellMedicineForm key={index} medicines={medicines} count={index+1}/>
        ))}
        <MoreMedButton medCount={count} setMedCount={setCount}/>
    </div>
    </div>
}

