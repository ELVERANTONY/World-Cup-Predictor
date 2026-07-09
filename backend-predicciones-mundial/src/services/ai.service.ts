import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export class AIService {
  async getMatchInsights(homeTeam: string, awayTeam: string, stage: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return "Estadísticas de IA no disponibles (Falta API Key). Configura GEMINI_API_KEY en tu .env.";
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
Eres un experto analista de fútbol mundial.
Brinda una breve estadística o dato curioso sobre un posible enfrentamiento entre ${homeTeam} y ${awayTeam} en la fase de ${stage} del Mundial.
El texto debe ser muy breve, profesional, dinámico y útil para ayudar a un usuario a tomar una decisión al predecir el partido.
Máximo 2-3 oraciones.
No digas quién va a ganar directamente, solo da un dato o estadística clave.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return "Estadísticas históricas entre ambos equipos muestran encuentros muy parejos. La localía o el clima podrían ser factores decisivos.";
    }
  }
}

export const aiService = new AIService();
