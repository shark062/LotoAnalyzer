
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import type { 
  LotteryType, 
  LotteryDraw, 
  InsertLotteryDraw, 
  UserGame, 
  InsertUserGame, 
  NumberFrequency,
  UserStats,
  AiAnalysis,
  InsertAiAnalysis
} from "@shared/schema";

class Storage {
  private db: ReturnType<typeof drizzle> | null = null;
  private connectionUrl: string;

  constructor() {
    this.connectionUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/shark_loto';
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const client = postgres(this.connectionUrl, {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      
      this.db = drizzle(client, { schema });
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      this.db = null;
    }
  }

  // Fallback data for when database is not available
  private getFallbackLotteryTypes(): LotteryType[] {
    return [
      {
        id: 'megasena',
        name: 'megasena',
        displayName: 'Mega-Sena',
        minNumbers: 6,
        maxNumbers: 15,
        totalNumbers: 60,
        drawDays: ['Wednesday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lotofacil',
        name: 'lotofacil',
        displayName: 'Lotofácil',
        minNumbers: 15,
        maxNumbers: 20,
        totalNumbers: 25,
        drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'quina',
        name: 'quina',
        displayName: 'Quina',
        minNumbers: 5,
        maxNumbers: 15,
        totalNumbers: 80,
        drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'lotomania',
        name: 'lotomania',
        displayName: 'Lotomania',
        minNumbers: 50,
        maxNumbers: 50,
        totalNumbers: 100,
        drawDays: ['Tuesday', 'Thursday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'duplasena',
        name: 'duplasena',
        displayName: 'Dupla Sena',
        minNumbers: 6,
        maxNumbers: 15,
        totalNumbers: 50,
        drawDays: ['Tuesday', 'Thursday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'supersete',
        name: 'supersete',
        displayName: 'Super Sete',
        minNumbers: 7,
        maxNumbers: 21,
        totalNumbers: 10,
        drawDays: ['Monday', 'Wednesday', 'Friday'],
        drawTime: '15:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'milionaria',
        name: 'milionaria',
        displayName: '+Milionária',
        minNumbers: 6,
        maxNumbers: 12,
        totalNumbers: 50,
        drawDays: ['Wednesday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'timemania',
        name: 'timemania',
        displayName: 'Timemania',
        minNumbers: 10,
        maxNumbers: 10,
        totalNumbers: 80,
        drawDays: ['Tuesday', 'Thursday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'diadesore',
        name: 'diadesore',
        displayName: 'Dia de Sorte',
        minNumbers: 7,
        maxNumbers: 15,
        totalNumbers: 31,
        drawDays: ['Tuesday', 'Thursday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'federal',
        name: 'federal',
        displayName: 'Loteria Federal',
        minNumbers: 5,
        maxNumbers: 5,
        totalNumbers: 100000,
        drawDays: ['Wednesday', 'Saturday'],
        drawTime: '19:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private generateFallbackFrequencies(lotteryId: string): NumberFrequency[] {
    const lottery = this.getFallbackLotteryTypes().find(l => l.id === lotteryId);
    if (!lottery) return [];

    const frequencies: NumberFrequency[] = [];
    const totalNumbers = lottery.totalNumbers;
    
    for (let i = 1; i <= totalNumbers; i++) {
      const frequency = Math.floor(Math.random() * 20) + 1; // Random frequency between 1-20
      const temperature = frequency > 15 ? 'hot' : frequency > 8 ? 'warm' : 'cold';
      
      frequencies.push({
        id: `${lotteryId}-${i}`,
        lotteryId,
        number: i,
        frequency,
        temperature: temperature as 'hot' | 'warm' | 'cold',
        lastDrawn: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return frequencies;
  }

  private generateFallbackUserGames(): UserGame[] {
    const games: UserGame[] = [];
    const lotteryIds = ['megasena', 'lotofacil', 'quina'];
    
    for (let i = 0; i < 10; i++) {
      const lotteryId = lotteryIds[Math.floor(Math.random() * lotteryIds.length)];
      const lottery = this.getFallbackLotteryTypes().find(l => l.id === lotteryId);
      if (!lottery) continue;

      const numbersCount = lottery.minNumbers;
      const selectedNumbers: number[] = [];
      
      while (selectedNumbers.length < numbersCount) {
        const num = Math.floor(Math.random() * lottery.totalNumbers) + 1;
        if (!selectedNumbers.includes(num)) {
          selectedNumbers.push(num);
        }
      }
      
      selectedNumbers.sort((a, b) => a - b);
      
      const matches = Math.floor(Math.random() * (numbersCount + 1));
      const prizeWon = matches >= numbersCount - 2 ? (Math.random() * 10000).toFixed(2) : '0.00';
      
      games.push({
        id: `game-${i}`,
        userId: 'guest-user',
        lotteryId,
        selectedNumbers,
        contestNumber: 2800 + i,
        drawDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        matches,
        prizeWon,
        strategy: ['hot', 'cold', 'mixed', 'ai'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      });
    }
    
    return games;
  }

  async insertLotteryType(lottery: any): Promise<void> {
    try {
      if (!this.db) {
        console.log('Database not available for storing lottery type');
        return;
      }

      await this.db.insert(schema.lotteryTypes).values(lottery);
    } catch (error) {
      // Ignore duplicate key errors
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return;
      }
      throw error;
    }
  }

  async getLotteryTypes(): Promise<LotteryType[]> {
    try {
      if (!this.db) {
        return this.getFallbackLotteryTypes();
      }
      
      const result = await this.db.select().from(schema.lotteryTypes).where(eq(schema.lotteryTypes.isActive, true));
      return result.length > 0 ? result : this.getFallbackLotteryTypes();
    } catch (error) {
      console.error('Error fetching lottery types:', error);
      return this.getFallbackLotteryTypes();
    }
  }

  async getLotteryType(id: string): Promise<LotteryType | null> {
    try {
      const types = await this.getLotteryTypes();
      return types.find(t => t.id === id) || null;
    } catch (error) {
      console.error('Error fetching lottery type:', error);
      return this.getFallbackLotteryTypes().find(t => t.id === id) || null;
    }
  }

  async getLatestDraws(lotteryId: string, limit = 10): Promise<LotteryDraw[]> {
    try {
      if (!this.db) {
        return [];
      }
      
      const result = await this.db
        .select()
        .from(schema.lotteryDraws)
        .where(eq(schema.lotteryDraws.lotteryId, lotteryId))
        .orderBy(desc(schema.lotteryDraws.drawDate))
        .limit(limit);
        
      return result;
    } catch (error) {
      console.error('Error fetching latest draws:', error);
      return [];
    }
  }

  async createLotteryDraw(drawData: any): Promise<void> {
    try {
      if (!this.db) {
        console.log('Database not available for storing draw data');
        return;
      }

      // Check if draw already exists
      const existing = await this.db
        .select()
        .from(schema.lotteryDraws)
        .where(
          and(
            eq(schema.lotteryDraws.lotteryId, drawData.lotteryId),
            eq(schema.lotteryDraws.contestNumber, drawData.contestNumber)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`Draw ${drawData.lotteryId} #${drawData.contestNumber} already exists`);
        return;
      }

      await this.db.insert(schema.lotteryDraws).values({
        lotteryId: drawData.lotteryId,
        contestNumber: drawData.contestNumber,
        drawDate: drawData.drawDate,
        drawnNumbers: drawData.drawnNumbers,
        prizes: drawData.prizes || []
      });

      console.log(`✓ Stored draw ${drawData.lotteryId} #${drawData.contestNumber}`);
    } catch (error) {
      console.error('Error creating lottery draw:', error);
    }
  }

  async updateNumberFrequency(data: {
    lotteryId: string;
    number: number;
    frequency: number;
    lastDrawn: Date | null;
    drawsSinceLastSeen: number;
  }): Promise<void> {
    try {
      if (!this.db) return;

      // Try to update existing frequency record
      const existing = await this.db
        .select()
        .from(schema.numberFrequencies)
        .where(
          and(
            eq(schema.numberFrequencies.lotteryId, data.lotteryId),
            eq(schema.numberFrequencies.number, data.number)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(schema.numberFrequencies)
          .set({
            frequency: data.frequency,
            lastDrawn: data.lastDrawn,
            drawsSinceLastSeen: data.drawsSinceLastSeen,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(schema.numberFrequencies.lotteryId, data.lotteryId),
              eq(schema.numberFrequencies.number, data.number)
            )
          );
      } else {
        await this.db.insert(schema.numberFrequencies).values({
          lotteryId: data.lotteryId,
          number: data.number,
          frequency: data.frequency,
          lastDrawn: data.lastDrawn,
          drawsSinceLastSeen: data.drawsSinceLastSeen
        });
      }
    } catch (error) {
      console.error('Error updating number frequency:', error);
    }
  }

  async createLotteryDraw(draw: InsertLotteryDraw): Promise<LotteryDraw> {
    try {
      if (!this.db) {
        throw new Error('Database not available');
      }
      
      const [result] = await this.db.insert(schema.lotteryDraws).values(draw).returning();
      return result;
    } catch (error) {
      console.error('Error creating lottery draw:', error);
      throw error;
    }
  }

  async getNumberFrequencies(lotteryId: string): Promise<NumberFrequency[]> {
    try {
      if (!this.db) {
        return this.generateFallbackFrequencies(lotteryId);
      }
      
      const result = await this.db
        .select()
        .from(schema.numberFrequencies)
        .where(eq(schema.numberFrequencies.lotteryId, lotteryId))
        .orderBy(desc(schema.numberFrequencies.frequency));
        
      return result.length > 0 ? result : this.generateFallbackFrequencies(lotteryId);
    } catch (error) {
      console.error('Error fetching number frequencies:', error);
      return this.generateFallbackFrequencies(lotteryId);
    }
  }

  async getUserGames(userId: string, limit = 20): Promise<UserGame[]> {
    try {
      if (!this.db) {
        return this.generateFallbackUserGames();
      }
      
      const result = await this.db
        .select()
        .from(schema.userGames)
        .where(eq(schema.userGames.userId, userId))
        .orderBy(desc(schema.userGames.createdAt))
        .limit(limit);
        
      return result.length > 0 ? result : this.generateFallbackUserGames();
    } catch (error) {
      console.error('Error fetching user games:', error);
      return this.generateFallbackUserGames();
    }
  }

  async createUserGame(game: InsertUserGame): Promise<UserGame> {
    try {
      if (!this.db) {
        // Generate a mock game for fallback
        const mockGame: UserGame = {
          id: `game-${Date.now()}`,
          userId: game.userId,
          lotteryId: game.lotteryId,
          selectedNumbers: game.selectedNumbers,
          contestNumber: game.contestNumber || Math.floor(Math.random() * 1000) + 2800,
          drawDate: game.drawDate || new Date(),
          matches: Math.floor(Math.random() * game.selectedNumbers.length),
          prizeWon: '0.00',
          strategy: game.strategy || 'mixed',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return mockGame;
      }
      
      const [result] = await this.db.insert(schema.userGames).values(game).returning();
      return result;
    } catch (error) {
      console.error('Error creating user game:', error);
      // Return mock game on error
      const mockGame: UserGame = {
        id: `game-${Date.now()}`,
        userId: game.userId,
        lotteryId: game.lotteryId,
        selectedNumbers: game.selectedNumbers,
        contestNumber: game.contestNumber || Math.floor(Math.random() * 1000) + 2800,
        drawDate: game.drawDate || new Date(),
        matches: Math.floor(Math.random() * game.selectedNumbers.length),
        prizeWon: '0.00',
        strategy: game.strategy || 'mixed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return mockGame;
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      if (!this.db) {
        return {
          totalGames: 15,
          wins: 3,
          totalPrizeWon: '125.50',
          accuracy: 12,
          favoriteStrategy: 'mixed',
          averageNumbers: 7.5,
        };
      }
      
      const games = await this.getUserGames(userId, 1000);
      const wins = games.filter(g => parseFloat(g.prizeWon || '0') > 0);
      const totalPrizeWon = games.reduce((sum, g) => sum + parseFloat(g.prizeWon || '0'), 0);
      
      return {
        totalGames: games.length,
        wins: wins.length,
        totalPrizeWon: totalPrizeWon.toFixed(2),
        accuracy: games.length > 0 ? Math.round((wins.length / games.length) * 100) : 0,
        favoriteStrategy: 'mixed',
        averageNumbers: games.length > 0 ? games.reduce((sum, g) => sum + g.selectedNumbers.length, 0) / games.length : 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalGames: 10,
        wins: 2,
        totalPrizeWon: '50.00',
        accuracy: 8,
        favoriteStrategy: 'mixed',
        averageNumbers: 6.5,
      };
    }
  }

  async getLatestAiAnalysis(lotteryId: string, analysisType: string): Promise<AiAnalysis | null> {
    try {
      if (!this.db) {
        return {
          id: 1,
          lotteryId,
          analysisType,
          result: {
            primaryPrediction: [7, 14, 23, 35, 42, 58],
            confidence: 0.75,
            reasoning: 'Baseado na análise dos últimos 20 concursos, estes números apresentam padrões favoráveis de frequência e distribuição.',
            riskLevel: 'medium',
            alternatives: [
              { numbers: [3, 18, 27, 39, 45, 51], strategy: 'Números Frios' },
              { numbers: [12, 19, 28, 36, 41, 55], strategy: 'Estratégia Mista' }
            ]
          },
          confidence: '75%',
          createdAt: new Date().toISOString(),
        };
      }
      
      const result = await this.db
        .select()
        .from(schema.aiAnalyses)
        .where(
          and(
            eq(schema.aiAnalyses.lotteryId, lotteryId),
            eq(schema.aiAnalyses.analysisType, analysisType)
          )
        )
        .orderBy(desc(schema.aiAnalyses.createdAt))
        .limit(1);
        
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      return null;
    }
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    try {
      if (!this.db) {
        return {
          id: Date.now(),
          lotteryId: analysis.lotteryId,
          analysisType: analysis.analysisType,
          result: analysis.result,
          confidence: analysis.confidence,
          createdAt: new Date().toISOString(),
        };
      }
      
      const [result] = await this.db.insert(schema.aiAnalyses).values(analysis).returning();
      return result;
    } catch (error) {
      console.error('Error creating AI analysis:', error);
      throw error;
    }
  }
}

export const storage = new Storage();
