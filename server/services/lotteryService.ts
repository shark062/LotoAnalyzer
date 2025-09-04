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
      // In a real implementation, this would fetch from Loterias Caixa API
      // For now, we'll calculate based on lottery schedule
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

  private getEstimatedPrize(lotteryId: string): string {
    // In real implementation, fetch from API
    const estimates: Record<string, string> = {
      megasena: 'R$ 65.000.000',
      lotofacil: 'R$ 1.700.000',
      quina: 'R$ 18.500.000',
      lotomania: 'R$ 2.800.000',
      duplasena: 'R$ 4.200.000',
      supersete: 'R$ 1.900.000',
      milionaria: 'R$ 45.000.000',
      timemania: 'R$ 3.100.000',
    };
    
    return estimates[lotteryId] || 'R$ 1.000.000';
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
        
        switch (params.strategy) {
          case 'hot':
            numbers = await this.generateHotNumbers(params.lotteryId, params.numbersCount, lottery.totalNumbers);
            break;
          case 'cold':
            numbers = await this.generateColdNumbers(params.lotteryId, params.numbersCount, lottery.totalNumbers);
            break;
          case 'ai':
            numbers = await this.generateAiNumbers(params.lotteryId, params.numbersCount, lottery.totalNumbers);
            break;
          default: // mixed
            numbers = await this.generateMixedNumbers(params.lotteryId, params.numbersCount, lottery.totalNumbers);
            break;
        }

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

  private async generateHotNumbers(lotteryId: string, count: number, maxNumber: number): Promise<number[]> {
    const frequencies = await storage.getNumberFrequencies(lotteryId);
    const hotNumbers = frequencies
      .filter(f => f.temperature === 'hot')
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .map(f => f.number);

    const numbers: number[] = [];
    
    // Use hot numbers first
    const hotToUse = Math.min(count, hotNumbers.length);
    numbers.push(...hotNumbers.slice(0, hotToUse));
    
    // Fill remaining with random numbers
    while (numbers.length < count) {
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers;
  }

  private async generateColdNumbers(lotteryId: string, count: number, maxNumber: number): Promise<number[]> {
    const frequencies = await storage.getNumberFrequencies(lotteryId);
    const coldNumbers = frequencies
      .filter(f => f.temperature === 'cold')
      .sort((a, b) => (a.frequency || 0) - (b.frequency || 0))
      .map(f => f.number);

    const numbers: number[] = [];
    
    // Use cold numbers first
    const coldToUse = Math.min(count, coldNumbers.length);
    numbers.push(...coldNumbers.slice(0, coldToUse));
    
    // Fill remaining with random numbers
    while (numbers.length < count) {
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers;
  }

  private async generateMixedNumbers(lotteryId: string, count: number, maxNumber: number): Promise<number[]> {
    const frequencies = await storage.getNumberFrequencies(lotteryId);
    const hotNumbers = frequencies.filter(f => f.temperature === 'hot').map(f => f.number);
    const warmNumbers = frequencies.filter(f => f.temperature === 'warm').map(f => f.number);
    const coldNumbers = frequencies.filter(f => f.temperature === 'cold').map(f => f.number);

    const numbers: number[] = [];
    
    // Distribution: 40% hot, 30% warm, 30% cold
    const hotCount = Math.floor(count * 0.4);
    const warmCount = Math.floor(count * 0.3);
    const coldCount = count - hotCount - warmCount;
    
    // Add hot numbers
    for (let i = 0; i < hotCount && i < hotNumbers.length; i++) {
      numbers.push(hotNumbers[Math.floor(Math.random() * hotNumbers.length)]);
    }
    
    // Add warm numbers
    for (let i = 0; i < warmCount && i < warmNumbers.length; i++) {
      const warmNum = warmNumbers[Math.floor(Math.random() * warmNumbers.length)];
      if (!numbers.includes(warmNum)) {
        numbers.push(warmNum);
      }
    }
    
    // Add cold numbers
    for (let i = 0; i < coldCount && i < coldNumbers.length; i++) {
      const coldNum = coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
      if (!numbers.includes(coldNum)) {
        numbers.push(coldNum);
      }
    }
    
    // Fill remaining with random numbers
    while (numbers.length < count) {
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers;
  }

  private async generateAiNumbers(lotteryId: string, count: number, maxNumber: number): Promise<number[]> {
    try {
      const aiRecommendation = await aiService.generateNumberRecommendations(lotteryId, count);
      return aiRecommendation.numbers;
    } catch (error) {
      console.error('AI generation failed, falling back to mixed strategy:', error);
      return this.generateMixedNumbers(lotteryId, count, maxNumber);
    }
  }

  async updateNumberFrequencies(lotteryId: string): Promise<void> {
    try {
      const recentDraws = await storage.getLatestDraws(lotteryId, 20);
      const lottery = await storage.getLotteryType(lotteryId);
      
      if (!lottery) return;

      // Calculate frequencies
      const frequencyMap = new Map<number, number>();
      const lastDrawnMap = new Map<number, Date>();
      
      for (const draw of recentDraws) {
        if (draw.drawnNumbers) {
          for (const number of draw.drawnNumbers) {
            frequencyMap.set(number, (frequencyMap.get(number) || 0) + 1);
            if (!lastDrawnMap.has(number) || draw.drawDate > lastDrawnMap.get(number)!) {
              lastDrawnMap.set(number, draw.drawDate);
            }
          }
        }
      }

      // Calculate temperatures based on frequency distribution
      const frequencies = Array.from(frequencyMap.values()).sort((a, b) => b - a);
      const hotThreshold = frequencies[Math.floor(frequencies.length * 0.3)] || 0;
      const coldThreshold = frequencies[Math.floor(frequencies.length * 0.7)] || 0;

      // Update database
      for (let number = 1; number <= lottery.totalNumbers; number++) {
        const frequency = frequencyMap.get(number) || 0;
        const lastDrawn = lastDrawnMap.get(number);
        
        let temperature: string;
        if (frequency >= hotThreshold) {
          temperature = 'hot';
        } else if (frequency <= coldThreshold) {
          temperature = 'cold';
        } else {
          temperature = 'warm';
        }

        await storage.updateNumberFrequency({
          lotteryId,
          number,
          frequency,
          lastDrawn,
          temperature,
        });
      }
    } catch (error) {
      console.error('Error updating number frequencies:', error);
      throw error;
    }
  }

  async syncLatestDraws(): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Fetch latest draw data from Loterias Caixa API
      // 2. Parse the response
      // 3. Update the database with new draws
      // 4. Update number frequencies
      // 5. Trigger AI analysis for new patterns
      
      console.log('Syncing latest draws from Loterias Caixa API...');
      
      // For demonstration, we'll skip the actual API call
      // In production, you would use something like:
      // const response = await fetch(`${this.API_BASE}/resultados`);
      // const data = await response.json();
      // Process and store the data
      
      const lotteries = await storage.getLotteryTypes();
      for (const lottery of lotteries) {
        await this.updateNumberFrequencies(lottery.id);
      }
      
      console.log('Draw synchronization completed');
    } catch (error) {
      console.error('Error syncing latest draws:', error);
      throw error;
    }
  }
}

export const lotteryService = new LotteryService();
