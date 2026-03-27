import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {

    const { imageBase64 } = await req.json()

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Extract the medicines from this prescription.
Return JSON only:
{
 "medicines":[
   {"name":"","dosage":"","frequency":""}
 ]
}`
            },
            {
              type: "input_image",
              image_url: `data:image/png;base64,${imageBase64}`,
              detail: "auto"
            }
          ]
        }
      ]
    })

    return Response.json({
      result: response.output_text
    })

  } catch (error) {
  console.error("OPENAI ERROR:", error)

  return Response.json(
    { error: String(error) },
    { status: 500 }
  )
}
}