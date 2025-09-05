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
        id: 'loteca',
        name: 'loteca',
        displayName: 'Loteca',
        minNumbers: 14,
        maxNumbers: 14,
        totalNumbers: 3,
        drawDays: ['Saturday'],
        drawTime: '20:00',
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

  async upsertUser(user: any): Promise<void> {
    try {
      if (!this.db) {
        console.log('Database not available for storing user');
        return;
      }

      await this.db.insert(schema.users).values(user).onConflictDoUpdate({
        target: schema.users.email,
        set: {
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        }
      });
    } catch (error) {
      console.error('Error upserting user:', error);
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
        throw new Error('Database connection required for real frequency data');
      }

      const result = await this.db
        .select()
        .from(schema.numberFrequencies)
        .where(eq(schema.numberFrequencies.lotteryId, lotteryId))
        .orderBy(desc(schema.numberFrequencies.frequency));

      return result;
    } catch (error) {
      console.error('Error fetching number frequencies:', error);
      throw new Error('Failed to fetch real frequency data');
    }
  }

  async getUserGames(userId: string, limit = 20): Promise<UserGame[]> {
    try {
      if (!this.db) {
        return []; // Return empty array if db is not available
      }

      const result = await this.db
        .select()
        .from(schema.userGames)
        .where(eq(schema.userGames.userId, userId))
        .orderBy(desc(schema.userGames.createdAt))
        .limit(limit);

      return result;
    } catch (error) {
      console.error('Error fetching user games:', error);
      return []; // Return empty array on error
    }
  }

  async createUserGame(game: InsertUserGame): Promise<UserGame> {
    try {
      if (!this.db) {
        throw new Error('Database connection required to save real games');
      }

      const [result] = await this.db.insert(schema.userGames).values(game).returning();
      return result;
    } catch (error) {
      console.error('Error creating user game:', error);
      throw new Error('Failed to save game to database');
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      if (!this.db) {
        throw new Error('Database connection required for real user stats');
      }

      const result = await this.db
        .select({
          totalGames: sql<number>`count(*)`,
          wins: sql<number>`count(case when ${schema.userGames.prizeWon} != '0.00' then 1 end)`,
          totalPrizeWon: sql<string>`coalesce(sum(cast(${schema.userGames.prizeWon} as decimal)), 0)`,
          favoriteStrategy: sql<string>`mode() within group (order by ${schema.userGames.strategy})`,
          averageNumbers: sql<number>`coalesce(avg(array_length(${schema.userGames.selectedNumbers}, 1)), 0)`,
        })
        .from(schema.userGames)
        .where(eq(schema.userGames.userId, userId));

      if (result.length > 0 && result[0].totalGames > 0) {
        const stats = result[0];
        const accuracy = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

        return {
          totalGames: stats.totalGames,
          wins: stats.wins,
          totalPrizeWon: stats.totalPrizeWon,
          accuracy,
          favoriteStrategy: stats.favoriteStrategy || 'mixed',
          averageNumbers: Math.round(stats.averageNumbers * 10) / 10,
        };
      }

      // Return zero stats for new users - real data only
      return {
        totalGames: 0,
        wins: 0,
        totalPrizeWon: '0.00',
        accuracy: 0,
        favoriteStrategy: 'mixed',
        averageNumbers: 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch real user statistics');
    }
  }

  async getLatestAiAnalysis(lotteryId: string, analysisType: string): Promise<AiAnalysis | null> {
    try {
      if (!this.db) {
        return null;
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
        throw new Error('Database connection required to save analysis');
      }

      const [result] = await this.db.insert(schema.aiAnalyses).values(analysis).returning();
      return result;
    } catch (error) {
      console.error('Error creating AI analysis:', error);
      throw new Error('Failed to save AI analysis to database');
    }
  }
}

export const storage = new Storage();