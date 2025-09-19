import { storage } from "../storage";
import { aiService } from "./aiService";
import type { LotteryType, InsertLotteryDraw, InsertUserGame, NextDrawInfo } from "@shared/schema";

interface GenerateGamesParams {
  lotteryId: string;
  numbersCount: number;
  gamesCount: number;
  strategy: 'hot' | 'cold' | 'mixed' | 'ai';
  userId: string;
}


class LotteryService {
  private readonly API_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';
  private readonly LOTERIAS_CAIXA_API = 'https://api.loterias.caixa.gov.br';

  async initializeLotteryTypes(): Promise<void> {
    try {
      // Always try to initialize to ensure all types exist
      console.log('🔧 Ensuring all lottery types are properly initialized...');

      // Complete list of all official Brazilian lottery types
      // Official draw schedules from Caixa Econômica Federal
      const defaultLotteries = [
        {
          id: 'megasena',
          name: 'megasena',
          displayName: 'Mega-Sena',
          minNumbers: 6,
          maxNumbers: 15,
          totalNumbers: 60,
          drawDays: ['Wednesday', 'Saturday'], // Quartas e Sábados
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
          drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Segunda a Sábado
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
          drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Segunda a Sábado
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
          drawDays: ['Tuesday', 'Friday'], // Terças e Sextas
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
          drawDays: ['Tuesday', 'Thursday', 'Saturday'], // Terças, Quintas e Sábados
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
          drawDays: ['Monday', 'Wednesday', 'Friday'], // Segundas, Quartas e Sextas
          drawTime: '20:00',
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
          drawDays: ['Wednesday', 'Saturday'], // Quartas e Sábados
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
          drawDays: ['Tuesday', 'Thursday', 'Saturday'], // Terças, Quintas e Sábados
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
          drawDays: ['Tuesday', 'Thursday', 'Saturday'], // Terças, Quintas e Sábados
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
          drawDays: ['Saturday'], // Sábados
          drawTime: '20:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Insert lottery types into the database with retry logic
      for (const lottery of defaultLotteries) {
        let retries = 3;
        while (retries > 0) {
          try {
            await storage.insertLotteryType(lottery);
            console.log(`✓ Inserted lottery type: ${lottery.displayName}`);
            break;
          } catch (error) {
            retries--;
            if (retries === 0) {
              console.log(`Failed to insert lottery type ${lottery.id} after retries`);
            } else {
              console.log(`Retry ${4 - retries} for lottery type ${lottery.id}`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            }
          }
        }
      }

      // Verify initialization
      const finalCheck = await storage.getLotteryTypes();
      console.log(`✓ Lottery initialization complete. Found ${finalCheck.length} types.`);
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
      const nextDrawDate = this.calculateNextDrawDate(lottery.drawDays, lottery.drawTime || '20:00'); // Use lottery-specific time
      const timeDiff = nextDrawDate.getTime() - now.getTime();

      // Ensure time difference is never negative
      const positiveTimeDiff = Math.max(0, timeDiff);

      const days = Math.floor(positiveTimeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((positiveTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((positiveTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((positiveTimeDiff % (1000 * 60)) / 1000);

      // Estimate contest number and prize (in real app, fetch from API)
      const latestDraws = await storage.getLatestDraws(lotteryId, 1);
      const nextContestNumber = latestDraws.length > 0 ? latestDraws[0].contestNumber + 1 : 1;
      return {
        contestNumber: nextContestNumber,
        drawDate: nextDrawDate.toISOString(),
        drawTime: lottery.drawTime || '20:00',
        timeRemaining: { 
          days: Math.max(0, days), 
          hours: Math.max(0, hours), 
          minutes: Math.max(0, minutes), 
          seconds: Math.max(0, seconds) 
        },
        estimatedPrize: this.getEstimatedPrize(lotteryId),
      };
    } catch (error) {
      console.error('Error getting next draw info:', error);
      return null;
    }
  }

  private calculateNextDrawDate(drawDays: string[], drawTime: string): Date {
    // Always use Brasília timezone (UTC-3)
    const now = new Date();
    const brasiliaOffset = -3 * 60; // UTC-3 in minutes
    const localOffset = now.getTimezoneOffset();
    const brasiliaTime = new Date(now.getTime() + (localOffset - brasiliaOffset) * 60000);

    const today = brasiliaTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Map day names to numbers - support both English and Portuguese
    const dayMap: Record<string, number> = {
      // Portuguese
      'domingo': 0,
      'segunda': 1, 'segunda-feira': 1,
      'terça': 2, 'terca': 2, 'terça-feira': 2, 'terca-feira': 2,
      'quarta': 3, 'quarta-feira': 3,
      'quinta': 4, 'quinta-feira': 4,
      'sexta': 5, 'sexta-feira': 5,
      'sábado': 6, 'sabado': 6,
      // English (for compatibility)
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    // Convert draw days to numbers
    const drawDayNumbers = drawDays.map(day => dayMap[day.toLowerCase()]).filter((d): d is number => d !== undefined);

    if (drawDayNumbers.length === 0) {
      // Default to tomorrow at draw time if no valid draw days
      const [fallbackHour, fallbackMinute] = drawTime.split(':').map(Number);
      const nextDay = new Date(brasiliaTime);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(fallbackHour, fallbackMinute, 0, 0);
      // Convert to UTC for return
      return new Date(nextDay.getTime() - (localOffset - brasiliaOffset) * 60000);
    }

    // Sort draw days
    const sortedDrawDays = [...drawDayNumbers].sort((a, b) => a - b);
    let nextDrawDay: number;
    let daysToAdd = 0;

    // Parse draw time (format: "HH:MM")
    const [drawHour, drawMinute] = drawTime.split(':').map(Number);
    
    // Check if today is a draw day and if we're before draw time Brasília time
    const currentHour = brasiliaTime.getHours();
    const currentMinute = brasiliaTime.getMinutes();
    const isBeforeDrawTime = currentHour < drawHour || (currentHour === drawHour && currentMinute < drawMinute);

    if (sortedDrawDays.includes(today) && isBeforeDrawTime) {
      // Today is a draw day and we're before draw time
      nextDrawDay = today;
      daysToAdd = 0;
    } else {
      // Find next draw day after today
      nextDrawDay = sortedDrawDays.find(day => day > today) ?? sortedDrawDays[0];

      if (nextDrawDay === undefined) {
        // Next draw is next week (first day of next week)
        nextDrawDay = sortedDrawDays[0];
        daysToAdd = (7 - today) + nextDrawDay;
      } else {
        daysToAdd = nextDrawDay - today;
      }
    }

    // Create the next draw date in Brasília timezone
    const nextDraw = new Date(brasiliaTime);
    nextDraw.setDate(brasiliaTime.getDate() + daysToAdd);
    nextDraw.setHours(drawHour, drawMinute, 0, 0); // Use lottery-specific draw time

    // Convert to UTC for return
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

      // Try multiple official endpoints for better reliability
      const apiUrls = [
        `https://servicebus2.caixa.gov.br/portaldeloterias/api/${officialId}/`,
        `https://servicebus2.caixa.gov.br/portaldeloterias/api/${officialId}`,
        `https://api.loterias.caixa.gov.br/${officialId}/latest`
      ];

      let response;
      let data;

      for (const url of apiUrls) {
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (compatible; SharkLoto/1.0)'
            }
          });

          if (response.ok) {
            data = await response.json();
            if (data && data.numero) {
              console.log(`✓ Successfully fetched ${lotteryId} data from ${url}`);
              break;
            }
          }
        } catch (urlError) {
          console.log(`Failed to fetch from ${url}:`, urlError instanceof Error ? urlError.message : String(urlError));
          continue;
        }
      }

      // If no API worked, return null
      if (!data || !data.numero) {
        console.log(`Failed to fetch ${lotteryId} data from official API`);
        return null;
      }

      if (data && data.numero) {
        // Get official draw schedule from Caixa data
        const lottery = await storage.getLotteryType(lotteryId);
        
        // Use official next draw date from API if available
        let nextDrawDate: Date;
        if (data.dataProximoConcurso) {
          // Handle different date formats from API
          let dateStr = data.dataProximoConcurso;
          if (typeof dateStr === 'string') {
            // Convert DD/MM/YYYY to YYYY-MM-DD format for proper parsing
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
            nextDrawDate = new Date(dateStr + 'T20:00:00-03:00'); // Always 20:00 Brasília time
          } else {
            nextDrawDate = new Date(data.dataProximoConcurso);
          }
          
          // Validate the date
          if (isNaN(nextDrawDate.getTime())) {
            console.log(`Invalid date format for ${lotteryId}, using calculated date`);
            nextDrawDate = lottery ? this.calculateNextDrawDate(lottery.drawDays || [], lottery.drawTime || '20:00') : new Date();
          } else {
            console.log(`✓ Using official next draw date for ${lotteryId}: ${nextDrawDate.toISOString()}`);
          }
        } else {
          // Fallback to calculated date
          nextDrawDate = lottery ? this.calculateNextDrawDate(lottery.drawDays || [], '20:00') : new Date();
        }

        // Calculate real-time countdown in Brasília timezone
        const now = new Date();
        const brasiliaOffset = -3 * 60; // UTC-3 in minutes
        const localOffset = now.getTimezoneOffset();
        const brasiliaTime = new Date(now.getTime() + (localOffset - brasiliaOffset) * 60000);
        
        // Ensure nextDrawDate is in UTC for proper calculation
        const nextDrawUTC = new Date(nextDrawDate.getTime());
        const timeDiff = nextDrawUTC.getTime() - now.getTime();

        // Ensure positive time difference
        const positiveTimeDiff = Math.max(0, timeDiff);

        const days = Math.floor(positiveTimeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((positiveTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((positiveTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((positiveTimeDiff % (1000 * 60)) / 1000);

        // Store the latest draw in database for analysis (with proper date validation)
        let validDrawDate = new Date();
        if (data.dataApuracao) {
          let dateStr = data.dataApuracao;
          if (typeof dateStr === 'string' && dateStr.includes('/')) {
            // Convert DD/MM/YYYY to YYYY-MM-DD format
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }
          const testDate = new Date(dateStr);
          if (!isNaN(testDate.getTime())) {
            validDrawDate = testDate;
          }
        } else if (data.dataProximoConcurso) {
          let dateStr = data.dataProximoConcurso;
          if (typeof dateStr === 'string' && dateStr.includes('/')) {
            // Convert DD/MM/YYYY to YYYY-MM-DD format
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }
          const testDate = new Date(dateStr);
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

        // Format prize value properly with real-time data from official API
        let formattedPrize = this.getEstimatedPrize(lotteryId);
        
        // Try multiple prize fields from the API response
        const prizeFields = [
          'valorEstimadoProximoConcurso',
          'valorAcumuladoProximoConcurso', 
          'valorAcumuladoConcurso',
          'valorEstimado',
          'proximoConcurso'
        ];

        for (const field of prizeFields) {
          if (data[field]) {
            let prizeValue;
            if (typeof data[field] === 'number') {
              prizeValue = data[field];
            } else if (typeof data[field] === 'string') {
              prizeValue = parseFloat(data[field].toString().replace(/[^\d.,]/g, '').replace(',', '.'));
            }
            
            if (!isNaN(prizeValue) && prizeValue > 0) {
              formattedPrize = `R$ ${prizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              console.log(`✓ Updated ${lotteryId} prize from API: ${formattedPrize}`);
              break;
            }
          }
        }

        // Use official contest number from API
        const nextContestNumber = data.proximoConcurso || (data.numero + 1);

        return {
          contestNumber: nextContestNumber,
          drawDate: nextDrawDate.toISOString(),
          drawTime: lottery?.drawTime || '20:00',
          timeRemaining: { 
            days: Math.max(0, days), 
            hours: Math.max(0, hours), 
            minutes: Math.max(0, minutes), 
            seconds: Math.max(0, seconds) 
          },
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
    // Updated realistic prize estimates based on current official data
    const prizesMap: Record<string, string> = {
      'megasena': 'R$ 70.000.000,00',
      'lotofacil': 'R$ 1.700.000,00',
      'quina': 'R$ 1.300.000,00',
      'lotomania': 'R$ 4.000.000,00',
      'duplasena': 'R$ 1.200.000,00',
      'supersete': 'R$ 4.500.000,00',
      'milionaria': 'R$ 25.000.000,00',
      'timemania': 'R$ 3.200.000,00',
      'diadesore': 'R$ 1.800.000,00',
      'loteca': 'R$ 900.000,00'
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
        console.log(`No frequency data for ${lotteryId}, using random generation with exact count: ${count}`);
        return this.generateRandomNumbers(count, maxNumber);
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
          const hotCount = Math.max(1, Math.floor(count * 0.4));
          const warmCount = Math.max(1, Math.floor(count * 0.3));
          const coldCount = Math.max(1, count - hotCount - warmCount);

          pool = [
            ...hotNumbers.slice(0, hotCount),
            ...warmNumbers.slice(0, warmCount),
            ...coldNumbers.slice(0, coldCount)
          ];
          break;
        default:
          pool = Array.from({ length: maxNumber }, (_, i) => i + 1);
      }

      // Ensure pool has enough numbers
      if (pool.length < count) {
        const remaining = Array.from({ length: maxNumber }, (_, i) => i + 1)
          .filter(n => !pool.includes(n));
        pool = [...pool, ...remaining];
      }

      // Shuffle the pool for randomness
      pool = pool.sort(() => Math.random() - 0.5);

      // Select exactly the requested count
      while (numbers.length < count && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        numbers.push(pool.splice(randomIndex, 1)[0]);
      }

      // Ensure we have exactly the requested count
      if (numbers.length < count) {
        console.log(`Warning: Could only generate ${numbers.length} numbers instead of ${count} for ${lotteryId}`);
      }

      return numbers.slice(0, count).sort((a, b) => a - b);
    } catch (error) {
      console.error('Error generating strategy numbers:', error);
      console.log('Falling back to random number generation');
      return this.generateRandomNumbers(count, maxNumber);
    }
  }

  private generateRandomNumbers(count: number, maxNumber: number): number[] {
    const numbers: number[] = [];
    const pool = Array.from({ length: maxNumber }, (_, i) => i + 1);

    // Generate exactly the requested count of numbers
    while (numbers.length < count && pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      numbers.push(pool.splice(randomIndex, 1)[0]);
    }

    console.log(`Generated ${numbers.length} random numbers (requested: ${count}, max: ${maxNumber})`);
    return numbers.sort((a, b) => a - b);
  }

  private async generateAINumbers(lotteryId: string, count: number, maxNumber: number): Promise<number[]> {
    try {
      const frequencies = await storage.getNumberFrequencies(lotteryId);
      const latestDraws = await storage.getLatestDraws(lotteryId, 20);

      if (frequencies.length === 0 || latestDraws.length === 0) {
        console.log('Insufficient data for AI, falling back to random generation');
        return this.generateRandomNumbers(count, maxNumber);
      }

      // AI logic: analyze patterns, frequencies, and recent trends
      const recentNumbers = new Set<number>();
      latestDraws.slice(0, 5).forEach(draw => {
        draw.drawnNumbers.forEach(num => recentNumbers.add(num));
      });

      // Get all available candidates (avoid recently drawn numbers when possible)
      const preferredCandidates = frequencies
        .filter(f => !recentNumbers.has(f.number))
        .sort((a, b) => b.frequency - a.frequency);

      // If not enough preferred candidates, include all numbers
      const allCandidates = frequencies.sort((a, b) => b.frequency - a.frequency);

      const numbers: number[] = [];
      
      // First, try to select from preferred candidates (non-recent)
      const candidatePool = preferredCandidates.length >= count ? preferredCandidates : allCandidates;
      
      // Select exactly the requested count
      while (numbers.length < count && candidatePool.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidatePool.length);
        numbers.push(candidatePool.splice(randomIndex, 1)[0].number);
      }

      // If still need more numbers, fill with remaining numbers from the total range
      if (numbers.length < count) {
        const remaining = Array.from({ length: maxNumber }, (_, i) => i + 1)
          .filter(n => !numbers.includes(n));

        while (numbers.length < count && remaining.length > 0) {
          const randomIndex = Math.floor(Math.random() * remaining.length);
          numbers.push(remaining.splice(randomIndex, 1)[0]);
        }
      }

      console.log(`Generated ${numbers.length} AI numbers (requested: ${count}, max: ${maxNumber})`);
      return numbers.sort((a, b) => a - b);
    } catch (error) {
      console.error('Error generating AI numbers:', error);
      console.log('Falling back to random number generation');
      return this.generateRandomNumbers(count, maxNumber);
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

      // Get lottery type info
      const lottery = await storage.getLotteryType(lotteryId);
      if (!lottery) return;

      // Get latest draws from database
      const draws = await storage.getLatestDraws(lotteryId, 100); // Last 100 draws for good frequency analysis

      // Initialize all numbers with 0 frequency if no draws exist
      if (draws.length === 0) {
        console.log(`No draws found for ${lotteryId}, initializing with zero frequencies...`);
        for (let i = 1; i <= lottery.totalNumbers; i++) {
          try {
            await storage.updateNumberFrequency({
              lotteryId,
              number: i,
              frequency: 0,
              lastDrawn: null,
              drawsSinceLastSeen: 0
            });
          } catch (dbError) {
            continue;
          }
        }
        return;
      }

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
          const frequency = count; // Use raw count instead of percentage

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