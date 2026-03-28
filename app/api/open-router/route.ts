export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided", tryAgain: true }, { status: 400 });
    }

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCR_API_KEY!
      },
      body
    });

    if (!response.ok) {
      return Response.json({ error: `API error: ${response.status} ${response.statusText}`, tryAgain: true }, { status: response.status });
    }

    const data = await response.json();
    console.log(data);

    if (data.IsErroredOnProcessing || data.OCRExitCode !== 1) {
      return Response.json({ error: data.ErrorMessage || "OCR processing failed", tryAgain: true }, { status: 500 });
    }

    const text = data.ParsedResults?.[0]?.ParsedText ?? "";
    return Response.json({ text });
  } catch (error) {
    console.error("Fetch or processing error:", error);
    return Response.json({ error: "Network or server error occurred", tryAgain: true }, { status: 500 });
  }
}