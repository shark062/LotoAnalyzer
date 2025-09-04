import {
  users,
  lotteryTypes,
  lotteryDraws,
  userGames,
  numberFrequency,
  aiAnalysis,
  userPreferences,
  type User,
  type UpsertUser,
  type LotteryType,
  type LotteryDraw,
  type UserGame,
  type NumberFrequency,
  type AiAnalysis,
  type UserPreferences,
  type InsertLotteryDraw,
  type InsertUserGame,
  type InsertNumberFrequency,
  type InsertAiAnalysis,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Lottery operations
  getLotteryTypes(): Promise<LotteryType[]>;
  getLotteryType(id: string): Promise<LotteryType | undefined>;
  getLatestDraws(lotteryId?: string, limit?: number): Promise<LotteryDraw[]>;
  createLotteryDraw(draw: InsertLotteryDraw): Promise<LotteryDraw>;
  
  // User game operations
  createUserGame(game: InsertUserGame): Promise<UserGame>;
  getUserGames(userId: string, limit?: number): Promise<UserGame[]>;
  updateUserGameResult(gameId: number, matches: number, prizeWon: string): Promise<UserGame | undefined>;
  
  // Number frequency operations
  getNumberFrequencies(lotteryId: string): Promise<NumberFrequency[]>;
  updateNumberFrequency(data: InsertNumberFrequency): Promise<NumberFrequency>;
  
  // AI analysis operations
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getLatestAiAnalysis(lotteryId: string, analysisType: string): Promise<AiAnalysis | undefined>;
  
  // User preferences
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    totalGames: number;
    wins: number;
    accuracy: number;
    totalPrizeWon: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lottery operations
  async getLotteryTypes(): Promise<LotteryType[]> {
    return await db.select().from(lotteryTypes).where(eq(lotteryTypes.isActive, true));
  }

  async getLotteryType(id: string): Promise<LotteryType | undefined> {
    const [lottery] = await db.select().from(lotteryTypes).where(eq(lotteryTypes.id, id));
    return lottery;
  }

  async getLatestDraws(lotteryId?: string, limit = 10): Promise<LotteryDraw[]> {
    const query = db.select().from(lotteryDraws);
    
    if (lotteryId) {
      return await query
        .where(eq(lotteryDraws.lotteryId, lotteryId))
        .orderBy(desc(lotteryDraws.drawDate))
        .limit(limit);
    }
    
    return await query
      .orderBy(desc(lotteryDraws.drawDate))
      .limit(limit);
  }

  async createLotteryDraw(draw: InsertLotteryDraw): Promise<LotteryDraw> {
    const [newDraw] = await db.insert(lotteryDraws).values(draw).returning();
    return newDraw;
  }

  // User game operations
  async createUserGame(game: InsertUserGame): Promise<UserGame> {
    const [newGame] = await db.insert(userGames).values(game).returning();
    return newGame;
  }

  async getUserGames(userId: string, limit = 20): Promise<UserGame[]> {
    return await db
      .select()
      .from(userGames)
      .where(eq(userGames.userId, userId))
      .orderBy(desc(userGames.createdAt))
      .limit(limit);
  }

  async updateUserGameResult(gameId: number, matches: number, prizeWon: string): Promise<UserGame | undefined> {
    const [updatedGame] = await db
      .update(userGames)
      .set({ matches, prizeWon, isPlayed: true })
      .where(eq(userGames.id, gameId))
      .returning();
    return updatedGame;
  }

  // Number frequency operations
  async getNumberFrequencies(lotteryId: string): Promise<NumberFrequency[]> {
    return await db
      .select()
      .from(numberFrequency)
      .where(eq(numberFrequency.lotteryId, lotteryId))
      .orderBy(numberFrequency.number);
  }

  async updateNumberFrequency(data: InsertNumberFrequency): Promise<NumberFrequency> {
    const [updated] = await db
      .insert(numberFrequency)
      .values(data)
      .onConflictDoUpdate({
        target: [numberFrequency.lotteryId, numberFrequency.number],
        set: {
          frequency: sql`${numberFrequency.frequency} + 1`,
          lastDrawn: data.lastDrawn,
          temperature: data.temperature,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updated;
  }

  // AI analysis operations
  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [newAnalysis] = await db.insert(aiAnalysis).values(analysis).returning();
    return newAnalysis;
  }

  async getLatestAiAnalysis(lotteryId: string, analysisType: string): Promise<AiAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(aiAnalysis)
      .where(
        and(
          eq(aiAnalysis.lotteryId, lotteryId),
          eq(aiAnalysis.analysisType, analysisType)
        )
      )
      .orderBy(desc(aiAnalysis.createdAt))
      .limit(1);
    return analysis;
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs;
  }

  async upsertUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const [upserted] = await db
      .insert(userPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    totalGames: number;
    wins: number;
    accuracy: number;
    totalPrizeWon: string;
  }> {
    const games = await db
      .select()
      .from(userGames)
      .where(eq(userGames.userId, userId));

    const totalGames = games.length;
    const wins = games.filter(game => parseFloat(game.prizeWon || "0") > 0).length;
    const accuracy = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const totalPrizeWon = games.reduce((sum, game) => sum + parseFloat(game.prizeWon || "0"), 0).toFixed(2);

    return {
      totalGames,
      wins,
      accuracy: Math.round(accuracy * 10) / 10,
      totalPrizeWon,
    };
  }
}

export const storage = new DatabaseStorage();
