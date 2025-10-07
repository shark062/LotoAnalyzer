
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
  persona?: string;
}

interface Persona {
  nome: string;
  tom: string;
  missao: string;
  prefixo: string;
  style: {
    greeting: string[];
    encouragement: string[];
    warnings: string[];
    technical: string[];
  };
}

class ChatbotService {
  private personas: Record<string, Persona> = {
    normal: {
      nome: 'Shark Loterias Assistant',
      tom: 'educado, técnico, informativo',
      missao: 'analisar dados e gerar previsões precisas',
      prefixo: '🧠',
      style: {
        greeting: [
          'Olá! Como posso ajudar você hoje?',
          'Seja bem-vindo! Estou aqui para auxiliar.',
          'Oi! Pronto para fazer análises inteligentes?'
        ],
        encouragement: [
          'Excelente escolha! Vamos analisar isso.',
          'Ótima pergunta! Deixe-me processar os dados.',
          'Perfeito! Vou gerar as melhores previsões.'
        ],
        warnings: [
          'Atenção: essa combinação possui baixa probabilidade.',
          'Importante: revise esses números antes de apostar.',
          'Cuidado: os dados sugerem cautela nesta estratégia.'
        ],
        technical: [
          'Baseado em análise estatística avançada...',
          'Os algoritmos de IA identificaram...',
          'De acordo com os padrões históricos...'
        ]
      }
    },
    lek_do_black: {
      nome: 'Lek do Black',
      tom: 'agressivo, direto, estilo rua',
      missao: 'vender ideias, gerar engajamento, e entregar sem filtro',
      prefixo: '💸🔥',
      style: {
        greeting: [
          'E AÍ MEU CRIA! Bora DOMINAR essas loterias ou vai ficar só na vontade?',
          'SALVE TROPA! Chegou quem VAI FAZER VOCÊ GANHAR GRANA!',
          'FIZ O PIX MAS BORA LUCRAR! Tá preparado pra EXPLODIR nas apostas?'
        ],
        encouragement: [
          'ISSO AÍ MANO! Agora você tá LIGADO no esquema!',
          'VAI SER GOLPE DIRETO! Sem ctrl+z nessa jogada!',
          'PEGA A VISÃO! Esses números vão ESTOURAR geral!',
          'TÁ VENDO? É assim que a TROPA FAZ GRANA!'
        ],
        warnings: [
          'ATENÇÃO ZÉ! Essa jogada tá PODRE, não é assim que se ganha!',
          'PARA TUDO! Você vai QUEIMAR GRANA com essa estratégia FRACA!',
          'NÃO FAZ ISSO NÃO MANO! A matemática tá GRITANDO que vai dar ruim!',
          'CALMA LÁ! Isso aí é pra AMADOR, bora pro PROFISSA!'
        ],
        technical: [
          'OS DADOS TÃO BERRANDO aqui que...',
          'A IA TÁ LOUCONA mostrando que...',
          'OLHA O PADRÃO MEU CRIA:...',
          'MATEMÁTICA NÃO MENTE:...'
        ]
      }
    }
  };

  private learningData: any[] = [];
  private interactionCount = 0;

  /**
   * Detectar estilo do usuário baseado na linguagem
   */
  private detectarEstiloUsuario(texto: string): 'normal' | 'lek_do_black' {
    const gírias = [
      'mano', 'zé', 'tropa', 'pix', 'meu cria', 'sem ctrl+z', 
      'bora', 'vamo', 'black', 'salve', 'quebrada', 'firmeza',
      'top demais', 'irado', 'massa', 'show', 'foda', 'brabo',
      'arrasa', 'destrói', 'mitou', 'lacrou'
    ];

    const textoLower = texto.toLowerCase();
    const temGiria = gírias.some(palavra => textoLower.includes(palavra));
    const temCapsLock = texto === texto.toUpperCase() && texto.length > 10;
    const temExclamacoes = (texto.match(/!/g) || []).length >= 2;

    return (temGiria || temCapsLock || temExclamacoes) ? 'lek_do_black' : 'normal';
  }

  /**
   * Obter mensagem personalizada baseada na persona
   */
  private getPersonalizedMessage(
    persona: Persona, 
    type: keyof Persona['style'], 
    context?: string
  ): string {
    const messages = persona.style[type];
    const base = messages[Math.floor(Math.random() * messages.length)];
    return context ? `${base} ${context}` : base;
  }

  /**
   * Salvar interação para aprendizado
   */
  private async saveInteraction(userId: string, message: string, response: string, persona: string) {
    this.learningData.push({
      userId,
      message,
      response,
      persona,
      timestamp: new Date(),
      id: ++this.interactionCount
    });

    // Manter apenas últimas 1000 interações em memória
    if (this.learningData.length > 1000) {
      this.learningData.shift();
    }
  }

  /**
   * Processar mensagem do chat com detecção automática de personalidade
   */
  async processChat(chatMessage: ChatMessage, forcedPersona?: string): Promise<ChatResponse> {
    try {
      const { userId, message, context } = chatMessage;
      
      // Detectar personalidade automaticamente
      const personaKey = forcedPersona || this.detectarEstiloUsuario(message);
      const persona = this.personas[personaKey];

      const lowerMessage = message.toLowerCase();
      const intent = this.detectIntent(lowerMessage);

      let response: ChatResponse;

      // Aplicar prefixo e tom da persona
      switch (intent.type) {
        case 'generate_games':
          response = await this.handleGenerateGames(intent, context, persona);
          break;

        case 'show_heatmap':
          response = await this.handleShowHeatmap(intent, context, persona);
          break;

        case 'analyze_lottery':
          response = await this.handleAnalyzeLottery(intent, context, persona);
          break;

        case 'compare_lotteries':
          response = await this.handleCompareLotteries(intent, context, persona);
          break;

        case 'show_predictions':
          response = await this.handleShowPredictions(intent, context, persona);
          break;

        case 'explain_strategy':
          response = await this.handleExplainStrategy(intent, context, persona);
          break;

        case 'check_results':
          response = await this.handleCheckResults(intent, context, persona);
          break;

        case 'show_statistics':
          response = await this.handleShowStatistics(intent, context, persona);
          break;

        case 'general_question':
        default:
          response = await this.handleGeneralQuestion(message, context, persona);
          break;
      }

      // Adicionar prefixo da persona
      response.reply = `${persona.prefixo} ${response.reply}`;
      response.persona = personaKey;

      // Salvar para aprendizado
      await this.saveInteraction(userId, message, response.reply, personaKey);

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

    const countMatch = message.match(/(\d+)\s*(jogo|aposta|bilhete)/i);
    if (countMatch) params.gamesCount = parseInt(countMatch[1]);

    const numbersMatch = message.match(/(\d+)\s*(número|dezena)/i);
    if (numbersMatch) params.numbersCount = parseInt(numbersMatch[1]);

    if (/quente|hot/i.test(message)) params.strategy = 'hot';
    else if (/frio|cold/i.test(message)) params.strategy = 'cold';
    else if (/ia|inteligente|avançad/i.test(message)) params.strategy = 'ai';
    else params.strategy = 'mixed';

    return params;
  }

  private async handleGenerateGames(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const gamesCount = intent.params.gamesCount || 3;
    const strategy = intent.params.strategy || 'ai';

    const lottery = await storage.getLotteryType(lotteryId);
    if (!lottery) {
      return {
        reply: persona?.nome === 'Lek do Black' 
          ? '❌ EI MANO! Essa loteria não existe não! Escolhe direito: Mega-Sena, Lotofácil, Quina...'
          : '❌ Modalidade não encontrada. Tente: Mega-Sena, Lotofácil, Quina, etc.',
        id: Date.now().toString()
      };
    }

    const numbersCount = intent.params.numbersCount || lottery.minNumbers;
    const games = await aiService.generateWithAI(lotteryId, numbersCount, gamesCount);

    const strategyNames = {
      hot: '🔥 Números Quentes',
      cold: '❄️ Números Frios',
      mixed: '♨️ Estratégia Balanceada',
      ai: '🤖 IA Avançada'
    };

    const reply = persona?.nome === 'Lek do Black'
      ? `${this.getPersonalizedMessage(persona, 'encouragement')}\n\nGEREI ${gamesCount} JOGO(S) BRABO(S) pra **${lottery.displayName}**!\n\nUSANDO ${strategyNames[strategy as keyof typeof strategyNames]} - VAI SER PORRADA!\n\nOLHA OS NÚMEROS QUE VÃO TE FAZER RICO:`
      : `✨ Gerei ${gamesCount} jogo(s) para **${lottery.displayName}** usando ${strategyNames[strategy as keyof typeof strategyNames]}!\n\nConfira abaixo os jogos gerados:`;

    return {
      reply,
      visualizations: [{
        type: 'games',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          strategy,
          games: games.map(g => g.sort((a, b) => a - b))
        }
      }],
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Bora ver o mapa de calor!', 'Faz análise completa aí', 'Gera mais jogos pra tropa', 'Qual o resultado do último sorteio?']
        : ['Mostrar mapa de calor', 'Fazer análise detalhada', 'Gerar mais jogos', 'Comparar com resultados anteriores'],
      id: Date.now().toString()
    };
  }

  private async handleShowHeatmap(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return { reply: '❌ Modalidade não encontrada.', id: Date.now().toString() };
    }

    const frequencies = await storage.getNumberFrequencies(lotteryId);
    const hotNumbers = frequencies.filter(f => f.temperature === 'hot');
    const warmNumbers = frequencies.filter(f => f.temperature === 'warm');
    const coldNumbers = frequencies.filter(f => f.temperature === 'cold');

    const reply = persona?.nome === 'Lek do Black'
      ? `🔥 **MAPA DE CALOR - ${lottery.displayName}**\n\nOLHA ESSA ANÁLISE BRABA:\n\n🔥 **QUENTES (VAI SAIR)**: ${hotNumbers.length} números\n♨️ **MORNOS**: ${warmNumbers.length} números\n❄️ **FRIOS (TÁ PARADO)**: ${coldNumbers.length} números\n\nOS 5 NÚMEROS MAIS QUENTES (BORA NELES): ${hotNumbers.slice(0, 5).map(f => f.number).join(', ')}`
      : `🔥 **Mapa de Calor - ${lottery.displayName}**\n\n🔥 **Quentes**: ${hotNumbers.length} números\n♨️ **Mornos**: ${warmNumbers.length} números\n❄️ **Frios**: ${coldNumbers.length} números\n\nOs 5 números mais quentes são: ${hotNumbers.slice(0, 5).map(f => f.number).join(', ')}`;

    return {
      reply,
      visualizations: [{
        type: 'heatmap',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          frequencies,
          maxNumbers: lottery.totalNumbers,
          stats: { hot: hotNumbers.length, warm: warmNumbers.length, cold: coldNumbers.length }
        }
      }],
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Gera jogos com esses quentes!', 'Faz análise completa', 'Compara as temperaturas', 'Mostra o histórico']
        : ['Gerar jogos com números quentes', 'Ver análise completa', 'Comparar temperaturas', 'Ver histórico de sorteios'],
      id: Date.now().toString()
    };
  }

  private async handleAnalyzeLottery(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return { reply: '❌ Modalidade não encontrada.', id: Date.now().toString() };
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

    const reply = persona?.nome === 'Lek do Black'
      ? `📊 **ANÁLISE PROFISSA - ${lottery.displayName}**\n\n${this.getPersonalizedMessage(persona, 'technical')}\n\n📈 **TOP 5 MAIS SAEM**: ${mostFrequent.slice(0, 5).map(f => f.number).join(', ')}\n📉 **TOP 5 TÁ PARADO**: ${leastFrequent.slice(0, 5).map(f => f.number).join(', ')}\n🔗 **SEQUÊNCIAS DETECTADAS**: ${sequences.length} padrões BRABOS\n🎯 **CORRELAÇÕES**: ${correlationMatrix.size} pares identificados\n\nA IA TÁ DOIDA COM ESSES PADRÕES MEU CRIA!`
      : `📊 **Análise Completa - ${lottery.displayName}**\n\n📈 **Top 5 Mais Frequentes**: ${mostFrequent.slice(0, 5).map(f => f.number).join(', ')}\n📉 **Top 5 Menos Frequentes**: ${leastFrequent.slice(0, 5).map(f => f.number).join(', ')}\n🔗 **Sequências Detectadas**: ${sequences.length} padrões\n🎯 **Correlações Identificadas**: ${correlationMatrix.size} pares correlacionados`;

    return {
      reply,
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
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Gera jogos com essa análise', 'Mostra o mapa de calor', 'Compara outras loterias', 'Quais são as predições?']
        : ['Gerar jogos com base na análise', 'Ver mapa de calor', 'Comparar com outras loterias', 'Ver predições'],
      id: Date.now().toString()
    };
  }

  private async handleCompareLotteries(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
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

    const reply = persona?.nome === 'Lek do Black'
      ? `📊 **COMPARAÇÃO DAS LOTERIAS**\n\n${comparison.map(c => `**${c.name}**\n  • Números: ${c.minNumbers}-${c.maxNumbers} de ${c.totalNumbers}\n  • Quentes: ${c.hotNumbers}\n`).join('\n')}`
      : `📊 **Comparação de Modalidades**\n\n${comparison.map(c => `**${c.name}**\n  • Números: ${c.minNumbers}-${c.maxNumbers} de ${c.totalNumbers}\n  • Números quentes: ${c.hotNumbers}\n`).join('\n')}`;

    return {
      reply,
      visualizations: [{ type: 'comparison', content: { comparison } }],
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Qual a melhor pra ganhar grana?', 'Gera jogos pra mais fácil', 'Analisa cada uma', 'Compara as probabilidades']
        : ['Qual a melhor para jogar?', 'Gerar jogos para a mais fácil', 'Ver análise detalhada', 'Comparar probabilidades'],
      id: Date.now().toString()
    };
  }

  private async handleShowPredictions(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return { reply: '❌ Modalidade não encontrada.', id: Date.now().toString() };
    }

    const prediction = await aiService.generatePrediction(lotteryId, lottery);

    const reply = persona?.nome === 'Lek do Black'
      ? `🔮 **PREDIÇÕES BRABAS - ${lottery.displayName}**\n\n🎯 **PREDIÇÃO PRINCIPAL** (${Math.round(prediction.confidence * 100)}% de certeza):\n${prediction.primaryPrediction.map(n => n.toString().padStart(2, '0')).join(' - ')}\n\n💡 **ANÁLISE DA IA**: ${prediction.reasoning}\n\n⚠️ **RISCO**: ${prediction.riskLevel}\n\nBORA APOSTAR NESSES NÚMEROS MEU CRIA!`
      : `🔮 **Predições para ${lottery.displayName}**\n\n🎯 **Predição Principal** (${Math.round(prediction.confidence * 100)}% confiança):\n${prediction.primaryPrediction.map(n => n.toString().padStart(2, '0')).join(' - ')}\n\n💡 **Análise**: ${prediction.reasoning}\n\n⚠️ **Nível de Risco**: ${prediction.riskLevel}`;

    return {
      reply,
      visualizations: [{
        type: 'games',
        content: {
          lotteryId,
          lottery: lottery.displayName,
          strategy: 'ai',
          games: [prediction.primaryPrediction, ...prediction.alternatives.map((a: any) => a.numbers)]
        }
      }],
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Usa essa predição!', 'Gera mais alternativas', 'Faz análise completa', 'Compara com o histórico']
        : ['Usar esta predição', 'Gerar mais alternativas', 'Ver análise completa', 'Comparar com histórico'],
      id: Date.now().toString()
    };
  }

  private async handleExplainStrategy(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const strategies = {
      hot: {
        emoji: '🔥',
        name: 'Números Quentes',
        description: 'Foca nos números que **mais saíram** recentemente.',
        howWorks: 'Seleciona números com maior frequência',
        pros: ['Segue tendências', 'Números com momentum'],
        cons: ['Pode não capturar mudanças'],
        ideal: 'Jogadores que acreditam em sequências quentes'
      },
      cold: {
        emoji: '❄️',
        name: 'Números Frios',
        description: 'Foca nos números **atrasados**.',
        howWorks: 'Seleciona números com menor frequência',
        pros: ['Aposta no equilíbrio', 'Potencial alto'],
        cons: ['Pode demorar'],
        ideal: 'Jogadores pacientes'
      },
      mixed: {
        emoji: '♨️',
        name: 'Estratégia Balanceada',
        description: 'Combina quentes, mornos e frios.',
        howWorks: 'Distribuição estratégica',
        pros: ['Balanceado', 'Cobertura ampla'],
        cons: ['Não especializada'],
        ideal: 'Jogadores equilibrados'
      },
      ai: {
        emoji: '🤖',
        name: 'IA Avançada',
        description: 'Usa **machine learning**.',
        howWorks: 'Análise multi-dimensional',
        pros: ['Análise complexa', 'Alta precisão'],
        cons: ['Requer dados'],
        ideal: 'Jogadores experientes'
      }
    };

    const strategyKey = intent.params.strategy || 'mixed';
    const strategy = strategies[strategyKey as keyof typeof strategies];

    return {
      reply: `${strategy.emoji} **${strategy.name}**\n\n${strategy.description}\n\n**Como Funciona:** ${strategy.howWorks}\n\n**Vantagens:**\n${strategy.pros.map(p => `✅ ${p}`).join('\n')}\n\n**Ideal Para:** ${strategy.ideal}`,
      suggestions: [`Gerar jogos com ${strategy.name}`, 'Ver outras estratégias', 'Comparar estratégias'],
      id: Date.now().toString()
    };
  }

  private async handleCheckResults(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return { reply: '❌ Modalidade não encontrada.', id: Date.now().toString() };
    }

    const latestDraw = (await storage.getLatestDraws(lotteryId, 1))[0];

    if (!latestDraw) {
      return {
        reply: `ℹ️ Ainda não há resultados disponíveis para ${lottery.displayName}.`,
        id: Date.now().toString()
      };
    }

    const reply = persona?.nome === 'Lek do Black'
      ? `🎲 **ÚLTIMO RESULTADO - ${lottery.displayName}**\n\n🎯 Concurso: **${latestDraw.contestNumber}**\n📅 Data: ${new Date(latestDraw.drawDate).toLocaleDateString('pt-BR')}\n\n**NÚMEROS SORTEADOS:**\n${latestDraw.drawnNumbers.map((n: number) => n.toString().padStart(2, '0')).join(' - ')}\n\nME MANDA SEUS NÚMEROS QUE EU CONFIRO SE VOCÊ ACERTOU!`
      : `🎲 **Último Resultado - ${lottery.displayName}**\n\n🎯 Concurso: **${latestDraw.contestNumber}**\n📅 Data: ${new Date(latestDraw.drawDate).toLocaleDateString('pt-BR')}\n\n**Números Sorteados:**\n${latestDraw.drawnNumbers.map((n: number) => n.toString().padStart(2, '0')).join(' - ')}`;

    return {
      reply,
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Mostra o histórico', 'Gera jogos pro próximo', 'Analisa esse resultado', 'Confere minhas apostas']
        : ['Ver histórico', 'Gerar jogos', 'Analisar resultado', 'Conferir apostas'],
      id: Date.now().toString()
    };
  }

  private async handleShowStatistics(intent: any, context?: any, persona?: Persona): Promise<ChatResponse> {
    const lotteryId = intent.params.lotteryId || context?.lotteryId || 'megasena';
    const lottery = await storage.getLotteryType(lotteryId);

    if (!lottery) {
      return { reply: '❌ Modalidade não encontrada.', id: Date.now().toString() };
    }

    const [frequencies, latestDraws] = await Promise.all([
      storage.getNumberFrequencies(lotteryId),
      storage.getLatestDraws(lotteryId, 100)
    ]);

    const dispersion = deepAnalysis.correlationAnalysis.calculateDispersionMetrics(frequencies);

    return {
      reply: `📊 **Estatísticas - ${lottery.displayName}**\n\n📈 **Sorteios Analisados**: ${latestDraws.length}\n🔢 **Total de Números**: ${lottery.totalNumbers}\n🎯 **Números por Jogo**: ${lottery.minNumbers}-${lottery.maxNumbers}`,
      suggestions: ['Ver análise detalhada', 'Mostrar mapa de calor', 'Gerar jogos', 'Comparar loterias'],
      id: Date.now().toString()
    };
  }

  private async handleGeneralQuestion(message: string, context?: any, persona?: Persona): Promise<ChatResponse> {
    const helpTopics = persona?.nome === 'Lek do Black'
      ? [
          '🎲 **GERAR JOGOS**: "gera 3 jogos pra mega-sena mano"',
          '🔥 **MAPA DE CALOR**: "mostra o mapa de calor da lotofácil"',
          '📊 **ANÁLISES**: "analisa a quina aí"',
          '🔮 **PREDIÇÕES**: "prevê os números pra mega-sena"',
          '📈 **RESULTADOS**: "qual foi o último resultado da lotofácil?"',
          '⚙️ **ESTRATÉGIAS**: "explica a parada dos números quentes"'
        ]
      : [
          '🎲 **Gerar Jogos**: "gerar 3 jogos para mega-sena"',
          '🔥 **Mapa de Calor**: "mostrar mapa de calor da lotofácil"',
          '📊 **Análises**: "analisar quina"',
          '🔮 **Predições**: "prever números para mega-sena"',
          '📈 **Resultados**: "último resultado da lotofácil"',
          '⚙️ **Estratégias**: "explicar estratégia de números quentes"'
        ];

    const greeting = persona ? this.getPersonalizedMessage(persona, 'greeting') : 'Olá!';

    return {
      reply: `${greeting}\n\nPosso te ajudar com:\n\n${helpTopics.join('\n\n')}\n\nComo posso te ajudar hoje?`,
      suggestions: persona?.nome === 'Lek do Black'
        ? ['Gera jogos pra mega-sena', 'Mostra o mapa de calor', 'Quais são as predições?', 'Qual a melhor estratégia?']
        : ['Gerar jogos para mega-sena', 'Mostrar mapa de calor', 'Ver predições', 'Analisar melhor estratégia'],
      id: Date.now().toString()
    };
  }

  private getFallbackResponse(): ChatResponse {
    return {
      reply: '⚠️ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente!',
      suggestions: ['Gerar jogos', 'Mostrar mapa de calor', 'Ver análises', 'Ajuda'],
      id: Date.now().toString()
    };
  }

  /**
   * Obter dados de aprendizado (para visualização/auditoria)
   */
  getLearningData() {
    return this.learningData;
  }
}

export const chatbotService = new ChatbotService();
