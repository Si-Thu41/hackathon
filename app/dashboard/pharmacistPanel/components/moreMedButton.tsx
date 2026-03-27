"use client"
export default function MoreMedButton({medCount, setMedCount}:{medCount:number, setMedCount: (count: number) => void}){
    return(
        <div className="grid grid-cols-2 w-1/2 gap-4">
        <button className="bg-green-400 py-1 px-2 rounded-lg text-white my-3 cursor-pointer" onClick={()=>{setMedCount(medCount + 1)}}>More medicine</button>
        <button className="bg-red-400 py-1 px-2 rounded-lg text-white my-3 cursor-pointer" onClick={()=>{setMedCount(medCount - 1)}}>Less medicine</button>

        </div>

    )
}