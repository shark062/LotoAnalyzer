import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { lotteryService } from "./services/lotteryService";
import { aiService } from "./services/aiService";
import { insertUserGameSchema, insertLotteryDrawSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize lottery types if needed
  await lotteryService.initializeLotteryTypes();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Lottery data routes
  app.get('/api/lotteries', async (req, res) => {
    try {
      const lotteries = await storage.getLotteryTypes();
      res.json(lotteries);
    } catch (error) {
      console.error("Error fetching lotteries:", error);
      res.status(500).json({ message: "Failed to fetch lotteries" });
    }
  });

  app.get('/api/lotteries/:id/draws', async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const draws = await storage.getLatestDraws(id, limit);
      res.json(draws);
    } catch (error) {
      console.error("Error fetching draws:", error);
      res.status(500).json({ message: "Failed to fetch draws" });
    }
  });

  app.get('/api/lotteries/:id/next-draw', async (req, res) => {
    try {
      const { id } = req.params;
      const nextDraw = await lotteryService.getNextDrawInfo(id);
      res.json(nextDraw);
    } catch (error) {
      console.error("Error fetching next draw:", error);
      res.status(500).json({ message: "Failed to fetch next draw" });
    }
  });

  // Number frequency and heat map routes
  app.get('/api/lotteries/:id/frequency', async (req, res) => {
    try {
      const { id } = req.params;
      const frequencies = await storage.getNumberFrequencies(id);
      res.json(frequencies);
    } catch (error) {
      console.error("Error fetching frequencies:", error);
      res.status(500).json({ message: "Failed to fetch number frequencies" });
    }
  });

  app.post('/api/lotteries/:id/update-frequency', async (req, res) => {
    try {
      const { id } = req.params;
      await lotteryService.updateNumberFrequencies(id);
      res.json({ message: "Frequencies updated successfully" });
    } catch (error) {
      console.error("Error updating frequencies:", error);
      res.status(500).json({ message: "Failed to update frequencies" });
    }
  });

  // Game generation routes
  app.post('/api/games/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lotteryId, numbersCount, gamesCount, strategy } = req.body;
      
      const generatedGames = await lotteryService.generateGames({
        lotteryId,
        numbersCount: parseInt(numbersCount),
        gamesCount: parseInt(gamesCount),
        strategy: strategy || 'mixed',
        userId,
      });

      res.json(generatedGames);
    } catch (error) {
      console.error("Error generating games:", error);
      res.status(500).json({ message: "Failed to generate games" });
    }
  });

  // User games routes
  app.get('/api/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const games = await storage.getUserGames(userId, limit);
      res.json(games);
    } catch (error) {
      console.error("Error fetching user games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post('/api/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const gameData = insertUserGameSchema.parse({ ...req.body, userId });
      const game = await storage.createUserGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // AI analysis routes
  app.get('/api/ai/analysis/:lotteryId', async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const { type } = req.query;
      const analysis = await storage.getLatestAiAnalysis(lotteryId, type as string || 'prediction');
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      res.status(500).json({ message: "Failed to fetch AI analysis" });
    }
  });

  app.post('/api/ai/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const { lotteryId, analysisType } = req.body;
      const analysis = await aiService.performAnalysis(lotteryId, analysisType);
      res.json(analysis);
    } catch (error) {
      console.error("Error performing AI analysis:", error);
      res.status(500).json({ message: "Failed to perform AI analysis" });
    }
  });

  // User statistics routes
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Data synchronization routes
  app.post('/api/sync/latest-draws', async (req, res) => {
    try {
      await lotteryService.syncLatestDraws();
      res.json({ message: "Latest draws synchronized successfully" });
    } catch (error) {
      console.error("Error syncing latest draws:", error);
      res.status(500).json({ message: "Failed to sync latest draws" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'subscribe_lottery':
            // Handle lottery data subscription
            ws.send(JSON.stringify({
              type: 'lottery_update',
              lotteryId: data.lotteryId,
              data: await storage.getLatestDraws(data.lotteryId, 1),
            }));
            break;
            
          case 'heartbeat':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'heartbeat_response' }));
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Periodic data updates
  setInterval(async () => {
    try {
      await lotteryService.syncLatestDraws();
      
      // Broadcast updates to connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'data_update',
            timestamp: new Date().toISOString(),
          }));
        }
      });
    } catch (error) {
      console.error('Periodic update error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  return httpServer;
}
