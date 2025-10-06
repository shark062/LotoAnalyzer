
import { storage } from '../storage';
import { aiService } from './aiService';

interface ChatMessage {
  userId: string;
  message: string;
  context?: {
    lotteryId?: string;
    lastDraws?: any[];
    userPreferences?: any;
  };
}

interface IAResponse {
  provider: string;
  suggestions: number[][];
  confidences: Record<string, number>;
  explain: string;
  error?: boolean;
}

interface FusionResult {
  reply: string;
  tickets: number[][];
  trace: {
    iaResponses: IAResponse[];
    weights: Record<string, number>;
    finalProbs: Record<string, number>;
  };
  id: string;
}

class ChatbotService {
  private weights: Record<string, number> = {
    openai: 0.30,
    gemini: 0.25,
    deepseek: 0.20,
    anthropic: 0.25,
    local: 0.40
  };

  private personas = {
    analista: {
      style: 'técnico',
      template: (tickets: number[][], explain: string) => 
        `📊 **Análise Técnica**: ${explain}\n\n🎯 **Sugestões geradas**:\n${tickets.map((t, i) => `${i+1}. [${t.join(', ')}]`).join('\n')}`
    },
    lek: {
      style: 'agressivo',
      template: (tickets: number[][], explain: string) =>
        `🦈 **FECHADO, ZÉ!** ${explain}\n\n💰 **Apostas prontas pra detonar**:\n${tickets.map((t, i) => `${i+1}. [${t.join(', ')}]`).join('\n')}\n\n🔥 Confia no processo!`
    },
    coach: {
      style: 'motivador',
      template: (tickets: number[][], explain: string) =>
        `✨ **Acredite no seu potencial!** ${explain}\n\n🎯 **Suas jogadas da vitória**:\n${tickets.map((t, i) => `${i+1}. [${t.join(', ')}]`).join('\n')}\n\n💪 Você está pronto pra ganhar!`
    }
  };

  async processChat(chatMessage: ChatMessage, persona: keyof typeof this.personas = 'analista'): Promise<FusionResult> {
    try {
      const { userId, message, context } = chatMessage;
      
      // 1. Análise local rápida
      const localResult = await this.localModelPredict(context, message);
      
      // 2. Chamar IAs em paralelo
      const iaResults = await this.callAllIAs(message, context);
      
      // 3. Fusão de respostas
      const fusion = await this.fuseResponses(iaResults, localResult);
      
      // 4. Formatar resposta com persona
      const personaFormatter = this.personas[persona];
      const reply = personaFormatter.template(fusion.tickets, fusion.explain);
      
      // 5. Salvar no histórico
      await this.saveChatLog(userId, message, fusion);
      
      return {
        reply,
        tickets: fusion.tickets,
        trace: {
          iaResponses: iaResults,
          weights: this.weights,
          finalProbs: fusion.finalProbs
        },
        id: fusion.id
      };
    } catch (error) {
      console.error('Erro no chatbot:', error);
      return this.getFallbackResponse();
    }
  }

  private async callAllIAs(message: string, context?: any): Promise<IAResponse[]> {
    const adapters = [
      this.callOpenAI.bind(this),
      this.callGemini.bind(this),
      this.callDeepseek.bind(this),
      this.callAnthropic.bind(this)
    ];

    const promises = adapters.map(fn => 
      Promise.race([
        fn(message, context),
        new Promise<IAResponse>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 6000)
        )
      ]).catch(err => ({ provider: fn.name, error: true, suggestions: [], confidences: {}, explain: String(err) }))
    );

    return await Promise.all(promises);
  }

  private async callOpenAI(message: string, context?: any): Promise<IAResponse> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildPrompt(message, context);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista objetivo de loterias. Retorne APENAS JSON válido com: { "suggestions": [[nums]], "confidences": {"01":0.05,...}, "explain": "motivo" }'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2500
      })
    });

    const data = await response.json();
    return this.parseIAResponse('openai', data.choices[0].message.content);
  }

  private async callGemini(message: string, context?: any): Promise<IAResponse> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = this.buildPrompt(message, context);
    const result = await model.generateContent([
      'Analise dados de loteria e retorne JSON: { "suggestions": [[nums]], "confidences": {...}, "explain": "..." }',
      prompt
    ]);

    const response = await result.response;
    return this.parseIAResponse('gemini', response.text());
  }

  private async callDeepseek(message: string, context?: any): Promise<IAResponse> {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const prompt = this.buildPrompt(message, context);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Detecte padrões profundos em loterias. Retorne JSON: { "suggestions": [[]], "confidences": {}, "explain": "" }'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    return this.parseIAResponse('deepseek', data.choices[0].message.content);
  }

  private async callAnthropic(message: string, context?: any): Promise<IAResponse> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = this.buildPrompt(message, context);
    
    const message_response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analise loterias e retorne JSON: { "suggestions": [[]], "confidences": {}, "explain": "" }\n\n${prompt}`
      }]
    });

    const content = message_response.content[0];
    const text = content.type === 'text' ? content.text : '';
    return this.parseIAResponse('anthropic', text);
  }

  private buildPrompt(message: string, context?: any): string {
    const lotteryId = context?.lotteryId || 'megasena';
    const lastDraws = context?.lastDraws?.slice(0, 10) || [];
    
    return `Loteria: ${lotteryId}
Últimos sorteios: ${JSON.stringify(lastDraws.map(d => d.drawnNumbers))}
Pergunta: ${message}

Retorne 3-5 sugestões de jogos e probabilidade para cada número.`;
  }

  private parseIAResponse(provider: string, text: string): IAResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          provider,
          suggestions: parsed.suggestions || [],
          confidences: parsed.confidences || {},
          explain: parsed.explain || ''
        };
      }
    } catch (e) {
      console.error(`Erro parsing ${provider}:`, e);
    }

    return {
      provider,
      suggestions: [],
      confidences: {},
      explain: text.substring(0, 200),
      error: true
    };
  }

  private async fuseResponses(iaResults: IAResponse[], localResult: any): Promise<any> {
    const finalProbs: Record<string, number> = {};
    
    // Normalizar e aplicar pesos
    for (let num = 1; num <= 60; num++) {
      const numStr = String(num).padStart(2, '0');
      let weightedSum = 0;
      let totalWeight = 0;

      // IAs
      for (const ia of iaResults) {
        if (!ia.error && ia.confidences[numStr]) {
          weightedSum += this.weights[ia.provider] * (ia.confidences[numStr] || 0);
          totalWeight += this.weights[ia.provider];
        }
      }

      // Local
      if (localResult.probs[numStr]) {
        weightedSum += this.weights.local * localResult.probs[numStr];
        totalWeight += this.weights.local;
      }

      finalProbs[numStr] = totalWeight > 0 ? weightedSum / totalWeight : 0.01;
    }

    // Gerar tickets baseado em finalProbs
    const tickets = this.sampleTickets(finalProbs, 3);
    
    // Explicação agregada
    const explains = iaResults.filter(ia => !ia.error).map(ia => ia.explain);
    const explain = explains.join(' | ');

    return {
      tickets,
      finalProbs,
      explain,
      id: `chat_${Date.now()}`
    };
  }

  private sampleTickets(probs: Record<string, number>, count: number): number[][] {
    const tickets: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      const ticket: number[] = [];
      const available = Object.entries(probs)
        .map(([num, prob]) => ({ num: parseInt(num), prob }))
        .sort((a, b) => b.prob - a.prob);

      // Sampling ponderado
      while (ticket.length < 6) {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const { num, prob } of available) {
          if (ticket.includes(num)) continue;
          cumulative += prob;
          if (rand <= cumulative) {
            ticket.push(num);
            break;
          }
        }
      }

      tickets.push(ticket.sort((a, b) => a - b));
    }

    return tickets;
  }

  private async localModelPredict(context: any, message: string): Promise<any> {
    const lotteryId = context?.lotteryId || 'megasena';
    const frequencies = await storage.getNumberFrequencies(lotteryId);
    
    const probs: Record<string, number> = {};
    for (const freq of frequencies) {
      const numStr = String(freq.number).padStart(2, '0');
      probs[numStr] = freq.frequency / 100;
    }

    return { probs };
  }

  private async saveChatLog(userId: string, message: string, fusion: any): Promise<void> {
    // Implementar salvamento em storage
    console.log(`💾 Chat salvo: ${userId} - ${message}`);
  }

  private getFallbackResponse(): FusionResult {
    return {
      reply: '⚠️ Sistema temporariamente indisponível. Tente novamente.',
      tickets: [],
      trace: { iaResponses: [], weights: {}, finalProbs: {} },
      id: 'fallback'
    };
  }

  async updateWeights(feedback: { chatId: string; outcome: number[] }): Promise<void> {
    // Auto-tuning simples baseado em feedback
    console.log(`🎯 Ajustando pesos baseado em feedback: ${feedback.chatId}`);
    // Implementar lógica de ajuste gradual
  }
}

export const chatbotService = new ChatbotService();
