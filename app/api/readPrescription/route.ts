export const runtime = "nodejs";

import { createWorker } from "tesseract.js";

export async function POST(req: Request) {

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ error: "No file uploaded" });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const worker = await createWorker("eng");

  const { data } = await worker.recognize(buffer);

  await worker.terminate();

  return Response.json({
    text: data.text
  });
}