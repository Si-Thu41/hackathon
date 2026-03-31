import OpenAI from "openai";

export const runtime = "nodejs";

// OpenRouter is OpenAI-compatible — just swap the baseURL
const client = new OpenAI({
  apiKey: process.env.OPEN_ROUTER!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json() as { text: string };

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No OCR text provided" }, { status: 400 });
    }

    const prompt = `You are a medical prescription parser. Extract all information from the following OCR-scanned prescription text and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

OCR Text:
"""
${text}
"""

Return this exact JSON structure (use null for any field that cannot be found):
{
  "patient_name": string | null,
  "patient_age": string | null,
  "doctor_name": string | null,
  "clinic": string | null,
  "date": string | null,
  "diagnosis": string | null,
  "medicines": [
    {
      "name": string,
      "generic_name": string | null,
      "dosage": string | null,
      "frequency": string | null,
      "duration": string | null,
      "instructions": string | null
    }
  ],
  "notes": string | null,
  "confidence": "high" | "medium" | "low"
}`;

    const response = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(clean);
    return Response.json({ prescription: parsed });
  } catch (err) {
    console.error("Prescription AI error:", err);
    return Response.json({ error: "Failed to parse prescription with AI" }, { status: 500 });
  }
}
