import OpenAI from "openai";
import { db } from "../db";
import { lotteryDraws, numberFrequency } from "@shared/schema";
import { eq, desc, and, isNotNull } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface PredictionResult {
  lotteryId: string;
  lotteryName: string;
  predictedNumbers: number[];
  confidence: number;
  reasoning: string;
  analysis: {
    hotNumbers: number[];
    coldNumbers: number[];
    overdueSinceDraws: number[];
    averageFrequency: number;
    analysisMethod: string;
  };
}

/**
 * Analisa dados históricos reais de uma loteria e gera prognóstico com IA
 */
export async function generateRealPrediction(
  lotteryId: string,
  lotteryName: string,
  totalNumbers: number,
  maxNumbers: number
): Promise<PredictionResult> {
  // Buscar dados históricos REAIS do banco
  const draws = await db
    .select()
    .from(lotteryDraws)
    .where(
      and(
        eq(lotteryDraws.lotteryId, lotteryId),
        isNotNull(lotteryDraws.drawnNumbers)
      )
    )
    .orderBy(desc(lotteryDraws.drawDate))
    .limit(50); // Últimos 50 sorteios

  if (draws.length === 0) {
    throw new Error(`No historical data found for lottery ${lotteryId}`);
  }

  // Calcular frequências e números atrasados
  const frequencies = new Map<number, number>();
  const lastSeen = new Map<number, number>();

  for (let i = 0; i < draws.length; i++) {
    const draw = draws[i];
    if (draw.drawnNumbers && Array.isArray(draw.drawnNumbers)) {
      for (const num of draw.drawnNumbers) {
        frequencies.set(num, (frequencies.get(num) || 0) + 1);
        lastSeen.set(num, i);
      }
    }
  }

  // Adicionar números não sorteados
  for (let i = 1; i <= totalNumbers; i++) {
    if (!frequencies.has(i)) {
      frequencies.set(i, 0);
      lastSeen.set(i, -1);
    }
  }

  // Identificar números quentes, mornos e frios
  const avgFreq = Array.from(frequencies.values()).reduce((a, b) => a + b, 0) / totalNumbers;
  const hotNumbers = Array.from(frequencies.entries())
    .filter(([, freq]) => freq >= avgFreq * 1.3)
    .map(([num]) => num)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.ceil(maxNumbers / 2));

  const coldNumbers = Array.from(frequencies.entries())
    .filter(([, freq]) => freq < avgFreq * 0.7)
    .map(([num]) => num)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.ceil(maxNumbers / 2));

  const overdueSinceDraws = Array.from(lastSeen.entries())
    .filter(([num]) => !hotNumbers.includes(num) && !coldNumbers.includes(num))
    .sort((a, b) => a[1] - b[1])
    .slice(0, Math.ceil(maxNumbers / 3))
    .map(([num]) => num);

  // Preparar dados para IA analisar
  const analysisPrompt = `
Você é um especialista em análise de dados de loterias com alta precisão estatística.

DADOS HISTÓRICOS (últimos ${draws.length} sorteios):
- Números frequentes (saíram ${Math.round(avgFreq * 1.3)}+ vezes): ${hotNumbers.join(", ")}
- Números frios (saíram <${Math.round(avgFreq * 0.7)} vezes): ${coldNumbers.join(", ")}
- Números atrasados (não saem há vários sorteios): ${overdueSinceDraws.join(", ")}
- Frequência média: ${avgFreq.toFixed(2)} vezes

ÚLTIMOS 5 SORTEIOS:
${draws
  .slice(0, 5)
  .map((d, i) => `${i + 1}. Concurso #${d.contestNumber}: ${d.drawnNumbers?.join(", ")}`)
  .join("\n")}

TAREFA: Com base APENAS em dados históricos reais e padrões estatísticos:
1. Selecione ${maxNumbers} números com MAIOR probabilidade de sair no próximo sorteio
2. Explique sua análise referenciando os dados acima
3. Forneça um nível de confiança (0-100)

IMPORTANTE: Não invente números. Use APENAS dados estatísticos reais da loteria.

Responda em JSON com estrutura:
{
  "predictedNumbers": [números selecionados em array],
  "confidence": (0-100),
  "reasoning": "explicação breve da análise"
}`;

  // Usar IA para análise profunda
  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      {
        role: "user",
        content: analysisPrompt,
      },
    ],
    max_completion_tokens: 1024,
    response_format: { type: "json_object" },
  });

  let aiAnalysis: any;
  try {
    const content = response.choices[0]?.message?.content || "{}";
    aiAnalysis = JSON.parse(content);
  } catch (e) {
    // Fallback se IA não responder com JSON válido
    aiAnalysis = {
      predictedNumbers: [...hotNumbers.slice(0, maxNumbers / 2), ...overdueSinceDraws.slice(0, maxNumbers / 2)],
      confidence: 65,
      reasoning: "Análise baseada em frequência e números atrasados",
    };
  }

  // Garantir que temos exatamente maxNumbers números
  let finalNumbers = (aiAnalysis.predictedNumbers || []).filter((n: number) => n >= 1 && n <= totalNumbers);
  
  // Se não temos números suficientes, completar com análise estatística
  if (finalNumbers.length < maxNumbers) {
    const remaining = Array.from(frequencies.keys())
      .filter((n) => !finalNumbers.includes(n))
      .sort((a, b) => (frequencies.get(b) || 0) - (frequencies.get(a) || 0))
      .slice(0, maxNumbers - finalNumbers.length);
    finalNumbers = [...finalNumbers, ...remaining];
  }

  finalNumbers = finalNumbers.slice(0, maxNumbers).sort((a, b) => a - b);

  return {
    lotteryId,
    lotteryName,
    predictedNumbers: finalNumbers,
    confidence: Math.min(100, Math.max(0, aiAnalysis.confidence || 65)),
    reasoning: aiAnalysis.reasoning || "Análise estatística de dados históricos",
    analysis: {
      hotNumbers: hotNumbers.slice(0, 10),
      coldNumbers: coldNumbers.slice(0, 10),
      overdueSinceDraws: overdueSinceDraws.slice(0, 10),
      averageFrequency: avgFreq,
      analysisMethod: "IA com análise de frequência em dados reais",
    },
  };
}

/**
 * Gera prognósticos para múltiplas loterias
 */
export async function generateMultiplePredictions(
  lotteries: Array<{ id: string; displayName: string; totalNumbers: number; maxNumbers: number }>
): Promise<PredictionResult[]> {
  const results: PredictionResult[] = [];

  for (const lottery of lotteries) {
    try {
      const prediction = await generateRealPrediction(
        lottery.id,
        lottery.displayName,
        lottery.totalNumbers,
        lottery.maxNumbers
      );
      results.push(prediction);

      // Pequeno delay entre requisições para não sobrecarregar IA
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Erro ao gerar prognóstico para ${lottery.displayName}:`, error);
      // Continuar com próxima loteria
    }
  }

  return results;
}
