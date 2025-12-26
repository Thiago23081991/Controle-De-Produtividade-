
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Habilita CORS para garantir que o frontend possa chamar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Configuração de Servidor: API_KEY não encontrada nas variáveis de ambiente." });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    // Initialize with named parameter and updated model selection
    const ai = new GoogleGenAI({ apiKey });
    
    // Switch to gemini-3-flash-preview to avoid 429 Resource Exhausted errors on the Free Tier
    // Flash models are faster and have higher rate limits than Pro models
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Access response.text directly
    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
