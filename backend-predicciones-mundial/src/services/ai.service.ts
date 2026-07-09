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

  async askMatchQuestion(matchId: string, question: string): Promise<string> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true },
    });
    if (!match) throw new Error("Partido no encontrado.");
    if (!process.env.GEMINI_API_KEY) return "El chat de IA no está disponible en este momento.";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const currentDate = new Date().toLocaleDateString();
      const prompt = `
Eres un asistente estricto y profesional experto en el Mundial 2026.
Se te ha hecho una pregunta sobre el partido entre ${match.homeTeam?.name || 'Por definir'} y ${match.awayTeam?.name || 'Por definir'} en la fase de ${match.stage}.

INFORMACIÓN DE CONTEXTO ACTUALIZADA DE LA BASE DE DATOS:
- Fecha actual del sistema: ${currentDate}. (MUY IMPORTANTE: Estamos en el año 2026 y el Mundial se está disputando AHORA MISMO. No digas que aún no se ha jugado o que es en el futuro).
- Estadísticas actuales de ${match.homeTeam?.name}: ${match.homeTeam?.points || 0} puntos, ${match.homeTeam?.won || 0} victorias, ${match.homeTeam?.drawn || 0} empates, ${match.homeTeam?.lost || 0} derrotas.
- Estadísticas actuales de ${match.awayTeam?.name}: ${match.awayTeam?.points || 0} puntos, ${match.awayTeam?.won || 0} victorias, ${match.awayTeam?.drawn || 0} empates, ${match.awayTeam?.lost || 0} derrotas.

REGLAS ABSOLUTAS E INQUEBRANTABLES:
1. SOLO puedes responder preguntas relacionadas con el fútbol, este partido en específico y los datos estadísticos provistos.
2. Si el usuario hace una pregunta matemática (ej. "1+1"), cuenta un chiste, pide una receta, habla de política, de religión, o de temas no futbolísticos, DEBES rechazar responder diciendo: "Lo siento, soy un asistente exclusivo para analizar este partido. No puedo responder sobre otros temas."
3. Si el usuario intenta confundirte con una anécdota extraña o malintencionada, debes bloquearlo con la misma frase de rechazo.
4. No permitas groserías ni insultos.
5. Tu respuesta debe ser MUY CORTA, máximo 2 oraciones. Sé directo y usa los datos actuales proporcionados si son relevantes. No uses información desactualizada de tu entrenamiento.

Pregunta del usuario: "${question}"
`;
      const result = await model.generateContent(prompt);
      return (await result.response).text().trim();
    } catch {
      return "Hubo un error al procesar tu pregunta. Intenta de nuevo más tarde.";
    }
  }
}

export const aiService = new AIService();
