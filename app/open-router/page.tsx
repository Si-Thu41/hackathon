import { OpenRouter } from '@openrouter/sdk';

export default async function Page(){
    const apiKey=process.env.OPEN_ROUTER;
   const result = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPEN_ROUTER}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3.1-8b-instruct",
    messages: [
      {
        role: "user",
        content: "Who is US President?"
      }
    ]
  }),
});

const data = await result.json();
console.log(data.choices[0].message.content);
return (
    <div>
        
    </div>
)
}

