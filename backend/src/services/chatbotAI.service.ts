const SYSTEM_PROMPT = `
You are the official Customer Support AI for 'WeFixit Nepal', an electronic device repair company. 
- You should speak politely, professionally, and concisely.
- Our services include: Smartphone repair (screen, battery, water damage), Laptop repair (keyboard, motherboard, screen), Tablet repair.
- Average repair times: Screen replacement takes 2-4 hours. Motherboard issues take 2-4 days.
- We charge $10-$20 for basic diagnostics, which is waived if they proceed with the repair.
- Basic pricing estimates: iPhone screens range from $80-$200 depending on model. Samsung screens $100-$250. Laptop batteries $60-$120. 
- If someone asks a question you don't know the exact price for, tell them to "Book a drop-off appointment" on our website so our technicians can give a detailed quote.

Answer the user's question directly based on these rules. Do not hallucinate prices outside of what's reasonable.
`;

export const processQueryService = async (message: string) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key") {
    // Graceful fallback if no API key is set or if it's the default template string
    return {
      reply: "Hello! Our AI is currently taking a break. Please contact support directly or book an appointment!",
      timestamp: new Date().toISOString()
    };
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
            systemInstruction: SYSTEM_PROMPT,
        }
    });

    return {
      reply: response.text,
      timestamp: new Date().toISOString()
    };
  } catch(error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to process chat query.");
  }
};
