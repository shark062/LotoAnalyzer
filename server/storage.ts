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

  private async ensureGuestUser(): Promise<void> {
    try {
      if (!this.db) return;

      // Check if guest user exists
      const existingUser = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, 'guest-user'))
        .limit(1);

      if (existingUser.length === 0) {
        // Create guest user
        await this.db.insert(schema.users).values({
          id: 'guest-user',
          email: 'guest@sharkloterias.com',
          firstName: 'Guest',
          lastName: 'User',
          profileImageUrl: null,
        });
        console.log('✓ Guest user created successfully');
      } else {
        // Reset guest user data for fresh start
        await this.db
          .delete(schema.userGames)
          .where(eq(schema.userGames.userId, 'guest-user'));
        console.log('✓ Guest user games reset for fresh start');
      }
    } catch (error) {
      console.error('Error ensuring guest user exists:', error);
    }
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

      // Ensure guest user exists
      await this.ensureGuestUser();
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
      },
      {
        id: 'lotofacil',
        name: 'lotofacil',
        displayName: 'Lotofácil',
        minNumbers: 15,
        maxNumbers: 20,
        totalNumbers: 25,
        drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        drawTime: '20:00',
        isActive: true,
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
      },
      {
        id: 'lotomania',
        name: 'lotomania',
        displayName: 'Lotomania',
        minNumbers: 50,
        maxNumbers: 50,
        totalNumbers: 100,
        drawDays: ['Tuesday', 'Friday'],
        drawTime: '20:00',
        isActive: true,
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
      },
      {
        id: 'supersete',
        name: 'supersete',
        displayName: 'Super Sete',
        minNumbers: 7,
        maxNumbers: 21,
        totalNumbers: 10,
        drawDays: ['Monday', 'Wednesday', 'Friday'],
        drawTime: '20:00',
        isActive: true,
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
        id: Math.floor(Math.random() * 100000),
        lotteryId,
        number: i,
        frequency,
        temperature: temperature as 'hot' | 'warm' | 'cold',
        lastDrawn: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        drawsSinceLastSeen: 0,
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

      await this.db.insert(schema.lotteryTypes).values(lottery).onConflictDoNothing();
      console.log(`✓ Lottery type ${lottery.id} inserted/updated successfully`);
    } catch (error) {
      // Ignore duplicate key errors and other conflicts
      if (error instanceof Error && (
        error.message.includes('duplicate key') ||
        error.message.includes('already exists') ||
        error.message.includes('unique constraint')
      )) {
        console.log(`Lottery type ${lottery.id} already exists, skipping`);
        return;
      }
      console.error(`Error inserting lottery type ${lottery.id}:`, error);
    }
  }

  async upsertUser(user: any): Promise<void> {
    try {
      if (!this.db) {
        console.log('Database not available for storing user');
        return;
      }

      // Use the provided ID or generate a new one
      const userData = {
        id: user.id || 'guest-user',
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      };

      await this.db.insert(schema.users).values(userData).onConflictDoUpdate({
        target: schema.users.email,
        set: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
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
        prizeAmount: drawData.prizeAmount || "0",
        winners: drawData.winners || null
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
        .from(schema.numberFrequency)
        .where(
          and(
            eq(schema.numberFrequency.lotteryId, data.lotteryId),
            eq(schema.numberFrequency.number, data.number)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(schema.numberFrequency)
          .set({
            frequency: data.frequency,
            lastDrawn: data.lastDrawn,
            drawsSinceLastSeen: data.drawsSinceLastSeen,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(schema.numberFrequency.lotteryId, data.lotteryId),
              eq(schema.numberFrequency.number, data.number)
            )
          );
      } else {
        await this.db.insert(schema.numberFrequency).values({
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


  async getNumberFrequencies(lotteryId: string): Promise<NumberFrequency[]> {
    try {
      if (!this.db) {
        console.log('Database not available, generating fallback frequencies');
        return this.generateFallbackFrequencies(lotteryId);
      }



      const frequencies = await this.db
        .select()
        .from(schema.numberFrequency)
        .where(eq(schema.numberFrequency.lotteryId, lotteryId))
        .orderBy(desc(schema.numberFrequency.frequency));

      if (frequencies.length === 0) {
        console.log(`No frequencies found for ${lotteryId}, generating fallback data`);
        return this.generateFallbackFrequencies(lotteryId);
      }

      // Calculate temperatures based on frequency distribution
      const sortedFreqs = frequencies.map(f => f.frequency || 0).sort((a, b) => (b || 0) - (a || 0));
      const total = frequencies.length;

      const hotThreshold = Math.ceil(total * 0.3); // Top 30%
      const coldThreshold = Math.floor(total * 0.3); // Bottom 30%

      return frequencies.map(f => {
        const rank = sortedFreqs.indexOf(f.frequency || 0);
        let temperature: 'hot' | 'warm' | 'cold' = 'warm';

        if (rank < hotThreshold) {
          temperature = 'hot';
        } else if (rank >= total - coldThreshold) {
          temperature = 'cold';
        }

        return {
          ...f,
          temperature
        };
      });
    } catch (error) {
      console.error('Error getting number frequencies:', error);
      console.log('Returning fallback frequencies due to database error');
      return this.generateFallbackFrequencies(lotteryId);
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

  async clearUserGames(userId: string): Promise<void> {
    try {
      if (!this.db) {
        console.warn('Database not available for clearing user games');
        return;
      }

      await this.db
        .delete(schema.userGames)
        .where(eq(schema.userGames.userId, userId));

      console.log(`✓ Cleared all games for user: ${userId}`);
    } catch (error) {
      console.error('Error clearing user games:', error);
      throw new Error('Failed to clear user games from database');
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
        .from(schema.aiAnalysis)
        .where(
          and(
            eq(schema.aiAnalysis.lotteryId, lotteryId),
            eq(schema.aiAnalysis.analysisType, analysisType)
          )
        )
        .orderBy(desc(schema.aiAnalysis.createdAt))
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

      const [result] = await this.db.insert(schema.aiAnalysis).values(analysis).returning();
      return result;
    } catch (error) {
      console.error('Error creating AI analysis:', error);
      throw new Error('Failed to save AI analysis to database');
    }
  }
}

export const storage = new Storage();

// Placeholder for lottery types, this should be fetched from the database or a config file
const lotteryTypes: LotteryType[] = [
  {
    id: 'megasena',
    name: 'megasena',
    displayName: 'Mega-Sena',
    minNumbers: 6,
    maxNumbers: 15,
    totalNumbers: 60,
    drawDays: ['Wednesday', 'Saturday'],
    drawTime: '20:00', // Corrected draw time
    isActive: true,
  },
  {
    id: 'lotofacil',
    name: 'lotofacil',
    displayName: 'Lotofácil',
    minNumbers: 15,
    maxNumbers: 20,
    totalNumbers: 25,
    drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
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
  },
  {
    id: 'lotomania',
    name: 'lotomania',
    displayName: 'Lotomania',
    minNumbers: 50,
    maxNumbers: 50,
    totalNumbers: 100,
    drawDays: ['Tuesday', 'Friday'],
    drawTime: '20:00',
    isActive: true,
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
  },
  {
    id: 'supersete',
    name: 'supersete',
    displayName: 'Super Sete',
    minNumbers: 7,
    maxNumbers: 21,
    totalNumbers: 10,
    drawDays: ['Monday', 'Wednesday', 'Friday'],
    drawTime: '20:00', // Corrected draw time
    isActive: true,
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
  },
];

let isInitialized = false;

export async function ensureLotteryTypesInitialized() {
  if (isInitialized) {
    return;
  }

  const log = (message: string) => console.log(message); // Helper for consistent logging

  log('🔧 Ensuring all lottery types are properly initialized...');

  const existingTypes = await storage.getLotteryTypes();
  const existingTypeIds = new Set(existingTypes?.map(t => t.id) || []);

  for (const lotteryType of lotteryTypes) {
    // Check if the lottery type already exists in the database
    if (!existingTypeIds.has(lotteryType.id)) {
      await storage.insertLotteryType(lotteryType);
    } else {
      // Optionally, update existing types if needed. For now, we just ensure they exist.
      log(`Lottery type ${lotteryType.id} already exists, skipping insertion.`);
    }
  }

  log(`✓ Lottery initialization complete. Found ${existingTypes?.length ?? 0} types.`);
  isInitialized = true;
}