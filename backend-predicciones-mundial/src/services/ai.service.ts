import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

export class AIService {
  async getMatchInsights(matchId: string): Promise<string> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true },
    });
    if (!match) return "Partido no encontrado.";
    if (match.aiInsight) return match.aiInsight;
    if (!process.env.GEMINI_API_KEY) return "Insights de IA no disponibles (API Key no configurada).";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Eres un experto analista de fútbol mundial. Brinda una breve estadística o dato curioso sobre un posible enfrentamiento entre ${match.homeTeam?.name || 'TBD'} y ${match.awayTeam?.name || 'TBD'} en la fase de ${match.stage} del Mundial. Máximo 2-3 oraciones. No digas quién va a ganar directamente.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const insight = response.text().trim();
      await prisma.match.update({ where: { id: matchId }, data: { aiInsight: insight } });
      return insight;
    } catch {
      return "Estadísticas históricas entre ambos equipos muestran encuentros muy parejos.";
    }
  }

  async generateInsightsForUpcoming(): Promise<number> {
    const matches = await prisma.match.findMany({
      where: { status: 'SCHEDULED', aiInsight: null },
      include: { homeTeam: true, awayTeam: true },
    });
    let count = 0;
    for (const match of matches) {
      if (!process.env.GEMINI_API_KEY) break;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Eres un experto analista de fútbol mundial. Brinda una breve estadística o dato curioso sobre un posible enfrentamiento entre ${match.homeTeam?.name || 'TBD'} y ${match.awayTeam?.name || 'TBD'} en la fase de ${match.stage} del Mundial. Máximo 2-3 oraciones. No digas quién va a ganar directamente.`;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        await prisma.match.update({ where: { id: match.id }, data: { aiInsight: text } });
        count++;
      } catch {
        continue;
      }
    }
    return count;
  }
}

export const aiService = new AIService();
