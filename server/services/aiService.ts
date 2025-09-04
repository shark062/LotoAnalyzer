import OpenAI from "openai";
import { storage } from "../storage";
import type { InsertAiAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface NumberRecommendation {
  numbers: number[];
  strategy: string;
  confidence: number;
  reasoning: string;
}

interface LotteryPattern {
  pattern: string;
  frequency: number;
  lastOccurrence: string;
  predictedNext: number[];
}

class AiService {
  async performAnalysis(lotteryId: string, analysisType: string): Promise<any> {
    try {
      switch (analysisType) {
        case 'pattern':
          return await this.analyzePatterns(lotteryId);
        case 'prediction':
          return await this.generatePrediction(lotteryId);
        case 'strategy':
          return await this.recommendStrategy(lotteryId);
        default:
          throw new Error('Unknown analysis type');
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw error;
    }
  }

  async analyzePatterns(lotteryId: string): Promise<LotteryPattern[]> {
    try {
      const draws = await storage.getLatestDraws(lotteryId, 50);
      const lottery = await storage.getLotteryType(lotteryId);
      
      if (!lottery || draws.length === 0) {
        throw new Error('Insufficient data for pattern analysis');
      }

      const drawsData = draws
        .filter(draw => draw.drawnNumbers && draw.drawnNumbers.length > 0)
        .map(draw => ({
          numbers: draw.drawnNumbers || [],
          date: draw.drawDate.toISOString(),
          contest: draw.contestNumber,
        }));

      const prompt = `
        Analyze the following lottery draw data for ${lottery.displayName} and identify patterns:
        
        Lottery Info:
        - Name: ${lottery.displayName}
        - Numbers per draw: ${lottery.minNumbers}
        - Total possible numbers: 1-${lottery.totalNumbers}
        
        Recent draws (most recent first):
        ${drawsData.slice(0, 20).map(draw => 
          `Contest ${draw.contest} (${draw.date.split('T')[0]}): ${draw.numbers.join(', ')}`
        ).join('\n')}
        
        Please identify:
        1. Sequential number patterns
        2. Even/odd distribution patterns
        3. High/low number patterns
        4. Consecutive number occurrences
        5. Number gap patterns
        
        Return a JSON response with an array of patterns found, each containing:
        - pattern: description of the pattern
        - frequency: how often this pattern occurs (as percentage)
        - lastOccurrence: date when this pattern last occurred
        - predictedNext: array of numbers that might follow this pattern
        
        Format: { "patterns": [...] }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert lottery pattern analyst. Analyze numerical patterns in lottery draws and provide statistical insights. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"patterns": []}');
      
      // Store analysis in database
      await storage.createAiAnalysis({
        lotteryId,
        analysisType: 'pattern',
        result,
        confidence: "0.75",
      });

      return result.patterns || [];
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      throw new Error('Failed to analyze patterns: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async generatePrediction(lotteryId: string): Promise<any> {
    try {
      const draws = await storage.getLatestDraws(lotteryId, 30);
      const frequencies = await storage.getNumberFrequencies(lotteryId);
      const lottery = await storage.getLotteryType(lotteryId);
      
      if (!lottery || draws.length === 0) {
        throw new Error('Insufficient data for prediction');
      }

      const recentDraws = draws.slice(0, 10).map(draw => draw.drawnNumbers || []).filter(nums => nums.length > 0);
      const frequencyData = frequencies.map(f => ({
        number: f.number,
        frequency: f.frequency,
        temperature: f.temperature,
        lastDrawn: f.lastDrawn?.toISOString() || null,
      }));

      const prompt = `
        Generate lottery number predictions for ${lottery.displayName} based on the following data:
        
        Lottery Details:
        - Numbers to pick: ${lottery.minNumbers}
        - Range: 1-${lottery.totalNumbers}
        
        Recent 10 draws:
        ${recentDraws.map((nums, i) => `Draw ${i + 1}: ${nums.join(', ')}`).join('\n')}
        
        Number frequency data (last 20 draws):
        ${frequencyData.slice(0, 20).map(f => 
          `${f.number}: ${f.frequency} times (${f.temperature})`
        ).join('\n')}
        
        Based on statistical analysis, pattern recognition, and frequency data:
        1. Predict the most likely numbers for the next draw
        2. Provide confidence level (0-1)
        3. Explain the reasoning behind the prediction
        4. Suggest alternative number combinations
        
        Return JSON format:
        {
          "primaryPrediction": [array of numbers],
          "confidence": number,
          "reasoning": "detailed explanation",
          "alternatives": [
            {"numbers": [array], "strategy": "description"},
            ...
          ],
          "riskLevel": "low|medium|high"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an advanced lottery prediction AI with expertise in statistical analysis, pattern recognition, and probability theory. Provide data-driven predictions with clear reasoning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Store prediction in database
      await storage.createAiAnalysis({
        lotteryId,
        analysisType: 'prediction',
        result,
        confidence: result.confidence?.toString() || "0.5",
      });

      return result;
    } catch (error) {
      console.error('Error generating prediction:', error);
      throw new Error('Failed to generate prediction: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async recommendStrategy(lotteryId: string): Promise<any> {
    try {
      const userGames = await storage.getUserGames('current-user', 50); // This would use actual user ID
      const frequencies = await storage.getNumberFrequencies(lotteryId);
      const lottery = await storage.getLotteryType(lotteryId);
      
      if (!lottery) {
        throw new Error('Lottery not found');
      }

      const userPerformance = {
        totalGames: userGames.length,
        wins: userGames.filter(g => parseFloat(g.prizeWon || "0") > 0).length,
        strategies: userGames.reduce((acc, game) => {
          acc[game.strategy || 'unknown'] = (acc[game.strategy || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      const prompt = `
        Recommend optimal playing strategies for ${lottery.displayName} based on:
        
        User Performance History:
        - Total games played: ${userPerformance.totalGames}
        - Wins: ${userPerformance.wins}
        - Win rate: ${userPerformance.totalGames > 0 ? (userPerformance.wins / userPerformance.totalGames * 100).toFixed(1) : 0}%
        - Strategy usage: ${JSON.stringify(userPerformance.strategies)}
        
        Current Number Temperatures:
        - Hot numbers: ${frequencies.filter(f => f.temperature === 'hot').length}
        - Warm numbers: ${frequencies.filter(f => f.temperature === 'warm').length}
        - Cold numbers: ${frequencies.filter(f => f.temperature === 'cold').length}
        
        Provide personalized strategy recommendations:
        1. Best strategy based on current data
        2. Number selection approach
        3. Risk management advice
        4. Frequency of play recommendations
        5. Budget management tips
        
        Return JSON format:
        {
          "recommendedStrategy": "strategy name",
          "reasoning": "why this strategy is best",
          "numberSelection": {
            "hotPercentage": number,
            "warmPercentage": number,
            "coldPercentage": number
          },
          "riskLevel": "conservative|balanced|aggressive",
          "playFrequency": "advice on how often to play",
          "budgetAdvice": "financial management tips",
          "expectedImprovement": "percentage improvement expected"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a lottery strategy advisor with expertise in risk management, statistical analysis, and responsible gambling practices. Provide practical, data-driven advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Store strategy recommendation
      await storage.createAiAnalysis({
        lotteryId,
        analysisType: 'strategy',
        result,
        confidence: "0.8",
      });

      return result;
    } catch (error) {
      console.error('Error recommending strategy:', error);
      throw new Error('Failed to recommend strategy: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async generateNumberRecommendations(lotteryId: string, count: number): Promise<NumberRecommendation> {
    try {
      const frequencies = await storage.getNumberFrequencies(lotteryId);
      const recentDraws = await storage.getLatestDraws(lotteryId, 10);
      const lottery = await storage.getLotteryType(lotteryId);
      
      if (!lottery) {
        throw new Error('Lottery not found');
      }

      const hotNumbers = frequencies.filter(f => f.temperature === 'hot').map(f => f.number);
      const warmNumbers = frequencies.filter(f => f.temperature === 'warm').map(f => f.number);
      const coldNumbers = frequencies.filter(f => f.temperature === 'cold').map(f => f.number);
      
      const recentNumbers = recentDraws
        .flatMap(draw => draw.drawnNumbers || [])
        .filter((value, index, self) => self.indexOf(value) === index);

      const prompt = `
        Generate ${count} optimal lottery numbers for ${lottery.displayName} using AI analysis:
        
        Available numbers: 1-${lottery.totalNumbers}
        Numbers needed: ${count}
        
        Temperature analysis:
        - Hot numbers (frequent): ${hotNumbers.slice(0, 10).join(', ')}
        - Warm numbers (moderate): ${warmNumbers.slice(0, 10).join(', ')}
        - Cold numbers (rare): ${coldNumbers.slice(0, 10).join(', ')}
        
        Recent draws: ${recentNumbers.slice(0, 30).join(', ')}
        
        Apply advanced AI strategies:
        1. Statistical frequency analysis
        2. Pattern recognition
        3. Avoid over-represented recent numbers
        4. Balance temperature distribution
        5. Consider number spacing and distribution
        
        Return JSON with:
        {
          "numbers": [array of ${count} numbers],
          "strategy": "description of strategy used",
          "confidence": number between 0-1,
          "reasoning": "detailed explanation of number selection"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an advanced lottery number generator AI. Use statistical analysis, pattern recognition, and probability theory to generate optimal number combinations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        numbers: result.numbers || [],
        strategy: result.strategy || 'AI-powered mixed strategy',
        confidence: result.confidence || 0.7,
        reasoning: result.reasoning || 'Generated using advanced AI analysis',
      };
    } catch (error) {
      console.error('Error generating AI numbers:', error);
      // Fallback to simple random selection
      const numbers: number[] = [];
      const lottery = await storage.getLotteryType(lotteryId);
      const maxNumber = lottery?.totalNumbers || 60;
      
      while (numbers.length < count) {
        const randomNum = Math.floor(Math.random() * maxNumber) + 1;
        if (!numbers.includes(randomNum)) {
          numbers.push(randomNum);
        }
      }
      
      return {
        numbers: numbers.sort((a, b) => a - b),
        strategy: 'Random fallback',
        confidence: 0.5,
        reasoning: 'AI analysis failed, using random selection',
      };
    }
  }
}

export const aiService = new AiService();
