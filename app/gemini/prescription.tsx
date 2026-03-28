"use client"

import { useState } from "react"

export default function Prescription() {
  const [text, setText] = useState("")
  const [medicine, setMedicine] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [dosage, setDosage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function extractMedicine(ocrText: string) {
    const lowerText = ocrText.toLowerCase()
    const detectedMedicines: string[] = []

    if (lowerText.includes("tylenol")) {
      detectedMedicines.push("Tylenol")
    }
    if (lowerText.includes("paracap")) {
      detectedMedicines.push("Paracap")
    }

    if (detectedMedicines.length > 0) {
      return `The Medicine: ${detectedMedicines.join("/")}`
    } else {
      return "no medicine detected"
    }
  }

  function extractDosage(ocrText: string) {
    const regex = /\b(\d+)\s*(tablet|tab)s?\b/i
    const match = ocrText.match(regex)
    if (match) {
      const number = parseInt(match[1], 10)
      const unit = match[2].toLowerCase()
      return `Take ${number} ${unit}${number > 1 ? 's' : ''}`
    }
    return "Dosage not detected"
  }

  async function upload(file: File) {
    setLoading(true)
    setError("")
    setText("")
    setMedicine("")
    setDosage("")

    try {
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/open-router", {
        method: "POST",
        body: form
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        const extractedText = data.text || ""
        setText(extractedText)
        setMedicine(extractMedicine(extractedText))
        setDosage(extractDosage(extractedText))
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: any) {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      upload(file)
    }
  }

  function handleTryAgain() {
    if (selectedFile) {
      upload(selectedFile)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-5 py-10">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2.5">
            Medicine Scanner
          </h1>
          <p className="text-base text-gray-500">
            Upload a medicine prescription image to extract medicine details
          </p>
        </div>

        {/* File Input */}
        <div className="mb-7.5">
          <label
            className="block p-10 border-2 border-dashed border-blue-500 rounded-lg text-center bg-gray-50 cursor-pointer hover:bg-blue-50 transition-colors duration-300"
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-lg text-blue-500 font-medium">
              📁 Click to upload or drag a file
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Supported formats: PNG, JPG, PDF
            </div>
          </label>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center p-7.5 bg-blue-50 rounded-lg mb-5">
            <div className="text-lg text-blue-500 font-medium">
              ⏳ Processing your image...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-500 rounded-lg p-5 mb-5">
            <div className="text-base text-red-800 font-medium mb-3.75">
              ❌ Error: {error}
            </div>
            <button
              onClick={handleTryAgain}
              className="bg-red-500 text-white px-5 py-2.5 text-sm font-medium rounded cursor-pointer transition-colors duration-300 hover:bg-red-600"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {text && (
          <div className="bg-white rounded-lg p-7.5 shadow-md">
            {/* Medicine Detection */}
            <div className="bg-green-50 border border-green-500 rounded-lg p-5 mb-5">
              <h3 className="text-base font-semibold text-green-700 mb-2">
                💊 Medicine Detection
              </h3>
              <p className="text-lg text-green-900 font-medium">
                {medicine}
              </p>
            </div>

            {/* Dosage */}
            <div className="bg-amber-50 border border-amber-500 rounded-lg p-5 mb-5">
              <h3 className="text-base font-semibold text-amber-700 mb-2">
                📋 Dosage Information
              </h3>
              <p className="text-lg text-amber-900 font-medium">
                {dosage}
              </p>
            </div>

            {/* Extracted Text */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                📄 Extracted Text
              </h3>
              <pre className="bg-gray-100 p-3.75 rounded text-sm text-gray-600 border border-gray-300 overflow-auto leading-6 whitespace-pre-wrap wrap-break-words">
                {text}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}