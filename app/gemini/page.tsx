"use client"
import { useState } from "react"

export default function UploadPrescription() {

  const [file,setFile] = useState<File | null>(null)

  const handleUpload = async () => {

    if(!file) return

    const reader = new FileReader()

    reader.onloadend = async () => {

      const base64 = (reader.result as string).split(",")[1]

   const res = await fetch("/api/readPrescription", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ imageBase64: base64 }),
})

const text = await res.text()
console.log("RAW RESPONSE:", text)

    }

    reader.readAsDataURL(file)

  }

  return (
    <div>

      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e)=>setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload}>
        Analyze
      </button>

    </div>
  )
}