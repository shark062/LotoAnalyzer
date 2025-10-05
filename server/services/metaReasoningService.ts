
/**
 * 🧠 META-REASONING LAYER
 * 
 * Sistema que analisa a performance dos próprios modelos de IA e ajusta
 * estratégias automaticamente com base em resultados reais.
 */

import { storage } from '../storage';

interface ModelPerformance {
  modelName: string;
  accuracy: number;
  confidence: number;
  successRate: number;
  totalPredictions: number;
  lastUpdated: Date;
  strengths: string[];
  weaknesses: string[];
}

interface StrategyEvaluation {
  strategyName: string;
  effectiveness: number;
  contextBestFor: string[];
  recommendedWeight: number;
}

export class MetaReasoningService {
  private modelPerformances: Map<string, ModelPerformance> = new Map();
  private strategyEvaluations: Map<string, StrategyEvaluation> = new Map();

  /**
   * 🔍 Analisar performance de todos os modelos de IA
   */
  async analyzeModelsPerformance(lotteryId: string): Promise<{
    rankings: ModelPerformance[];
    recommendations: string[];
    optimalStrategy: string;
  }> {
    console.log(`🔍 Iniciando meta-análise para ${lotteryId}`);

    // Buscar histórico de predições e resultados reais
    const performances = await storage.getModelPerformances(lotteryId);
    const rankings: ModelPerformance[] = [];

    // Analisar cada modelo
    for (const perf of performances) {
      const analysis = await this.evaluateModelPerformance(perf, lotteryId);
      rankings.push(analysis);
      this.modelPerformances.set(perf.modelName, analysis);
    }

    // Ordenar por accuracy * confidence
    rankings.sort((a, b) => 
      (b.accuracy * b.confidence) - (a.accuracy * a.confidence)
    );

    // Gerar recomendações estratégicas
    const recommendations = this.generateStrategicRecommendations(rankings);
    const optimalStrategy = this.determineOptimalStrategy(rankings, lotteryId);

    console.log(`✅ Meta-análise concluída - Melhor modelo: ${rankings[0]?.modelName || 'N/A'}`);

    return {
      rankings,
      recommendations,
      optimalStrategy
    };
  }

  /**
   * 🎯 Avaliar performance individual de um modelo
   */
  private async evaluateModelPerformance(
    performance: any,
    lotteryId: string
  ): Promise<ModelPerformance> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analisar pontos fortes
    if (performance.accuracy > 0.30) {
      strengths.push('Alta acurácia geral');
    }
    if (performance.confidence > 0.80) {
      strengths.push('Alta confiabilidade');
    }

    // Analisar pontos fracos
    if (performance.accuracy < 0.20) {
      weaknesses.push('Baixa acurácia');
    }
    if (performance.totalPredictions < 10) {
      weaknesses.push('Dados insuficientes');
    }

    return {
      modelName: performance.modelName,
      accuracy: performance.avgAccuracy || 0,
      confidence: performance.avgConfidence || 0,
      successRate: performance.avgMatches / 6, // Normalizado
      totalPredictions: performance.totalPredictions || 0,
      lastUpdated: new Date(),
      strengths,
      weaknesses
    };
  }

  /**
   * 💡 Gerar recomendações estratégicas baseadas em análise
   */
  private generateStrategicRecommendations(rankings: ModelPerformance[]): string[] {
    const recommendations: string[] = [];

    if (rankings.length === 0) {
      return ['⚠️ Dados insuficientes para gerar recomendações'];
    }

    const bestModel = rankings[0];
    const worstModel = rankings[rankings.length - 1];

    // Recomendação baseada no melhor modelo
    recommendations.push(
      `✨ Usar primariamente ${bestModel.modelName} (${(bestModel.accuracy * 100).toFixed(1)}% accuracy)`
    );

    // Recomendação de ensemble se múltiplos modelos forem bons
    const goodModels = rankings.filter(m => m.accuracy > 0.25);
    if (goodModels.length > 1) {
      recommendations.push(
        `🎯 Combinar ${goodModels.length} modelos via ensemble para maior robustez`
      );
    }

    // Recomendação de descarte de modelos fracos
    if (worstModel.accuracy < 0.15 && worstModel.totalPredictions > 20) {
      recommendations.push(
        `⚠️ Considerar desativar ${worstModel.modelName} (baixa performance consistente)`
      );
    }

    // Recomendação de ajuste de pesos
    const totalAccuracy = rankings.reduce((sum, m) => sum + m.accuracy, 0);
    if (totalAccuracy > 0) {
      recommendations.push(
        `📊 Ajustar pesos automaticamente: Modelo top recebe ${((bestModel.accuracy / totalAccuracy) * 100).toFixed(0)}% de influência`
      );
    }

    return recommendations;
  }

  /**
   * 🎲 Determinar estratégia ótima baseada em contexto
   */
  private determineOptimalStrategy(
    rankings: ModelPerformance[],
    lotteryId: string
  ): string {
    if (rankings.length === 0) return 'balanced';

    const bestModel = rankings[0];

    // Se um modelo claramente domina (>40% accuracy)
    if (bestModel.accuracy > 0.40) {
      return `focused_${bestModel.modelName}`;
    }

    // Se múltiplos modelos são competitivos (diferença <10%)
    const topModels = rankings.filter(m => 
      Math.abs(m.accuracy - bestModel.accuracy) < 0.10
    );

    if (topModels.length >= 3) {
      return 'ensemble_weighted';
    }

    // Se há incerteza, usar abordagem conservadora
    if (bestModel.confidence < 0.60) {
      return 'conservative_diversified';
    }

    return 'balanced';
  }

  /**
   * 📈 Feedback Loop - Aprender com resultados reais
   */
  async processFeedback(
    lotteryId: string,
    contestNumber: number,
    actualNumbers: number[]
  ): Promise<{
    modelsUpdated: number;
    strategiesAdjusted: number;
    insights: string[];
  }> {
    console.log(`📈 Processando feedback para concurso ${contestNumber}`);

    // Avaliar todas as predições deste concurso
    await storage.evaluatePredictions(lotteryId, contestNumber, actualNumbers);

    // Buscar performances atualizadas
    const performances = await storage.getModelPerformances(lotteryId);
    
    const insights: string[] = [];
    let modelsUpdated = 0;
    let strategiesAdjusted = 0;

    // Atualizar conhecimento sobre cada modelo
    for (const perf of performances) {
      const previousPerf = this.modelPerformances.get(perf.modelName);
      
      if (previousPerf) {
        const improvement = perf.avgAccuracy - previousPerf.accuracy;
        
        if (improvement > 0.05) {
          insights.push(
            `📈 ${perf.modelName} melhorou ${(improvement * 100).toFixed(1)}% em accuracy`
          );
          modelsUpdated++;
        } else if (improvement < -0.05) {
          insights.push(
            `📉 ${perf.modelName} piorou ${(Math.abs(improvement) * 100).toFixed(1)}% - ajuste necessário`
          );
          modelsUpdated++;
        }
      }

      // Atualizar cache interno
      const updatedPerf = await this.evaluateModelPerformance(perf, lotteryId);
      this.modelPerformances.set(perf.modelName, updatedPerf);
    }

    // Ajustar estratégias baseado em aprendizado
    const newStrategy = this.determineOptimalStrategy(
      Array.from(this.modelPerformances.values()),
      lotteryId
    );

    insights.push(`🎯 Estratégia atualizada para: ${newStrategy}`);
    strategiesAdjusted = 1;

    return {
      modelsUpdated,
      strategiesAdjusted,
      insights
    };
  }

  /**
   * 🔮 Prever qual combinação de modelos será mais efetiva
   */
  async predictOptimalCombination(lotteryId: string): Promise<{
    primaryModel: string;
    supportingModels: string[];
    weights: Record<string, number>;
    expectedAccuracy: number;
  }> {
    const rankings = Array.from(this.modelPerformances.values())
      .sort((a, b) => (b.accuracy * b.confidence) - (a.accuracy * a.confidence));

    if (rankings.length === 0) {
      return {
        primaryModel: 'deepseek',
        supportingModels: ['gemini', 'openai'],
        weights: { deepseek: 0.4, gemini: 0.35, openai: 0.25 },
        expectedAccuracy: 0.25
      };
    }

    const primaryModel = rankings[0].modelName;
    const supportingModels = rankings.slice(1, 4).map(m => m.modelName);

    // Calcular pesos proporcionais à accuracy
    const totalAccuracy = rankings.reduce((sum, m) => sum + m.accuracy, 0);
    const weights: Record<string, number> = {};
    
    rankings.forEach(model => {
      weights[model.modelName] = totalAccuracy > 0 
        ? model.accuracy / totalAccuracy 
        : 1 / rankings.length;
    });

    // Estimar accuracy esperada (média ponderada + bonus de ensemble)
    const expectedAccuracy = Math.min(
      0.95,
      rankings.reduce((sum, m) => sum + m.accuracy * weights[m.modelName], 0) * 1.15
    );

    return {
      primaryModel,
      supportingModels,
      weights,
      expectedAccuracy
    };
  }
}

// Instância singleton
export const metaReasoning = new MetaReasoningService();
