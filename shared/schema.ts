import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lottery types table
export const lotteryTypes = pgTable("lottery_types", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  minNumbers: integer("min_numbers").notNull(),
  maxNumbers: integer("max_numbers").notNull(),
  totalNumbers: integer("total_numbers").notNull(),
  drawDays: text("draw_days").array(),
  drawTime: varchar("draw_time"),
  isActive: boolean("is_active").default(true),
});

// Lottery draws table
export const lotteryDraws = pgTable("lottery_draws", {
  id: serial("id").primaryKey(),
  lotteryId: varchar("lottery_id").references(() => lotteryTypes.id),
  contestNumber: integer("contest_number").notNull(),
  drawDate: timestamp("draw_date").notNull(),
  drawnNumbers: integer("drawn_numbers").array(),
  prizeAmount: decimal("prize_amount", { precision: 15, scale: 2 }),
  winners: jsonb("winners"), // Array of winner objects with prize tiers
  isOfficial: boolean("is_official").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User generated games table
export const userGames = pgTable("user_games", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  lotteryId: varchar("lottery_id").references(() => lotteryTypes.id),
  selectedNumbers: integer("selected_numbers").array(),
  contestNumber: integer("contest_number"),
  strategy: varchar("strategy"), // "hot", "cold", "mixed", "ai"
  isPlayed: boolean("is_played").default(false),
  matches: integer("matches").default(0),
  prizeWon: decimal("prize_won", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Number frequency tracking
export const numberFrequency = pgTable("number_frequency", {
  id: serial("id").primaryKey(),
  lotteryId: varchar("lottery_id").references(() => lotteryTypes.id),
  number: integer("number").notNull(),
  frequency: integer("frequency").default(0),
  lastDrawn: timestamp("last_drawn"),
  temperature: varchar("temperature"), // "hot", "warm", "cold"
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI analysis results
export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  lotteryId: varchar("lottery_id").references(() => lotteryTypes.id),
  analysisType: varchar("analysis_type"), // "pattern", "prediction", "strategy"
  result: jsonb("result"),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences and settings
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  favoriteLotteries: text("favorite_lotteries").array(),
  defaultStrategy: varchar("default_strategy").default("mixed"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertLotteryDrawSchema = createInsertSchema(lotteryDraws).omit({
  id: true,
  createdAt: true,
});

export const insertUserGameSchema = createInsertSchema(userGames).omit({
  id: true,
  createdAt: true,
});

export const insertNumberFrequencySchema = createInsertSchema(numberFrequency).omit({
  id: true,
  updatedAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LotteryType = typeof lotteryTypes.$inferSelect;
export type LotteryDraw = typeof lotteryDraws.$inferSelect;
export type UserGame = typeof userGames.$inferSelect;
export type NumberFrequency = typeof numberFrequency.$inferSelect;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertLotteryDraw = z.infer<typeof insertLotteryDrawSchema>;
export type InsertUserGame = z.infer<typeof insertUserGameSchema>;
export type InsertNumberFrequency = z.infer<typeof insertNumberFrequencySchema>;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;

// User Statistics interface for API responses
export interface UserStats {
  totalGames: number;
  wins: number;
  totalPrizeWon: string;
  accuracy: number;
  favoriteStrategy: string;
  averageNumbers: number;
}
