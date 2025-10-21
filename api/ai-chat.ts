// api/chat.ts
import { VercelRequest, VercelResponse } from "@vercel/node";

// Type definitions for Hugging Face API response
interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

interface HuggingFaceApiResponse {
  generated_text?: string;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: conversationHistory.map((c: any) => c.user),
            generated_responses: conversationHistory.map((c: any) => c.bot),
            text: message,
          },
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API error: ${errorText}`);
    }

    const data = await response.json() as HuggingFaceResponse | HuggingFaceResponse[];
    const aiResponse = Array.isArray(data) 
      ? data[0]?.generated_text || "⚠️ No response"
      : data?.generated_text || "⚠️ No response";

    return res.status(200).json({
      response: aiResponse,
      conversationHistory: [
        ...conversationHistory,
        { user: message, bot: aiResponse },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to connect to LLaMA",
      details: err.message,
    });
  }
}
