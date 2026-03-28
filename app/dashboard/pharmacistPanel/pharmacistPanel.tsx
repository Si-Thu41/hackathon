"use client"

import MoreMedButton from "./components/moreMedButton";
import { getSupabase } from "@/utils/supabase";
import SellMedicineForm from "./sellMedicine";
import type { Medicine } from "../adminPanel/adminPanel";
import { useState, useEffect } from "react";
import Prescription from "@/app/gemini/prescription";

export default function PharmacistPanel(){
    const [count, setCount] = useState(1);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [displayComponent,setDisplayComponent]=useState("");
    function changeDisplayComponent(component:string){
        setDisplayComponent(component)
    }
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
        <button className="bg-green-400 py-2 px-3 rounded-lg mx-5 cursor-pointer active:bg-green-300" onClick={()=>{changeDisplayComponent("prescription")}}>Read Prescription</button>
        <button className="bg-green-400 py-2 px-3 rounded-lg mx-5 cursor-pointer active:bg-green-300" onClick={()=>{changeDisplayComponent("sell")}}>Sell Medicine</button>
    </div>
    <div className={`w-9/10 mx-auto bg-white shadow-lg rounded-xl p-6 mt-8 `} >
        <div className={`${displayComponent=="sell"? "block" : "hidden"}`}>
               {Array.from({ length: count }, (_, index) => (
            <SellMedicineForm key={index} medicines={medicines} count={index+1}/>
        ))}
        <MoreMedButton medCount={count} setMedCount={setCount}/>
        </div>
        <div className={`${displayComponent=="prescription"? "block" : "hidden"}`}>
            <Prescription/>
        </div>
    </div>
    
    </div>
}

