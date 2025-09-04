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
      if (existingLotteries.length >= 10) {
        console.log(`✓ Lottery types already initialized (${existingLotteries.length} types found)`);
        return;
      }
      
      console.log(`🔧 Initializing lottery types... (found ${existingLotteries.length}, need 10)`);

      // Complete list of all official Brazilian lottery types
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

      // Insert lottery types into the database
      for (const lottery of defaultLotteries) {
        try {
          await storage.insertLotteryType(lottery);
          console.log(`✓ Inserted lottery type: ${lottery.displayName}`);
        } catch (error) {
          console.log(`Lottery type ${lottery.id} may already exist`);
        }
      }
      
      console.log('All lottery types initialized successfully');
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
        'timemania': 'timemania',
        'diadesore': 'diadesore',
        'loteca': 'loteca'
      };
      
      const officialId = lotteryMapping[lotteryId];
      if (!officialId) return null;

      // Fetch latest contest data from Loterias Caixa API
      const response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${officialId}/`);
      
      if (!response.ok) {
        console.log(`Failed to fetch ${lotteryId} data from official API`);
        return null;
      }

      const data = await response.json();
      
      if (data && data.numero) {
        // Calculate next draw date based on draw days
        const lottery = await storage.getLotteryType(lotteryId);
        const nextDrawDate = lottery ? this.calculateNextDrawDate(lottery.drawDays || [], lottery.drawTime || '20:00') : new Date();
        const now = new Date();
        const timeDiff = nextDrawDate.getTime() - now.getTime();
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        // Store the latest draw in database for analysis
        const drawData = {
          lotteryId,
          contestNumber: data.numero,
          drawDate: new Date(data.dataApuracao || data.dataProximoConcurso),
          drawnNumbers: data.listaDezenas || data.dezenas || [],
          prizes: data.listaRateioPremio || []
        };

        try {
          await storage.createLotteryDraw(drawData);
        } catch (dbError) {
          console.log('Could not save draw data to database:', dbError);
        }

        return {
          contestNumber: data.numero + 1,
          drawDate: nextDrawDate.toISOString(),
          timeRemaining: { days: Math.max(0, days), hours: Math.max(0, hours), minutes: Math.max(0, minutes) },
          estimatedPrize: data.valorEstimadoProximoConcurso ? 
            `R$ ${parseFloat(data.valorEstimadoProximoConcurso).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
            this.getEstimatedPrize(lotteryId)
        };
      }

      return null;
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
      'timemania': 'R$ 2.000.000,00',
      'diadesore': 'R$ 500.000,00',
      'loteca': 'R$ 500.000,00'
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
      console.log('Syncing latest draws from official Caixa API...');
      
      const lotteries = await storage.getLotteryTypes();
      
      for (const lottery of lotteries) {
        try {
          const realData = await this.fetchRealLotteryData(lottery.id);
          if (realData) {
            console.log(`✓ Synced ${lottery.displayName} - Contest #${realData.contestNumber - 1}`);
          }
          
          // Small delay to avoid API rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error syncing ${lottery.id}:`, error);
        }
      }
      
      console.log('Sync completed');
    } catch (error) {
      console.error('Error syncing latest draws:', error);
    }
  }

  async updateNumberFrequencies(lotteryId: string): Promise<void> {
    try {
      console.log(`Updating frequencies for ${lotteryId} based on real data...`);
      
      // Get latest draws from database
      const draws = await storage.getLatestDraws(lotteryId, 100); // Last 100 draws for good frequency analysis
      
      if (draws.length > 0) {
        const lottery = await storage.getLotteryType(lotteryId);
        if (!lottery) return;

        // Calculate frequencies from real draw data
        const frequencies: { [key: number]: number } = {};
        
        // Initialize all numbers with 0 frequency
        for (let i = 1; i <= lottery.totalNumbers; i++) {
          frequencies[i] = 0;
        }
        
        // Count frequencies from actual draws
        draws.forEach(draw => {
          if (draw.drawnNumbers && draw.drawnNumbers.length > 0) {
            draw.drawnNumbers.forEach(num => {
              if (typeof num === 'number' && num >= 1 && num <= lottery.totalNumbers) {
                frequencies[num]++;
              }
            });
          }
        });

        // Store updated frequencies
        const totalDraws = draws.length;
        for (const [number, count] of Object.entries(frequencies)) {
          const frequency = totalDraws > 0 ? (count / totalDraws) : 0;
          
          try {
            await storage.updateNumberFrequency({
              lotteryId,
              number: parseInt(number),
              frequency,
              lastDrawn: this.findLastDrawnDate(parseInt(number), draws),
              drawsSinceLastSeen: this.countDrawsSinceLastSeen(parseInt(number), draws)
            });
          } catch (dbError) {
            // Continue with next number if database error
            continue;
          }
        }
        
        console.log(`✓ Updated frequencies for ${lotteryId} based on ${totalDraws} real draws`);
      } else {
        console.log(`No draw data available for ${lotteryId} frequency calculation`);
      }
    } catch (error) {
      console.error('Error updating frequencies:', error);
    }
  }

  private findLastDrawnDate(number: number, draws: any[]): Date | null {
    for (const draw of draws) {
      if (draw.drawnNumbers && draw.drawnNumbers.includes(number)) {
        return new Date(draw.drawDate);
      }
    }
    return null;
  }

  private countDrawsSinceLastSeen(number: number, draws: any[]): number {
    let count = 0;
    for (const draw of draws) {
      if (draw.drawnNumbers && draw.drawnNumbers.includes(number)) {
        return count;
      }
      count++;
    }
    return count;
  }
}


export const lotteryService = new LotteryService();
