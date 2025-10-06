
import { storage } from '../storage';
import { aiService } from './aiService';
import { multiAIService } from './multiAIService';
import { deepAnalysis } from './deepAnalysis';
import { hybridScoring } from './hybridScoringService';

interface ChatMessage {
  userId: string;
  message: string;
  context?: {
    lotteryId?: string;
    lastDraws?: any[];
    userPreferences?: any;
  };
}

interface ChatResponse {
  reply: string;
  data?: any;
  visualizations?: {
    type: 'games' | 'heatmap' | 'analysis' | 'comparison';
    content: any;
  }[];
  suggestions?: string[];
  id: string;
}

class ChatbotService {
  /**
   * Processar mensagem do chat e executar ações
   */
  async processChat(chatMessage: ChatMessage): Promise<ChatResponse> {
    try {
      const { userId, message, context } = chatMessage;
      const lowerMessage = message.toLowerCase();

      // Detectar intenção
      const intent = this.detectIntent(lowerMessage);

      let response: ChatResponse;

      switch (intent.type) {
        case 'generate_games':
          response = await this.handleGenerateGames(intent, context);
          break;

        case 'show_heatmap':
          response = await this.handleShowHeatmap(intent, context);
          break;

        case 'analyze_lottery':
          response = await this.handleAnalyzeLottery(intent, context);
          break;

        case 'compare_lotteries':
          response = await this.handleCompareLotteries(intent, context);
          break;

        case 'show_predictions':
          response = await this.handleShowPredictions(intent, context);
          break;

        case 'explain_strategy':
          response = await this.handleExplainStrategy(intent, context);
          break;

        case 'check_results':
          response = await this.handleCheckResults(intent, context);
          break;

        case 'show_statistics':
          response = await this.handleShowStatistics(intent, context);
          break;

        case 'general_question':
        default:
          response = await this.handleGeneralQuestion(message, context);
          break;
      }

      return response;
    } catch (error) {
      console.error('Erro no chatbot:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Detectar intenção da mensagem
   */
  private detectIntent(message: string): { type: string; params: any } {
    const patterns = {
      generate_games: /gerar|criar|fazer|montar|sortear|jogo|aposta|números/i,
      show_heatmap: /mapa de calor|heatmap|temperatura|quentes|frios|frequência/i,
      analyze_lottery: /analis|análise|estud|padrão|tendência/i,
      compare_lotteries: /compar|diferença|versus|vs|qual melhor/i,
      show_predictions: /predição|previsão|próximo|sugestão|recomendar/i,
      explain_strategy: /estratégia|como jogar|dica|método/i,
      check_results: /resultado|conferir|verificar|acertei|ganhei/i,
      show_statistics: /estatística|dado|histórico|probabilidade/i,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return {
          type,
          params: this.extractParams(message, type)
        };
      }
    }

    return { type: 'general_question', params: {} };
  }

  /**
   * Extrair parâmetros da mensagem
   */
  private extractParams(message: string, intentType: string): any {
    const params: any = {};

    // Detectar modalidade
    const lotteries = {
      'megasena': /mega.?sena|mega/i,
      'lotofacil': /lotof[aá]cil|lf/i,
      'quina': /quina/i,
      'lotomania': /lotomania|lm/i,
      'duplasena': /dupla.?sena|ds/i,
      'supersete': /super.?sete|s7/i,
      'milionaria': /milion[aá]ria|\+milion[aá]ria/i,
      'timemania': /timemania|tm/i,
      'diadesorte': /dia.?de.?sorte|ds/i,
    };

    for (const [id, pattern] of Object.entries(lotteries)) {
      if (pattern.test(message)) {
        params.lotteryId = id;
        break;
      }
    }

    // Detectar quantidade de jogos
    const countMatch = message.match(/(\d+)\s*(jogo|aposta|bilhete)/i);
    if (countMatch) {
      params.gamesCount = parseInt(countMatch[1]);
    }

    // Detectar quantidade de números
    const numbersMatch = message.match(/(\d+)\s*(número|dezena)/i);
    if (numbersMatch) {
      params.numbersCount = parseInt(numbersMatch[1]);
    }

    // Detectar estratégia
    if (/quente|hot/i.test(message)) params.strategy = 'hot';
    else if (/frio|cold/i.test(message)) params.strategy = 'cold';
    else if (/ia|inteligente|avançad/i.test(message)) params.strategy = 'ai';
    else params.strategy = 'mixed';

    return params;
  }

  /**
   * Gerar jogos
   */
  private async handleGenerateGames(intent: any, context?: any): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const gamesCount = intent.params.gamesCount || 3;
    const strategy = intent.params.strategy || 'ai';

    const lottery = await storage.getLotteryType(lotteryId);
    if (!lottery) {
      return {
        reply: '❌ Modalidade não encontrada. Tente: Mega-Sena, Lotofácil, Quina, etc.',
        id: Date.now().toString()
      };
    }

    const numbersCount = intent.params.numbersCount || lottery.minNumbers;

    // Gerar jogos com IA
    const games = await aiService.generateWithAI(lotteryId, numbersCount, gamesCount);

    const strategyNames = {
      hot: '🔥 Números Quentes',
      cold: '❄️ Números Frios',
      mixed: '♨️ Estratégia Balanceada',
      ai: '🤖 IA Avançada'
    };

    return {
      reply: `✨ Gerei ${gamesCount} jogo(s) para **${lottery.displayName}** usando ${strategyNames[strategy as keyof typeof strategyNames]}!\n\nConfira abaixo os jogos gerados:`,
      visualizations: [{
        type: 'games',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          strategy,
          games: games.map(g => g.sort((a, b) => a - b))
        }
      }],
      suggestions: [
        'Mostrar mapa de calor',
        'Fazer análise detalhada',
        'Gerar mais jogos',
        'Comparar com resultados anteriores'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Mostrar mapa de calor
   */
  private async handleShowHeatmap(intent: any, context?: any): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return {
        reply: '❌ Modalidade não encontrada.',
        id: Date.now().toString()
      };
    }

    const frequencies = await storage.getNumberFrequencies(lotteryId);

    const hotNumbers = frequencies.filter(f => f.temperature === 'hot');
    const warmNumbers = frequencies.filter(f => f.temperature === 'warm');
    const coldNumbers = frequencies.filter(f => f.temperature === 'cold');

    return {
      reply: `🔥 **Mapa de Calor - ${lottery.displayName}**\n\n` +
        `🔥 **Quentes**: ${hotNumbers.length} números\n` +
        `♨️ **Mornos**: ${warmNumbers.length} números\n` +
        `❄️ **Frios**: ${coldNumbers.length} números\n\n` +
        `Os 5 números mais quentes são: ${hotNumbers.slice(0, 5).map(f => f.number).join(', ')}`,
      visualizations: [{
        type: 'heatmap',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          frequencies,
          maxNumbers: lottery.totalNumbers,
          stats: {
            hot: hotNumbers.length,
            warm: warmNumbers.length,
            cold: coldNumbers.length
          }
        }
      }],
      suggestions: [
        'Gerar jogos com números quentes',
        'Ver análise completa',
        'Comparar temperaturas',
        'Ver histórico de sorteios'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Análise de loteria
   */
  private async handleAnalyzeLottery(intent: any, context?: any): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return {
        reply: '❌ Modalidade não encontrada.',
        id: Date.now().toString()
      };
    }

    const [frequencies, latestDraws] = await Promise.all([
      storage.getNumberFrequencies(lotteryId),
      storage.getLatestDraws(lotteryId, 50)
    ]);

    const correlationMatrix = deepAnalysis.correlationAnalysis.calculateCorrelationMatrix(
      latestDraws,
      lottery.totalNumbers
    );

    const patterns = deepAnalysis.patternRecognition.detectPatterns(latestDraws);
    const sequences = deepAnalysis.correlationAnalysis.analyzeConsecutiveSequences(latestDraws, 2);

    const mostFrequent = frequencies
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    const leastFrequent = frequencies
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, 10);

    return {
      reply: `📊 **Análise Completa - ${lottery.displayName}**\n\n` +
        `📈 **Top 5 Mais Frequentes**: ${mostFrequent.slice(0, 5).map(f => f.number).join(', ')}\n` +
        `📉 **Top 5 Menos Frequentes**: ${leastFrequent.slice(0, 5).map(f => f.number).join(', ')}\n` +
        `🔗 **Sequências Detectadas**: ${sequences.length} padrões\n` +
        `🎯 **Correlações Identificadas**: ${correlationMatrix.size} pares correlacionados\n\n` +
        `A análise identificou padrões importantes que podem auxiliar nas suas apostas!`,
      visualizations: [{
        type: 'analysis',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          mostFrequent: mostFrequent.slice(0, 10),
          leastFrequent: leastFrequent.slice(0, 10),
          sequences: sequences.slice(0, 5),
          patterns,
          totalAnalyzed: latestDraws.length
        }
      }],
      suggestions: [
        'Gerar jogos com base na análise',
        'Ver mapa de calor',
        'Comparar com outras loterias',
        'Ver predições para próximo sorteio'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Comparar loterias
   */
  private async handleCompareLotteries(intent: any, context?: any): Promise<ChatResponse> {
    const lotteries = await storage.getAllLotteryTypes();
    const comparison: any[] = [];

    for (const lottery of lotteries.slice(0, 5)) {
      const frequencies = await storage.getNumberFrequencies(lottery.id);
      const latestDraws = await storage.getLatestDraws(lottery.id, 10);

      comparison.push({
        id: lottery.id,
        name: lottery.displayName,
        totalNumbers: lottery.totalNumbers,
        minNumbers: lottery.minNumbers,
        maxNumbers: lottery.maxNumbers,
        hotNumbers: frequencies.filter(f => f.temperature === 'hot').length,
        recentDraws: latestDraws.length
      });
    }

    return {
      reply: `📊 **Comparação de Modalidades**\n\n` +
        comparison.map(c => 
          `**${c.name}**\n` +
          `  • Números: ${c.minNumbers}-${c.maxNumbers} de ${c.totalNumbers}\n` +
          `  • Números quentes: ${c.hotNumbers}\n`
        ).join('\n'),
      visualizations: [{
        type: 'comparison',
        content: { comparison }
      }],
      suggestions: [
        'Qual a melhor para jogar?',
        'Gerar jogos para a mais fácil',
        'Ver análise detalhada de cada uma',
        'Comparar probabilidades'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Mostrar predições
   */
  private async handleShowPredictions(intent: any, context?: any): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return {
        reply: '❌ Modalidade não encontrada.',
        id: Date.now().toString()
      };
    }

    const [frequencies, latestDraws] = await Promise.all([
      storage.getNumberFrequencies(lotteryId),
      storage.getLatestDraws(lotteryId, 100)
    ]);

    // Usar IA para gerar predição
    const prediction = await aiService.generatePrediction(lotteryId, lottery);

    return {
      reply: `🔮 **Predições para ${lottery.displayName}**\n\n` +
        `🎯 **Predição Principal** (${Math.round(prediction.confidence * 100)}% confiança):\n` +
        `${prediction.primaryPrediction.map(n => n.toString().padStart(2, '0')).join(' - ')}\n\n` +
        `💡 **Análise**: ${prediction.reasoning}\n\n` +
        `⚠️ **Nível de Risco**: ${prediction.riskLevel}`,
      visualizations: [{
        type: 'games',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          strategy: 'ai',
          games: [prediction.primaryPrediction, ...prediction.alternatives.map((a: any) => a.numbers)]
        }
      }],
      suggestions: [
        'Usar esta predição',
        'Gerar mais alternativas',
        'Ver análise completa',
        'Comparar com histórico'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Explicar estratégia
   */
  private async handleExplainStrategy(intent: any, context?: any): Promise<ChatResponse> {
    const strategies = {
      hot: {
        emoji: '🔥',
        name: 'Números Quentes',
        description: 'Foca nos números que **mais saíram** recentemente. Baseada na tendência de repetição.',
        howWorks: 'Seleciona números com maior frequência nos últimos 20-30 sorteios',
        pros: ['Segue tendências recentes', 'Números com "momentum"', 'Boa para curto prazo'],
        cons: ['Pode não capturar mudanças', 'Ignora números atrasados'],
        ideal: 'Jogadores que acreditam em "sequências quentes"'
      },
      cold: {
        emoji: '❄️',
        name: 'Números Frios',
        description: 'Foca nos números que **não saem há mais tempo**. Baseada na teoria de compensação.',
        howWorks: 'Seleciona números com menor frequência e maior delay',
        pros: ['Aposta na lei dos grandes números', 'Potencial de "estourar"', 'Diversificação'],
        cons: ['Pode demorar a acertar', 'Contraria tendências'],
        ideal: 'Jogadores pacientes que acreditam em equilíbrio'
      },
      mixed: {
        emoji: '♨️',
        name: 'Estratégia Balanceada',
        description: 'Combina **40% quentes, 35% mornos e 25% frios** para balancear riscos.',
        howWorks: 'Distribuição estratégica entre diferentes temperaturas',
        pros: ['Balanceamento de riscos', 'Cobertura ampla', 'Estatisticamente sólida'],
        cons: ['Não é especializada', 'Retorno médio'],
        ideal: 'Jogadores que buscam equilíbrio'
      },
      ai: {
        emoji: '🤖',
        name: 'IA Avançada',
        description: 'Usa **machine learning e algoritmos avançados** para análise multi-dimensional.',
        howWorks: 'Combina correlação, padrões temporais, dispersão e análise híbrida',
        pros: ['Análise complexa', 'Aprende com histórico', 'Alta precisão'],
        cons: ['Computacionalmente intensivo', 'Requer dados'],
        ideal: 'Jogadores experientes que buscam tecnologia'
      }
    };

    const strategyKey = intent.params.strategy || 'mixed';
    const strategy = strategies[strategyKey as keyof typeof strategies];

    return {
      reply: `${strategy.emoji} **${strategy.name}**\n\n` +
        `${strategy.description}\n\n` +
        `**Como Funciona:**\n${strategy.howWorks}\n\n` +
        `**Vantagens:**\n${strategy.pros.map(p => `✅ ${p}`).join('\n')}\n\n` +
        `**Desvantagens:**\n${strategy.cons.map(c => `⚠️ ${c}`).join('\n')}\n\n` +
        `**Ideal Para:** ${strategy.ideal}`,
      suggestions: [
        `Gerar jogos com estratégia ${strategy.name}`,
        'Ver outras estratégias',
        'Comparar estratégias',
        'Fazer análise personalizada'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Verificar resultados
   */
  private async handleCheckResults(intent: any, context?: any): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return {
        reply: '❌ Modalidade não encontrada.',
        id: Date.now().toString()
      };
    }

    const latestDraw = (await storage.getLatestDraws(lotteryId, 1))[0];

    if (!latestDraw) {
      return {
        reply: `ℹ️ Ainda não há resultados disponíveis para ${lottery.displayName}.`,
        id: Date.now().toString()
      };
    }

    return {
      reply: `🎲 **Último Resultado - ${lottery.displayName}**\n\n` +
        `🎯 Concurso: **${latestDraw.contestNumber}**\n` +
        `📅 Data: ${new Date(latestDraw.drawDate).toLocaleDateString('pt-BR')}\n\n` +
        `**Números Sorteados:**\n${latestDraw.drawnNumbers.map((n: number) => n.toString().padStart(2, '0')).join(' - ')}\n\n` +
        `Para conferir suas apostas, me envie os números que você jogou!`,
      suggestions: [
        'Ver histórico de resultados',
        'Gerar jogos para próximo sorteio',
        'Analisar padrões deste resultado',
        'Comparar com minhas apostas'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Mostrar estatísticas
   */
  private async handleShowStatistics(intent: any, context?: any): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return {
        reply: '❌ Modalidade não encontrada.',
        id: Date.now().toString()
      };
    }

    const [frequencies, latestDraws] = await Promise.all([
      storage.getNumberFrequencies(lotteryId),
      storage.getLatestDraws(lotteryId, 100)
    ]);

    const dispersion = deepAnalysis.correlationAnalysis.calculateDispersionMetrics(frequencies);

    return {
      reply: `📊 **Estatísticas - ${lottery.displayName}**\n\n` +
        `📈 **Sorteios Analisados**: ${latestDraws.length}\n` +
        `🔢 **Total de Números**: ${lottery.totalNumbers}\n` +
        `🎯 **Números por Jogo**: ${lottery.minNumbers}-${lottery.maxNumbers}\n\n` +
        `**Dispersão:**\n` +
        `• Média: ${dispersion.mean.toFixed(2)}\n` +
        `• Desvio Padrão: ${dispersion.standardDeviation.toFixed(2)}\n` +
        `• Coef. Variação: ${dispersion.coefficientOfVariation.toFixed(2)}%`,
      suggestions: [
        'Ver análise detalhada',
        'Mostrar mapa de calor',
        'Gerar jogos baseados nas estatísticas',
        'Comparar com outras loterias'
      ],
      id: Date.now().toString()
    };
  }

  /**
   * Resposta para perguntas gerais
   */
  private async handleGeneralQuestion(message: string, context?: any): Promise<ChatResponse> {
    const helpTopics = [
      '🎲 **Gerar Jogos**: "gerar 3 jogos para mega-sena"',
      '🔥 **Mapa de Calor**: "mostrar mapa de calor da lotofácil"',
      '📊 **Análises**: "analisar quina"',
      '🔮 **Predições**: "prever números para mega-sena"',
      '📈 **Resultados**: "último resultado da lotofácil"',
      '⚙️ **Estratégias**: "explicar estratégia de números quentes"',
    ];

    return {
      reply: `👋 Olá! Sou o assistente inteligente da **Shark Loterias**!\n\n` +
        `Posso te ajudar com:\n\n${helpTopics.join('\n\n')}\n\n` +
        `Como posso te ajudar hoje?`,
      suggestions: [
        'Gerar jogos para mega-sena',
        'Mostrar mapa de calor',
        'Ver predições',
        'Analisar melhor estratégia'
      ],
      id: Date.now().toString()
    };
  }

  private getFallbackResponse(): ChatResponse {
    return {
      reply: '⚠️ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente!',
      suggestions: [
        'Gerar jogos',
        'Mostrar mapa de calor',
        'Ver análises',
        'Ajuda'
      ],
      id: Date.now().toString()
    };
  }
}

export const chatbotService = new ChatbotService();
