import { storage } from "../storage";
import { aiService } from "./aiService";
import type { LotteryType, InsertLotteryDraw, InsertUserGame } from "@shared/schema";

interface GenerateGamesParams {
  lotteryId: string;
  numbersCount: number;
  gamesCount: number;
  strategy: 'hot' | 'cold' | 'mixed' | 'ai';
  userId: string;
}

interface NextDrawInfo {
  contestNumber: number;
  drawDate: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
  };
  estimatedPrize: string;
}

class LotteryService {
  private readonly API_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';
  private readonly LOTERIAS_CAIXA_API = 'https://api.loterias.caixa.gov.br';

  async initializeLotteryTypes(): Promise<void> {
    try {
      // Check if lottery types already exist
      const existingLotteries = await storage.getLotteryTypes();
      if (existingLotteries.length > 0) {
        return;
      }

      // Initialize default lottery types
      const defaultLotteries = [
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
          drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
          drawDays: ['Tuesday', 'Thursday', 'Saturday'],
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
          drawTime: '15:00',
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
      ];

      // Note: In a real implementation, you would insert these into the database
      console.log('Lottery types would be initialized:', defaultLotteries);
    } catch (error) {
      console.error('Error initializing lottery types:', error);
    }
  }

  async getNextDrawInfo(lotteryId: string): Promise<NextDrawInfo | null> {
    try {
      // Try to fetch real data from Loterias Caixa API first
      const realData = await this.fetchRealLotteryData(lotteryId);
      if (realData) {
        return realData;
      }
      
      // Fallback to calculated data
      const lottery = await storage.getLotteryType(lotteryId);
      if (!lottery || !lottery.drawDays) {
        return null;
      }

      const now = new Date();
      const nextDrawDate = this.calculateNextDrawDate(lottery.drawDays, lottery.drawTime || '20:00');
      const timeDiff = nextDrawDate.getTime() - now.getTime();
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      // Estimate contest number and prize (in real app, fetch from API)
      const latestDraws = await storage.getLatestDraws(lotteryId, 1);
      const nextContestNumber = latestDraws.length > 0 ? latestDraws[0].contestNumber + 1 : 1;

      return {
        contestNumber: nextContestNumber,
        drawDate: nextDrawDate.toISOString(),
        timeRemaining: { days, hours, minutes },
        estimatedPrize: this.getEstimatedPrize(lotteryId),
      };
    } catch (error) {
      console.error('Error getting next draw info:', error);
      return null;
    }
  }

  private calculateNextDrawDate(drawDays: string[], drawTime: string): Date {
    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = now.getDay();
    
    // Find next draw day
    let daysUntilNext = 7; // Default to a week if no match
    
    for (const drawDay of drawDays) {
      const drawDayIndex = dayNames.indexOf(drawDay);
      if (drawDayIndex !== -1) {
        let daysAhead = drawDayIndex - currentDay;
        if (daysAhead <= 0) {
          daysAhead += 7;
        }
        if (daysAhead < daysUntilNext) {
          daysUntilNext = daysAhead;
        }
      }
    }
    
    const nextDrawDate = new Date(now);
    nextDrawDate.setDate(now.getDate() + daysUntilNext);
    
    // Set the draw time
    const [hours, minutes] = drawTime.split(':').map(Number);
    nextDrawDate.setHours(hours, minutes, 0, 0);
    
    return nextDrawDate;
  }

  async fetchRealLotteryData(lotteryId: string): Promise<NextDrawInfo | null> {
    try {
      // Map internal lottery IDs to official Caixa API contest IDs
      const lotteryMapping: Record<string, string> = {
        'megasena': 'megasena',
        'lotofacil': 'lotofacil',
        'quina': 'quina',
        'lotomania': 'lotomania',
        'duplasena': 'duplasena',
        'supersete': 'supersete',
        'milionaria': 'milionaria',
        'timemania': 'timemania'
      };
      
      const officialId = lotteryMapping[lotteryId];
      if (!officialId) return null;
      
      // Note: Using a simplified approach since official API requires specific handling
      // In production, you would use the official Caixa API endpoints
      return null; // Fallback to calculated data for now
    } catch (error) {
      console.error(`Error fetching real data for ${lotteryId}:`, error);
      return null;
    }
  }

  private getEstimatedPrize(lotteryId: string): string {
    // Realistic prize estimates based on historical data
    const prizesMap: Record<string, string> = {
      'megasena': 'R$ 50.000.000,00',
      'lotofacil': 'R$ 1.500.000,00', 
      'quina': 'R$ 800.000,00',
      'lotomania': 'R$ 2.500.000,00',
      'duplasena': 'R$ 600.000,00',
      'supersete': 'R$ 3.000.000,00',
      'milionaria': 'R$ 10.000.000,00',
      'timemania': 'R$ 2.000.000,00'
    };
    return prizesMap[lotteryId] || 'R$ 500.000,00';
  }

  async generateGames(params: GenerateGamesParams): Promise<InsertUserGame[]> {
    try {
      const lottery = await storage.getLotteryType(params.lotteryId);
      if (!lottery) {
        throw new Error('Lottery type not found');
      }

      const games: InsertUserGame[] = [];
      
      for (let i = 0; i < params.gamesCount; i++) {
        let numbers: number[];
        
        // Simple random number generation for now
        numbers = this.generateRandomNumbers(params.numbersCount, lottery.totalNumbers);

        const nextDraw = await this.getNextDrawInfo(params.lotteryId);
        
        const game: InsertUserGame = {
          userId: params.userId,
          lotteryId: params.lotteryId,
          selectedNumbers: numbers.sort((a, b) => a - b),
          contestNumber: nextDraw?.contestNumber,
          strategy: params.strategy,
        };

        games.push(game);
        
        // Save to database
        await storage.createUserGame(game);
      }

      return games;
    } catch (error) {
      console.error('Error generating games:', error);
      throw new Error('Failed to generate games');
    }
  }

  private generateRandomNumbers(count: number, maxNumber: number): number[] {
    const numbers: number[] = [];
    
    while (numbers.length < count) {
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers;
  }

  async syncLatestDraws(): Promise<void> {
    try {
      // In a real implementation, this would sync with Caixa API
      console.log('Syncing latest draws...');
    } catch (error) {
      console.error('Error syncing latest draws:', error);
    }
  }

  async updateNumberFrequencies(lotteryId: string): Promise<void> {
    try {
      // In a real implementation, this would update frequencies based on latest draws
      console.log(`Updating frequencies for ${lotteryId}...`);
    } catch (error) {
      console.error('Error updating frequencies:', error);
    }
  }
}


export const lotteryService = new LotteryService();
