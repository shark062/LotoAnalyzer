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
    seconds: number;
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

      const seconds = Math.floor((nextDrawDate.getTime() - now.getTime()) % (1000 * 60) / 1000);
      return {
        contestNumber: nextContestNumber,
        drawDate: nextDrawDate.toISOString(),
        timeRemaining: { days, hours, minutes, seconds },
        estimatedPrize: this.getEstimatedPrize(lotteryId),
      };
    } catch (error) {
      console.error('Error getting next draw info:', error);
      return null;
    }
  }

  private calculateNextDrawDate(drawDays: string[], drawTime: string): Date {
    // Create date in Brasília timezone (UTC-3)
    const now = new Date();
    const brasiliaOffset = -3 * 60; // UTC-3 in minutes
    const localOffset = now.getTimezoneOffset();
    const brasiliaTime = new Date(now.getTime() + (localOffset - brasiliaOffset) * 60000);

    const today = brasiliaTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Map day names to numbers (Portuguese)
    const dayMap: Record<string, number> = {
      'domingo': 0,
      'segunda': 1, 'segunda-feira': 1,
      'terça': 2, 'terca': 2, 'terça-feira': 2, 'terca-feira': 2,
      'quarta': 3, 'quarta-feira': 3,
      'quinta': 4, 'quinta-feira': 4,
      'sexta': 5, 'sexta-feira': 5,
      'sábado': 6, 'sabado': 6
    };

    // Convert draw days to numbers
    const drawDayNumbers = drawDays.map(day => dayMap[day.toLowerCase()]).filter(d => d !== undefined);

    if (drawDayNumbers.length === 0) {
      // Default to tomorrow at 20:00 if no valid draw days
      const nextDay = new Date(brasiliaTime);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(20, 0, 0, 0);
      return nextDay;
    }

    // Sort draw days to find the next one
    const sortedDrawDays = [...drawDayNumbers].sort((a, b) => a - b);
    let nextDrawDay: number | undefined;
    let daysToAdd = 0;

    // Check if today is a draw day and if we're before 20:00
    const currentHour = brasiliaTime.getHours();
    const currentMinute = brasiliaTime.getMinutes();
    const isBeforeDrawTime = currentHour < 20 || (currentHour === 20 && currentMinute === 0);

    if (sortedDrawDays.includes(today) && isBeforeDrawTime) {
      // Today is a draw day and we're before 20:00
      nextDrawDay = today;
      daysToAdd = 0;
    } else {
      // Find next draw day after today
      nextDrawDay = sortedDrawDays.find(day => day > today);

      if (nextDrawDay === undefined) {
        // Next draw is next week (first day of next week)
        nextDrawDay = sortedDrawDays[0];
        daysToAdd = (7 - today) + nextDrawDay;
      } else {
        daysToAdd = nextDrawDay - today;
      }
    }

    // Create the next draw date
    const nextDraw = new Date(brasiliaTime);
    nextDraw.setDate(brasiliaTime.getDate() + daysToAdd);
    nextDraw.setHours(20, 0, 0, 0); // Always 20:00 Brasília time

    // Convert back to UTC for storage
    const utcNextDraw = new Date(nextDraw.getTime() - (localOffset - brasiliaOffset) * 60000);

    return utcNextDraw;
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
        'milionaria': 'maismilionaria',
        'timemania': 'timemania',
        'diadesore': 'diadesorte',
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
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        // Store the latest draw in database for analysis (with proper date validation)
        let validDrawDate = new Date();
        if (data.dataApuracao) {
          const testDate = new Date(data.dataApuracao);
          if (!isNaN(testDate.getTime())) {
            validDrawDate = testDate;
          }
        } else if (data.dataProximoConcurso) {
          const testDate = new Date(data.dataProximoConcurso);
          if (!isNaN(testDate.getTime())) {
            validDrawDate = testDate;
          }
        }

        const drawData = {
          lotteryId,
          contestNumber: data.numero,
          drawDate: validDrawDate,
          drawnNumbers: data.listaDezenas || data.dezenas || [],
          prizes: data.listaRateioPremio || []
        };

        try {
          await storage.createLotteryDraw(drawData);
        } catch (dbError) {
          console.log('Could not save draw data to database:', dbError);
        }

        // Format prize value properly
        let formattedPrize = this.getEstimatedPrize(lotteryId);
        if (data.valorEstimadoProximoConcurso) {
          const prizeValue = parseFloat(data.valorEstimadoProximoConcurso);
          if (!isNaN(prizeValue)) {
            formattedPrize = `R$ ${prizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        } else if (data.valorAcumuladoProximoConcurso) {
          const prizeValue = parseFloat(data.valorAcumuladoProximoConcurso);
          if (!isNaN(prizeValue)) {
            formattedPrize = `R$ ${prizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        }

        return {
          contestNumber: data.numero + 1,
          drawDate: nextDrawDate.toISOString(),
          timeRemaining: { days: Math.max(0, days), hours: Math.max(0, hours), minutes: Math.max(0, minutes), seconds: Math.max(0, seconds) },
          estimatedPrize: formattedPrize
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching real data for ${lotteryId}:`, error);
      return null;
    }
  }

  private getEstimatedPrize(lotteryId: string): string {
    // Updated realistic prize estimates
    const prizesMap: Record<string, string> = {
      'megasena': 'R$ 65.000.000,00',
      'lotofacil': 'R$ 1.700.000,00',
      'quina': 'R$ 1.200.000,00',
      'lotomania': 'R$ 3.500.000,00',
      'duplasena': 'R$ 900.000,00',
      'supersete': 'R$ 4.200.000,00',
      'milionaria': 'R$ 22.000.000,00',
      'timemania': 'R$ 2.800.000,00',
      'diadesore': 'R$ 1.500.000,00',
      'loteca': 'R$ 800.000,00'
    };
    return prizesMap[lotteryId] || 'R$ 1.000.000,00';
  }

  async generateGames(params: GenerateGamesParams): Promise<InsertUserGame[]> {
    try {
      const lottery = await storage.getLotteryType(params.lotteryId);
      if (!lottery) {
        throw new Error('Lottery type not found');
      }

      const nextDraw = await this.getNextDrawInfo(params.lotteryId);
      if (!nextDraw) {
        throw new Error('Unable to get next draw information');
      }

      // Ensure we're not generating for already drawn contests
      const latestDraws = await storage.getLatestDraws(params.lotteryId, 1);
      if (latestDraws.length > 0 && nextDraw.contestNumber <= latestDraws[0].contestNumber) {
        throw new Error('Cannot generate games for already drawn contests');
      }

      const games: InsertUserGame[] = [];

      for (let i = 0; i < params.gamesCount; i++) {
        let numbers: number[];

        // Generate numbers based on strategy using real frequency data
        if (params.strategy === 'ai') {
          numbers = await this.generateAINumbers(params.lotteryId, params.numbersCount, lottery.totalNumbers);
        } else {
          numbers = await this.generateStrategyNumbers(params.lotteryId, params.strategy, params.numbersCount, lottery.totalNumbers);
        }

        const game: InsertUserGame = {
          userId: params.userId,
          lotteryId: params.lotteryId,
          selectedNumbers: numbers.sort((a, b) => a - b),
          contestNumber: nextDraw.contestNumber,
          strategy: params.strategy,
          matches: 0, // Will be updated when draw results are available
          prizeWon: "0.00", // Will be updated when draw results are available
        };

        games.push(game);

        // Save to database
        await storage.createUserGame(game);
      }

      return games;
    } catch (error) {
      console.error('Error generating games:', error);
      throw new Error('Failed to generate games: ' + error.message);
    }
  }

  private async generateStrategyNumbers(lotteryId: string, strategy: string, count: number, maxNumber: number): Promise<number[]> {
    try {
      const frequencies = await storage.getNumberFrequencies(lotteryId);

      if (frequencies.length === 0) {
        throw new Error('No frequency data available for strategy-based generation');
      }

      const numbers: number[] = [];
      let pool: number[] = [];

      switch (strategy) {
        case 'hot':
          pool = frequencies.filter(f => f.temperature === 'hot').map(f => f.number);
          break;
        case 'cold':
          pool = frequencies.filter(f => f.temperature === 'cold').map(f => f.number);
          break;
        case 'mixed':
          const hotNumbers = frequencies.filter(f => f.temperature === 'hot').map(f => f.number);
          const warmNumbers = frequencies.filter(f => f.temperature === 'warm').map(f => f.number);
          const coldNumbers = frequencies.filter(f => f.temperature === 'cold').map(f => f.number);

          // Mix: 40% hot, 30% warm, 30% cold
          const hotCount = Math.floor(count * 0.4);
          const warmCount = Math.floor(count * 0.3);
          const coldCount = count - hotCount - warmCount;

          pool = [
            ...hotNumbers.slice(0, hotCount),
            ...warmNumbers.slice(0, warmCount),
            ...coldNumbers.slice(0, coldCount)
          ];
          break;
        default:
          pool = Array.from({ length: maxNumber }, (_, i) => i + 1);
      }

      if (pool.length < count) {
        // Fill remaining with random numbers if pool is too small
        const remaining = Array.from({ length: maxNumber }, (_, i) => i + 1)
          .filter(n => !pool.includes(n));
        pool = [...pool, ...remaining];
      }

      while (numbers.length < count && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        numbers.push(pool.splice(randomIndex, 1)[0]);
      }

      return numbers;
    } catch (error) {
      console.error('Error generating strategy numbers:', error);
      throw new Error('Failed to generate numbers based on strategy');
    }
  }

  private async generateAINumbers(lotteryId: string, count: number, maxNumber: number): Promise<number[]> {
    try {
      const frequencies = await storage.getNumberFrequencies(lotteryId);
      const latestDraws = await storage.getLatestDraws(lotteryId, 20);

      if (frequencies.length === 0 || latestDraws.length === 0) {
        throw new Error('Insufficient data for AI number generation');
      }

      // AI logic: analyze patterns, frequencies, and recent trends
      const recentNumbers = new Set<number>();
      latestDraws.slice(0, 5).forEach(draw => {
        draw.drawnNumbers.forEach(num => recentNumbers.add(num));
      });

      // Avoid recently drawn numbers and focus on high-frequency numbers
      const candidates = frequencies
        .filter(f => !recentNumbers.has(f.number))
        .sort((a, b) => b.frequency - a.frequency);

      const numbers: number[] = [];
      for (let i = 0; i < count && i < candidates.length; i++) {
        numbers.push(candidates[i].number);
      }

      // Fill remaining with balanced selection if needed
      if (numbers.length < count) {
        const remaining = Array.from({ length: maxNumber }, (_, i) => i + 1)
          .filter(n => !numbers.includes(n) && !recentNumbers.has(n));

        while (numbers.length < count && remaining.length > 0) {
          const randomIndex = Math.floor(Math.random() * remaining.length);
          numbers.push(remaining.splice(randomIndex, 1)[0]);
        }
      }

      return numbers;
    } catch (error) {
      console.error('Error generating AI numbers:', error);
      throw new Error('Failed to generate AI-based numbers');
    }
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

  private calculatePrize(lotteryId: string, matches: number): string {
    const prizeTable: Record<string, Record<number, string>> = {
      megasena: {
        6: "100000.00",
        5: "2500.00",
        4: "150.00",
      },
      lotofacil: {
        15: "500000.00",
        14: "1500.00",
        13: "200.00",
        12: "75.00",
        11: "25.00",
      },
      quina: {
        5: "50000.00",
        4: "800.00",
        3: "120.00",
        2: "25.00",
      },
      lotomania: {
        20: "1000000.00",
        19: "15000.00",
        18: "2000.00",
        17: "200.00",
        16: "100.00",
        0: "500.00",
      },
    };

    return prizeTable[lotteryId]?.[matches] || "0.00";
  }
}


export const lotteryService = new LotteryService();