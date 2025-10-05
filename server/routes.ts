tags. I will also provide a one-line analysis before the final code."},
  {"role": "user", "content": "<<user_message>>\nMelhorias de Análise de Dados\n\n1. Heatmaps de Frequência\n   · Gerar visualizações coloridas (heatmaps) para mostrar a frequência de números por posição (ex: nº 1 no 1º sorteio, nº 2 no 2º, etc.).\n2. Análise de Sequências\n   · Identificar padrões de sequências consecutivas (ex: 14-15-16) que aparecem com frequência.\n3. Estatísticas de Atraso por Posição\n   · Calcular o atraso de números por posição específica no sorteio (ex: último número sorteado na posição 3).\n4. Medidas de Dispersão\n   · Adicionar desvio padrão e variância para analisar a \"dispersão\" dos números sorteados.\n\n---\n\n🎯 Funcionalidades de Usuário\n\n1. Filtros Personalizados\n   · Permitir que o usuário defina filtros customizados (ex: \"mostrar apenas combinações com 3 números pares e 2 ímpares\").\n2. Comparação entre Múltiplas Loterias\n   · Adicionar suporte para comparar estatísticas entre diferentes loterias (ex: Mega Sena vs. Lotofácil).\n3. Exportação de Relatórios\n   · Gerar relatórios em PDF/Excel com os resultados das análises.\n4. Modo \"Simulação\"\n   · Simular apostas baseadas em critérios estatísticos e comparar com resultados reais.\n\n---\n\n⚙️ Otimizações Técnicas\n\n1. Cache de Dados\n   · Implementar cache para resultados de análises frequentes (ex: usando @functools.lru_cache).\n2. Logs Detalhados\n   · Registrar execuções para debug e auditoria (ex: tempo de processamento, parâmetros usados).\n3. Validação de Entrada\n   · Adicionar validação para entradas de usuário (ex: intervalo de números, formato de datas).\n4. Suporte a Mais Fontes de Dados\n   · Integrar com APIs oficiais de loterias para atualização automática de dados.\n\n---\n\n📈 Visualização e Relatórios\n\n1. Gráficos de Tendência Temporal\n   · Plotar a evolução da frequência de números ao longo do tempo.\n2. Dashboard Interativo\n   · Criar um painel com gráficos interativos (ex: usando Plotly ou Streamlit).\n3. Análise de \"Números Quentes/Frios\"\n   · Destacar números com frequência acima/abaixo da média em períodos específicos.\n\n---\n\n🔍 Análises Avançadas\n\n1. Correlação entre Números\n   · Identificar pares ou trios de números que frequentemente são sorteados juntos.\n2. Análise de Distribuição Geográfica\n   · Se houver dados disponíveis, analisar a distribuição de números por região/estado.\n3. Previsão Baseada em ML Simples\n   · Usar modelos simples (ex: ARIMA) para prever tendências (sem alterar a lógica central).\n\n---\n\n🛡️ Segurança e Confiabilidade\n\n1. Tratamento de Erros Robusto\n   · Melhorar mensagens de erro para entradas inválidas ou falhas de conexão.\n2. Backup de Configurações\n   · Permitir salvar/restaurar configurações de análise do usuário.\n\n---\n\n🌐 Extensibilidades Futuras\n\n1. Sistema de Plugins\n   · Criar uma interface para adicionar análises customizadas sem modificar o código principal.\n2. API REST\n   · Expor funcionalidades via API para integração com outros sistemas.\n\n---\n\n✅ Como Implementar Sem Quebrar o Existente\n\n· Adicione novas classes/módulos em vez de modificar os existentes.\n· Use injeção de dependência para funcionalidades opcionais.\n· Mantenha a compatibilidade com o formato de dados atual.\n\nEssas melhorias tornariam o projeto mais robusto e útil sem requerer refatoração do código atual.\n\nHere is the thinking behind the code modification:\n\n<thinking>\nVou implementar as melhorias solicitadas de forma modular e incremental, sem quebrar o código existente. Começarei com as funcionalidades mais impactantes:\n\n## 1. Análise de Correlação entre Números\n\nVou expandir o sistema de correlação existente com análises mais profundas:\n\n\n\n## 2. Novo Serviço de Análise Avançada de Dados\n\n\n\n## 3. Adicionar Endpoints para Novas Análises\n\n\n</thinking>\n\nHere is the original code:\n<original>\nimport type { Express } from \"express\";\nimport { createServer, type Server } from \"http\";\nimport { storage } from \"./storage\";\nimport { setupAuth } from \"./replitAuth\";\nimport { lotteryService } from \"./services/lotteryService\";\nimport { aiService } from \"./services/aiService\";\nimport { lotteryCache } from \"./cache\";\nimport { insertUserGameSchema } from \"@shared/schema\";\nimport * as schema from \"@shared/schema\";\nimport { eq } from \"drizzle-orm\";\nimport { LOTTERY_CONFIGS, getLotteryDisplayInfo, getLotteryConfig } from \"@shared/lotteryConstants\";\nimport { DataValidator, DataFormatter } from \"@shared/dataValidation\";\nimport { advancedAI } from \"./services/advancedAI\";\n\nexport async function registerRoutes(app: Express): Promise<Server> {\n  // Auth middleware\n  await setupAuth(app);\n\n  // Initialize lottery types once at startup\n  try {\n    await lotteryService.initializeLotteryTypes();\n  } catch (error) {\n    console.error(\"Failed to initialize lottery types:\", error);\n  }\n\n  // Health check endpoint\n  app.get('/api/health', (req, res) => {\n    res.json( {\n      status: 'ok',\n      timestamp: new Date().toISOString(),\n      uptime: process.uptime(),\n      environment: process.env.NODE_ENV || 'development'\n    });\n  });\n\n  // Auth routes - Mock user for direct access (no login required)\n  app.get('/api/auth/user', async (req: any, res) => {\n    try {\n      // Return mock user for direct dashboard access\n      const mockUser = {\n        id: \"guest-user\",\n        name: \"SHARK User\", \n        email: \"user@sharkloterias.com\"\n      };\n      res.json(mockUser);\n    } catch (error) {\n      console.error(\"Error fetching user:\", error);\n      res.status(500).json({ message: \"Failed to fetch user\" });\n    }\n  });\n\n  // 🎯 FASE 2 - Cache otimizado para dados das loterias\n  app.get('/api/lotteries', async (req, res) => {\n    try {\n      // 🔧 CORREÇÃO: Usar métodos corretos do cache\n      const cached = lotteryCache.getLotteryData('lotteries-list');\n      if (cached) {\n        res.json(cached);\n        return;\n      }\n\n      const lotteries = await storage.getLotteryTypes();\n\n      // Cache por 30 minutos\n      lotteryCache.setLotteryData('lotteries-list', lotteries);\n\n      res.json(lotteries);\n    } catch (error) {\n      console.error(\"Error fetching lotteries:\", error);\n      // Return fallback data instead of error\n      res.json([\n        {\n          id: 'megasena',\n          name: 'megasena',\n          displayName: 'Mega-Sena',\n          minNumbers: 6,\n          maxNumbers: 15,\n          totalNumbers: 60,\n          drawDays: ['Wednesday', 'Saturday'],\n          drawTime: '20:00',\n          isActive: true,\n          createdAt: new Date(),\n          updatedAt: new Date(),\n        }\n      ]);\n    }\n  });\n\n  app.get('/api/lotteries/:id/draws', async (req, res) => {\n    try {\n      const { id } = req.params;\n      const limit = parseInt(req.query.limit as string) || 10;\n      const draws = await storage.getLatestDraws(id, limit);\n      res.json(draws);\n    } catch (error) {\n      console.error(\"Error fetching draws:\", error);\n      res.json([]); // Return empty array instead of error\n    }\n  });\n\n  app.get('/api/lotteries/:id/next-draw', async (req, res) => {\n    try {\n      const { id } = req.params;\n\n      // 🎯 FASE 2 - Cache inteligente para próximo sorteio\n      const cached = lotteryCache.getNextDraw(id);\n      if (cached) {\n        res.json(cached);\n        return;\n      }\n\n      // Force sync with official API for real-time data - single lottery for speed\n      try {\n        const realData = await lotteryService.fetchRealLotteryData(id);\n        if (realData) {\n          lotteryCache.setNextDraw(id, realData);\n          res.json(realData);\n          return;\n        }\n      } catch (syncError) {\n        console.log('Direct fetch warning (using fallback):', syncError instanceof Error ? syncError.message : String(syncError));\n      }\n\n      const nextDraw = await lotteryService.getNextDrawInfo(id);\n\n      // Ensure we always have valid time remaining (never negative)\n      if (nextDraw && nextDraw.timeRemaining) {\n        const { days, hours, minutes, seconds } = nextDraw.timeRemaining;\n        nextDraw.timeRemaining = {\n          days: Math.max(0, days),\n          hours: Math.max(0, hours), \n          minutes: Math.max(0, minutes),\n          seconds: Math.max(0, seconds)\n        };\n      }\n\n      res.json(nextDraw);\n    } catch (error) {\n      console.error(\"Error getting next draw info:\", error);\n      res.status(500).json({ error: \"Failed to get next draw information\" });\n    }\n  });\n\n  // Number frequency and heat map routes\n  app.get('/api/lotteries/:id/frequency', async (req, res) => {\n    try {\n      const { id } = req.params;\n      const frequencies = await storage.getNumberFrequencies(id);\n      res.json(frequencies);\n    } catch (error) {\n      console.error(\"Error fetching frequencies:\", error);\n      res.status(500).json({ message: \"Failed to fetch number frequencies\" });\n    }\n  });\n\n  app.post('/api/lotteries/:id/update-frequency', async (req, res) => {\n    try {\n      const { id } = req.params;\n      await lotteryService.updateNumberFrequencies(id);\n      res.json({ message: \"Frequencies updated successfully\" });\n    } catch (error) {\n      console.error(\"Error updating frequencies:\", error);\n      res.json({ message: \"Frequencies updated successfully\" }); // Return success to prevent UI errors\n    }\n  });\n\n  // Real-time data sync endpoint\n  app.post('/api/lotteries/sync', async (req, res) => {\n    try {\n      console.log('🔄 Manual sync requested from client');\n      await lotteryService.syncLatestDraws();\n\n      // Update frequencies after sync\n      const lotteries = await storage.getLotteryTypes();\n      for (const lottery of lotteries) {\n        try {\n          await lotteryService.updateNumberFrequencies(lottery.id);\n        } catch (error) {\n          console.log(`Could not update frequencies for ${lottery.id}`);\n        }\n      }\n\n      res.json({ success: true, message: 'Data synchronized successfully' });\n    } catch (error) {\n      console.error('Sync error:', error);\n      res.status(500).json({ error: 'Failed to sync data' });\n    }\n  });\n\n  // Reset user data endpoint for deployment\n  app.post('/api/users/reset', async (req, res) => {\n    try {\n      const userId = 'guest-user';\n\n      // Clear all user games\n      await storage.clearUserGames(userId);\n\n      // Invalidar cache do usuário\n      lotteryCache.invalidateUser(userId);\n\n      console.log('✓ User data reset successfully for deployment');\n      res.json({ success: true, message: 'User data reset successfully' });\n    } catch (error) {\n      console.error('Error resetting user data:', error);\n      res.status(500).json({ error: 'Failed to reset user data' });\n    }\n  });\n\n  // Lottery games routes\n  app.post('/api/games/generate', async (req: any, res) => {\n    try {\n      const userId = 'guest-user'; // Default guest user for direct access\n      const { lotteryId, numbersCount, gamesCount, strategy } = req.body;\n\n      // Ensure guest user exists before generating games\n      try {\n        await storage.upsertUser({\n          email: 'guest@sharkloterias.com',\n          firstName: 'Guest',\n          lastName: 'User',\n          profileImageUrl: null,\n        });\n      } catch (userError) {\n        console.log('Guest user already exists or could not be created');\n      }\n\n      const generatedGames = await lotteryService.generateGames({\n        lotteryId,\n        numbersCount: parseInt(numbersCount),\n        gamesCount: parseInt(gamesCount),\n        strategy: strategy || 'mixed',\n        userId,\n      });\n\n      res.json(generatedGames);\n    } catch (error) {\n      console.error(\"Error generating games:\", error);\n      res.status(500).json({ message: \"Failed to generate games\" });\n    }\n  });\n\n  // User games routes\n  app.get('/api/games', async (req: any, res) => {\n    try {\n      const userId = 'guest-user'; // Default guest user for direct access\n      const limit = parseInt(req.query.limit as string) || 20;\n      const games = await storage.getUserGames(userId, limit);\n      res.json(games);\n    } catch (error) {\n      console.error(\"Error fetching user games:\", error);\n      res.json([]);\n    }\n  });\n\n  app.post('/api/games', async (req: any, res) => {\n    try {\n      const userId = 'guest-user'; // Default guest user for direct access\n      const gameData = insertUserGameSchema.parse({ ...req.body, userId });\n      const game = await storage.createUserGame(gameData);\n      res.status(201).json(game);\n    } catch (error) {\n      console.error(\"Error creating game:\", error);\n      res.status(500).json({ message: \"Failed to create game\" });\n    }\n  });\n\n  // 🤖 FASE 3 - IA Avançada Integrada\n  app.get('/api/ai/analysis/:lotteryId', async (req, res) => {\n    try {\n      const { lotteryId } = req.params;\n      const { type } = req.query;\n\n      // Validar apenas o lotteryId sem usar DataValidator.validateDraw\n      const config = getLotteryConfig(lotteryId);\n      if (!config) {\n        throw new Error(`Configuração não encontrada para loteria: ${lotteryId}`);\n      }\n\n      // Usar IA avançada baseada no tipo\n      let analysis;\n      switch (type) {\n        case 'temporal':\n          analysis = await advancedAI.performTemporalAnalysis(lotteryId);\n          break;\n        case 'bayesian':\n          analysis = await advancedAI.performBayesianAnalysis(lotteryId);\n          break;\n        case 'ensemble':\n          analysis = await advancedAI.performEnsembleAnalysis(lotteryId);\n          break;\n        case 'pattern':\n          // Análise de padrões\n          analysis = {\n            patterns: [\n              {\n                pattern: 'Sequência Crescente',\n                frequency: 23,\n                lastOccurrence: '15 dias atrás',\n                predictedNext: [7, 12, 18, 25, 33, 41]\n              },\n              {\n                pattern: 'Números Pares/Ímpares Balanceados',\n                frequency: 67,\n                lastOccurrence: '3 dias atrás',\n                predictedNext: [4, 15, 22, 31, 38, 45]\n              }\n            ]\n          };\n          break;\n        case 'prediction':\n          // Predições com números específicos\n          analysis = {\n            primaryPrediction: [8, 15, 23, 31, 42, 50],\n            confidence: 0.76,\n            reasoning: 'Baseado em análise temporal avançada e padrões históricos dos últimos 50 sorteios',\n            alternatives: [\n              {\n                numbers: [5, 12, 28, 35, 44, 52],\n                strategy: 'Estratégia Conservadora'\n              },\n              {\n                numbers: [11, 19, 27, 39, 46, 58],\n                strategy: 'Estratégia Agressiva'\n              }\n            ],\n            riskLevel: 'medium'\n          };\n          break;\n        case 'strategy':\n          // Recomendações estratégicas\n          analysis = {\n            recommendedStrategy: 'Estratégia Equilibrada Inteligente',\n            reasoning: 'Com base na análise de 100 sorteios anteriores, recomendamos uma abordagem que combina números quentes (40%), mornos (35%) e frios (25%) para maximizar as chances.',\n            numberSelection: {\n              hotPercentage: 40,\n              warmPercentage: 35,\n              coldPercentage: 25\n            },\n            riskLevel: 'balanced',\n            playFrequency: 'Jogue 2-3 vezes por semana nos dias de sorteio',\n            budgetAdvice: 'Invista de forma responsável, nunca mais de 5% da sua renda mensal',\n            expectedImprovement: '+18% em precisão de acertos'\n          };\n          break;\n        default:\n          analysis = await advancedAI.performEnsembleAnalysis(lotteryId);\n      }\n\n      res.json({\n        id: Date.now(),\n        lotteryId: lotteryId,\n        analysisType: type || 'ensemble',\n        result: analysis,\n        confidence: type === 'prediction' ? Math.round((analysis.confidence || 0.76) * 100) : 76,\n        createdAt: DataFormatter.formatToISO(new Date()),\n      });\n    } catch (error) {\n      console.error(\"Error with advanced AI analysis:\", error);\n\n      // Retornar dados mock funcionais para evitar erro na UI\n      const mockAnalysis = {\n        primaryPrediction: [7, 14, 21, 28, 35, 42],\n        confidence: 0.65,\n        reasoning: 'Análise baseada em padrões estatísticos e frequência histórica dos números.',\n        alternatives: [\n          {\n            numbers: [3, 9, 16, 23, 31, 47],\n            strategy: 'Estratégia Balanceada'\n          },\n          {\n            numbers: [12, 19, 26, 33, 40, 55],\n            strategy: 'Estratégia de Números Quentes'\n          }\n        ],\n        riskLevel: 'medium'\n      };\n\n      res.json({\n        id: Date.now(),\n        lotteryId: req.params.lotteryId,\n        analysisType: req.query.type || 'prediction',\n        result: mockAnalysis,\n        confidence: 65,\n        createdAt: DataFormatter.formatToISO(new Date()),\n      });\n    }\n  });\n\n  // 🔍 Endpoint para detecção de anomalias\n  app.get('/api/ai/anomalies/:lotteryId', async (req, res) => {\n    try {\n      const { lotteryId } = req.params;\n      const anomalies = await advancedAI.detectAnomalies(lotteryId);\n      res.json(anomalies);\n    } catch (error) {\n      console.error('Error detecting anomalies:', error);\n      res.status(500).json({ error: 'Failed to detect anomalies' });\n    }\n  });\n\n  app.post('/api/ai/analyze', async (req: any, res) => {\n    try {\n      const { lotteryId, analysisType } = req.body;\n      const analysis = await aiService.performAnalysis(lotteryId, analysisType);\n      res.json(analysis);\n    } catch (error) {\n      console.error(\"Error performing AI analysis:\", error);\n      res.status(500).json({ message: \"Failed to perform AI analysis\" });\n    }\n  });\n\n  // User statistics routes\n  app.get('/api/users/stats', async (req: any, res) => {\n    try {\n      const userId = 'guest-user'; // Default guest user for direct access\n      const stats = await storage.getUserStats(userId);\n      res.json(stats);\n    } catch (error) {\n      console.error(\"Error fetching user stats:\", error);\n      res.status(500).json({ message: \"Failed to fetch real user statistics\" });\n    }\n  });\n\n  // Data synchronization routes\n  app.post('/api/sync/latest-draws', async (req, res) => {\n    try {\n      await lotteryService.syncLatestDraws();\n\n      // Update frequencies for all lotteries after sync\n      const lotteries = await storage.getLotteryTypes();\n      for (const lottery of lotteries) {\n        try {\n          await lotteryService.updateNumberFrequencies(lottery.id);\n        } catch (error) {\n          console.error(`Error updating frequencies for ${lottery.id}:`, error);\n        }\n      }\n\n      res.json({ message: \"Latest draws and frequencies synchronized successfully from official sources\" });\n    } catch (error) {\n      console.error(\"Error syncing latest draws:\", error);\n      res.json({ message: \"Synchronization completed with some errors\" });\n    }\n  });\n\n  const httpServer = createServer(app);\n\n  // Simplified server without WebSocket complications\n  console.log('HTTP server initialized without WebSocket to avoid connection issues');\n\n  // Initial sync on server startup\n  setTimeout(async () => {\n    try {\n      console.log('🚀 Starting initial sync with official Caixa data...');\n      await lotteryService.syncLatestDraws();\n      console.log('✓ Initial sync completed');\n    } catch (error) {\n      console.error('Initial sync error:', error);\n    }\n  }, 5000); // Wait 5 seconds after server start\n\n  // Background data updates from official sources\n  setInterval(async () => {\n    try {\n      console.log('🔄 Syncing with official Caixa API...');\n      await lotteryService.syncLatestDraws();\n      console.log('✓ Background sync completed');\n    } catch (error) {\n      console.error('Background sync error:', error);\n    }\n  }, 30 * 60 * 1000); // Every 30 minutes\n\n  // 📊 FASE 4 - Endpoints do Dashboard Avançado\n  app.get('/api/quality/metrics', async (req, res) => {\n    try {\n      // Métricas de qualidade do sistema\n      const lotteries = await storage.getLotteryTypes();\n      const stats = {\n        dataConsistency: 95,\n        predictionAccuracy: 32,\n        systemPerformance: 88,\n        userSatisfaction: 91,\n      };\n\n      res.json(stats);\n    } catch (error) {\n      console.error('Error fetching quality metrics:', error);\n      res.json({ dataConsistency: 85, predictionAccuracy: 25, systemPerformance: 80, userSatisfaction: 85 });\n    }\n  });\n\n  app.get('/api/ai/insights', async (req, res) => {\n    try {\n      // Insights de IA em tempo real\n      const insights = [\n        {\n          type: 'success',\n          title: 'Padrão Identificado na Mega-Sena',\n          description: 'Análise temporal detectou ciclo favorável para números 15-25',\n          confidence: 84,\n          action: 'Ver Recomendações'\n        },\n        {\n          type: 'info',\n          title: 'Cache Otimizado',\n          description: `Sistema de cache atingiu ${lotteryCache.getStats().hitRate} de hit rate`,\n          confidence: 100,\n        }\n      ];\n\n      res.json(insights);\n    } catch (error) {\n      console.error('Error fetching AI insights:', error);\n      res.json([]);\n    }\n  });\n\n  app.get('/api/performance/stats', async (req, res) => {\n    try {\n      const cacheStats = lotteryCache.getStats();\n      const stats = {\n        cacheHitRate: cacheStats.hitRate,\n        memoryUsage: cacheStats.memoryUsage,\n        totalCachedItems: cacheStats.totalItems,\n        validItems: cacheStats.validItems,\n        expiredItems: cacheStats.expiredItems,\n        responseTime: '145ms',\n        uptime: '99.9%',\n      };\n\n      res.json(stats);\n    } catch (error) {\n      console.error('Error fetching performance stats:', error);\n      res.json({ cacheHitRate: '0%', responseTime: '200ms', uptime: '99%' });\n    }\n  });\n\n  // 🎯 Endpoint para predições avançadas\n  app.post('/api/ai/predict/:lotteryId', async (req, res) => {\n    try {\n      const { lotteryId } = req.params;\n      const { method } = req.body;\n\n      let prediction;\n      switch (method) {\n        case 'temporal':\n          prediction = await advancedAI.performTemporalAnalysis(lotteryId);\n          break;\n        case 'bayesian':\n          prediction = await advancedAI.performBayesianAnalysis(lotteryId);\n          break;\n        default:\n          prediction = await advancedAI.performEnsembleAnalysis(lotteryId);\n      }\n\n      res.json(prediction);\n    } catch (error) {\n      console.error('Error with AI prediction:', error);\n      res.status(500).json({ error: 'Failed to generate prediction' });\n    }\n  });\n\n  // ===== ENDPOINTS DE MÉTRICAS DE PERFORMANCE =====\n\n  // Obter performance de modelos para uma loteria\n  app.get('/api/lotteries/:id/performance', async (req, res) => {\n    const { id } = req.params;\n\n    try {\n      const performances = await storage.getModelPerformances(id);\n      res.json(performances);\n    } catch (error) {\n      console.error('Error fetching model performances:', error);\n      res.status(500).json({ error: 'Failed to fetch model performances' });\n    }\n  });\n\n  // Obter relatório detalhado de performance de um modelo\n  app.get('/api/performance/:modelName/:lotteryId', async (req, res) => {\n    const { modelName, lotteryId } = req.params;\n\n    try {\n      const { performanceService } = await import('./services/performanceService');\n      const report = await performanceService.getModelPerformanceReport(modelName, lotteryId);\n      res.json(report);\n    } catch (error) {\n      console.error('Error fetching performance report:', error);\n      res.status(500).json({ error: 'Failed to fetch performance report' });\n    }\n  });\n\n  // Comparar duas estratégias\n  app.get('/api/performance/compare/:strategyA/:strategyB/:lotteryId', async (req, res) => {\n    const { strategyA, strategyB, lotteryId } = req.params;\n    const periodDays = parseInt(req.query.days as string) || 30;\n\n    try {\n      const { performanceService } = await import('./services/performanceService');\n      const comparison = await performanceService.compareStrategies(\n        strategyA,\n        strategyB,\n        lotteryId,\n        periodDays\n      );\n      res.json(comparison);\n    } catch (error) {\n      console.error('Error comparing strategies:', error);\n      res.status(500).json({ error: 'Failed to compare strategies' });\n    }\n  });\n\n  // Obter resultados de backtesting\n  app.get('/api/performance/backtest/:modelName/:lotteryId', async (req, res) => {\n    const { modelName, lotteryId } = req.params;\n\n    try {\n      const results = await storage.getBacktestResults(modelName, lotteryId);\n      res.json(results);\n    } catch (error) {\n      console.error('Error fetching backtest results:', error);\n      res.status(500).json({ error: 'Failed to fetch backtest results' });\n    }\n  });\n\n  // Executar backtesting em dados históricos\n  app.post('/api/performance/backtest', async (req, res) => {\n    const { testName, modelName, strategy, lotteryId, testParameters } = req.body;\n\n    try {\n      // Obter dados históricos\n      const historicalDraws = await storage.getLatestDraws(lotteryId, 100); // últimos 100 sorteios\n\n      const { performanceService } = await import('./services/performanceService');\n      const metrics = await performanceService.runBacktest(\n        testName,\n        modelName,\n        strategy,\n        lotteryId,\n        historicalDraws,\n        testParameters || {}\n      );\n\n      res.json({ success: true, metrics });\n    } catch (error) {\n      console.error('Error running backtest:', error);\n      res.status(500).json({ error: 'Failed to run backtest' });\n    }\n  });\n\n  // Avaliar predições manualmente (útil para debug)\n  app.post('/api/performance/evaluate', async (req, res) => {\n    const { lotteryId, contestNumber, actualNumbers } = req.body;\n\n    try {\n      const { performanceService } = await import('./services/performanceService');\n      await performanceService.evaluatePredictions(lotteryId, contestNumber, actualNumbers);\n      res.json({ success: true, message: 'Predições avaliadas com sucesso' });\n    } catch (error) {\n      console.error('Error evaluating predictions:', error);\n      res.status(500).json({ error: 'Failed to evaluate predictions' });\n    }\n  });\n\n  // 🎓 Endpoint para aprendizado contínuo\n  app.post('/api/ai/learn', async (req, res) => {\n    try {\n      const { lotteryId, actualNumbers, predictedNumbers } = req.body;\n\n      const { multiAIService } = await import('./services/multiAIService');\n      const learningResult = await multiAIService.learnFromResults(\n        lotteryId,\n        actualNumbers,\n        predictedNumbers\n      );\n\n      res.json({\n        success: true,\n        ...learningResult,\n        message: `Sistema aprendeu com ${(learningResult.accuracy * 100).toFixed(1)}% de acurácia`\n      });\n    } catch (error) {\n      console.error('Error in learning endpoint:', error);\n      res.status(500).json({ error: 'Failed to process learning' });\n    }\n  });\n\n  // 🛒 Endpoints de integração com plataformas de apostas\n  app.get('/api/betting-platforms', async (req, res) => {\n    try {\n      const { bettingPlatformService } = await import('./services/bettingPlatformService');\n      const { lotteryId } = req.query;\n\n      if (lotteryId) {\n        const platforms = bettingPlatformService.getAvailablePlatforms(lotteryId as string);\n        res.json(platforms);\n      } else {\n        // Retorna todas as plataformas\n        res.json([\n          { id: 'superjogo', name: 'SuperJogo', authRequired: false },\n          { id: 'caixa', name: 'Loterias Caixa', authRequired: true },\n          { id: 'lottoland', name: 'Lottoland', authRequired: false }\n        ]);\n      }\n    } catch (error) {\n      console.error('Error fetching betting platforms:', error);\n      res.status(500).json({ error: 'Failed to fetch betting platforms' });\n    }\n  });\n\n  app.post('/api/betting-platforms/cart-url', async (req, res) => {\n    try {\n      const { bettingPlatformService } = await import('./services/bettingPlatformService');\n      const { platformId, games } = req.body;\n\n      if (!platformId || !games || !Array.isArray(games)) {\n        res.status(400).json({ error: 'Invalid request parameters' });\n        return;\n      }\n\n      const cartUrl = bettingPlatformService.generateCartUrl(platformId, games);\n      const deepLink = bettingPlatformService.generateDeepLink(platformId, games);\n\n      res.json({\n        success: true,\n        cartUrl,\n        deepLink,\n        platform: platformId\n      });\n    } catch (error) {\n      console.error('Error generating cart URL:', error);\n      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate cart URL' });\n    }\n  });\n\n  // 🤖 Endpoint para análise ensemble completa\n  app.get('/api/ai/ensemble/:lotteryId', async (req, res) => {\n    try {\n      const { lotteryId } = req.params;\n      const latestDraws = await storage.getLatestDraws(lotteryId, 50);\n\n      const { multiAIService } = await import('./services/multiAIService');\n      const ensembleAnalysis = await multiAIService.performEnsembleAnalysis(lotteryId, latestDraws);\n\n      res.json({\n        id: Date.now(),\n        lotteryId,\n        analysisType: 'ensemble',\n        result: ensembleAnalysis,\n        confidence: Math.round(ensembleAnalysis.confidence * 100),\n        createdAt: DataFormatter.formatToISO(new Date())\n      });\n    } catch (error) {\n      console.error('Error in ensemble analysis:', error);\n      res.status(500).json({ error: 'Failed to perform ensemble analysis' });\n    }\n  });\n\n  return httpServer;\n}\n</new_str>"}
]
```
Added new routes for advanced data analysis and correlation analysis, enhancing the API's analytical capabilities.
<replit_final_file>
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { lotteryService } from "./services/lotteryService";
import { aiService } from "./services/aiService";
import { lotteryCache } from "./cache";
import { insertUserGameSchema } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { LOTTERY_CONFIGS, getLotteryDisplayInfo, getLotteryConfig } from "@shared/lotteryConstants";
import { DataValidator, DataFormatter } from "@shared/dataValidation";
import { advancedAI } from "./services/advancedAI";
import { advancedDataAnalysis } from "./services/advancedDataAnalysis";
import { correlationAnalysis } from "./services/correlationAnalysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize lottery types once at startup
  try {
    await lotteryService.initializeLotteryTypes();
  } catch (error) {
    console.error("Failed to initialize lottery types:", error);
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json( {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Auth routes - Mock user for direct access (no login required)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return mock user for direct dashboard access
      const mockUser = {
        id: "guest-user",
        name: "SHARK User",
        email: "user@sharkloterias.com"
      };
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // 🎯 FASE 2 - Cache otimizado para dados das loterias
  app.get('/api/lotteries', async (req, res) => {
    try {
      // 🔧 CORREÇÃO: Usar métodos corretos do cache
      const cached = lotteryCache.getLotteryData('lotteries-list');
      if (cached) {
        res.json(cached);
        return;
      }

      const lotteries = await storage.getLotteryTypes();

      // Cache por 30 minutos
      lotteryCache.setLotteryData('lotteries-list', lotteries);

      res.json(lotteries);
    } catch (error) {
      console.error("Error fetching lotteries:", error);
      // Return fallback data instead of error
      res.json([
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
        }
      ]);
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
      res.json([]); // Return empty array instead of error
    }
  });

  app.get('/api/lotteries/:id/next-draw', async (req, res) => {
    try {
      const { id } = req.params;

      // 🎯 FASE 2 - Cache inteligente para próximo sorteio
      const cached = lotteryCache.getNextDraw(id);
      if (cached) {
        res.json(cached);
        return;
      }

      // Force sync with official API for real-time data - single lottery for speed
      try {
        const realData = await lotteryService.fetchRealLotteryData(id);
        if (realData) {
          lotteryCache.setNextDraw(id, realData);
          res.json(realData);
          return;
        }
      } catch (syncError) {
        console.log('Direct fetch warning (using fallback):', syncError instanceof Error ? syncError.message : String(syncError));
      }

      const nextDraw = await lotteryService.getNextDrawInfo(id);

      // Ensure we always have valid time remaining (never negative)
      if (nextDraw && nextDraw.timeRemaining) {
        const { days, hours, minutes, seconds } = nextDraw.timeRemaining;
        nextDraw.timeRemaining = {
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds)
        };
      }

      res.json(nextDraw);
    } catch (error) {
      console.error("Error getting next draw info:", error);
      res.status(500).json({ error: "Failed to get next draw information" });
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
      res.json({ message: "Frequencies updated successfully" }); // Return success to prevent UI errors
    }
  });

  // Real-time data sync endpoint
  app.post('/api/lotteries/sync', async (req, res) => {
    try {
      console.log('🔄 Manual sync requested from client');
      await lotteryService.syncLatestDraws();

      // Update frequencies after sync
      const lotteries = await storage.getLotteryTypes();
      for (const lottery of lotteries) {
        try {
          await lotteryService.updateNumberFrequencies(lottery.id);
        } catch (error) {
          console.log(`Could not update frequencies for ${lottery.id}`);
        }
      }

      res.json({ success: true, message: 'Data synchronized successfully' });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: 'Failed to sync data' });
    }
  });

  // Reset user data endpoint for deployment
  app.post('/api/users/reset', async (req, res) => {
    try {
      const userId = 'guest-user';

      // Clear all user games
      await storage.clearUserGames(userId);

      // Invalidar cache do usuário
      lotteryCache.invalidateUser(userId);

      console.log('✓ User data reset successfully for deployment');
      res.json({ success: true, message: 'User data reset successfully' });
    } catch (error) {
      console.error('Error resetting user data:', error);
      res.status(500).json({ error: 'Failed to reset user data' });
    }
  });

  // Lottery games routes
  app.post('/api/games/generate', async (req: any, res) => {
    try {
      const userId = 'guest-user'; // Default guest user for direct access
      const { lotteryId, numbersCount, gamesCount, strategy } = req.body;

      // Ensure guest user exists before generating games
      try {
        await storage.upsertUser({
          email: 'guest@sharkloterias.com',
          firstName: 'Guest',
          lastName: 'User',
          profileImageUrl: null,
        });
      } catch (userError) {
        console.log('Guest user already exists or could not be created');
      }

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
  app.get('/api/games', async (req: any, res) => {
    try {
      const userId = 'guest-user'; // Default guest user for direct access
      const limit = parseInt(req.query.limit as string) || 20;
      const games = await storage.getUserGames(userId, limit);
      res.json(games);
    } catch (error) {
      console.error("Error fetching user games:", error);
      res.json([]);
    }
  });

  app.post('/api/games', async (req: any, res) => {
    try {
      const userId = 'guest-user'; // Default guest user for direct access
      const gameData = insertUserGameSchema.parse({ ...req.body, userId });
      const game = await storage.createUserGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // 🤖 FASE 3 - IA Avançada Integrada
  app.get('/api/ai/analysis/:lotteryId', async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const { type } = req.query;

      // Validar apenas o lotteryId sem usar DataValidator.validateDraw
      const config = getLotteryConfig(lotteryId);
      if (!config) {
        throw new Error(`Configuração não encontrada para loteria: ${lotteryId}`);
      }

      // Usar IA avançada baseada no tipo
      let analysis;
      switch (type) {
        case 'temporal':
          analysis = await advancedAI.performTemporalAnalysis(lotteryId);
          break;
        case 'bayesian':
          analysis = await advancedAI.performBayesianAnalysis(lotteryId);
          break;
        case 'ensemble':
          analysis = await advancedAI.performEnsembleAnalysis(lotteryId);
          break;
        case 'pattern':
          // Análise de padrões
          analysis = {
            patterns: [
              {
                pattern: 'Sequência Crescente',
                frequency: 23,
                lastOccurrence: '15 dias atrás',
                predictedNext: [7, 12, 18, 25, 33, 41]
              },
              {
                pattern: 'Números Pares/Ímpares Balanceados',
                frequency: 67,
                lastOccurrence: '3 dias atrás',
                predictedNext: [4, 15, 22, 31, 38, 45]
              }
            ]
          };
          break;
        case 'prediction':
          // Predições com números específicos
          analysis = {
            primaryPrediction: [8, 15, 23, 31, 42, 50],
            confidence: 0.76,
            reasoning: 'Baseado em análise temporal avançada e padrões históricos dos últimos 50 sorteios',
            alternatives: [
              {
                numbers: [5, 12, 28, 35, 44, 52],
                strategy: 'Estratégia Conservadora'
              },
              {
                numbers: [11, 19, 27, 39, 46, 58],
                strategy: 'Estratégia Agressiva'
              }
            ],
            riskLevel: 'medium'
          };
          break;
        case 'strategy':
          // Recomendações estratégicas
          analysis = {
            recommendedStrategy: 'Estratégia Equilibrada Inteligente',
            reasoning: 'Com base na análise de 100 sorteios anteriores, recomendamos uma abordagem que combina números quentes (40%), mornos (35%) e frios (25%) para maximizar as chances.',
            numberSelection: {
              hotPercentage: 40,
              warmPercentage: 35,
              coldPercentage: 25
            },
            riskLevel: 'balanced',
            playFrequency: 'Jogue 2-3 vezes por semana nos dias de sorteio',
            budgetAdvice: 'Invista de forma responsável, nunca mais de 5% da sua renda mensal',
            expectedImprovement: '+18% em precisão de acertos'
          };
          break;
        default:
          analysis = await advancedAI.performEnsembleAnalysis(lotteryId);
      }

      res.json({
        id: Date.now(),
        lotteryId: lotteryId,
        analysisType: type || 'ensemble',
        result: analysis,
        confidence: type === 'prediction' ? Math.round((analysis.confidence || 0.76) * 100) : 76,
        createdAt: DataFormatter.formatToISO(new Date()),
      });
    } catch (error) {
      console.error("Error with advanced AI analysis:", error);

      // Retornar dados mock funcionais para evitar erro na UI
      const mockAnalysis = {
        primaryPrediction: [7, 14, 21, 28, 35, 42],
        confidence: 0.65,
        reasoning: 'Análise baseada em padrões estatísticos e frequência histórica dos números.',
        alternatives: [
          {
            numbers: [3, 9, 16, 23, 31, 47],
            strategy: 'Estratégia Balanceada'
          },
          {
            numbers: [12, 19, 26, 33, 40, 55],
            strategy: 'Estratégia de Números Quentes'
          }
        ],
        riskLevel: 'medium'
      };

      res.json({
        id: Date.now(),
        lotteryId: req.params.lotteryId,
        analysisType: req.query.type || 'prediction',
        result: mockAnalysis,
        confidence: 65,
        createdAt: DataFormatter.formatToISO(new Date()),
      });
    }
  });

  // 🔍 Endpoint para detecção de anomalias
  app.get('/api/ai/anomalies/:lotteryId', async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const anomalies = await advancedAI.detectAnomalies(lotteryId);
      res.json(anomalies);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      res.status(500).json({ error: 'Failed to detect anomalies' });
    }
  });

  app.post('/api/ai/analyze', async (req: any, res) => {
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
  app.get('/api/users/stats', async (req: any, res) => {
    try {
      const userId = 'guest-user'; // Default guest user for direct access
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch real user statistics" });
    }
  });

  // Data synchronization routes
  app.post('/api/sync/latest-draws', async (req, res) => {
    try {
      await lotteryService.syncLatestDraws();

      // Update frequencies for all lotteries after sync
      const lotteries = await storage.getLotteryTypes();
      for (const lottery of lotteries) {
        try {
          await lotteryService.updateNumberFrequencies(lottery.id);
        } catch (error) {
          console.error(`Error updating frequencies for ${lottery.id}:`, error);
        }
      }

      res.json({ message: "Latest draws and frequencies synchronized successfully from official sources" });
    } catch (error) {
      console.error("Error syncing latest draws:", error);
      res.json({ message: "Synchronization completed with some errors" });
    }
  });

  const httpServer = createServer(app);

  // Simplified server without WebSocket complications
  console.log('HTTP server initialized without WebSocket to avoid connection issues');

  // Initial sync on server startup
  setTimeout(async () => {
    try {
      console.log('🚀 Starting initial sync with official Caixa data...');
      await lotteryService.syncLatestDraws();
      console.log('✓ Initial sync completed');
    } catch (error) {
      console.error('Initial sync error:', error);
    }
  }, 5000); // Wait 5 seconds after server start

  // Background data updates from official sources
  setInterval(async () => {
    try {
      console.log('🔄 Syncing with official Caixa API...');
      await lotteryService.syncLatestDraws();
      console.log('✓ Background sync completed');
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, 30 * 60 * 1000); // Every 30 minutes

  // 📊 FASE 4 - Endpoints do Dashboard Avançado
  app.get('/api/quality/metrics', async (req, res) => {
    try {
      // Métricas de qualidade do sistema
      const lotteries = await storage.getLotteryTypes();
      const stats = {
        dataConsistency: 95,
        predictionAccuracy: 32,
        systemPerformance: 88,
        userSatisfaction: 91,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      res.json({ dataConsistency: 85, predictionAccuracy: 25, systemPerformance: 80, userSatisfaction: 85 });
    }
  });

  app.get('/api/ai/insights', async (req, res) => {
    try {
      // Insights de IA em tempo real
      const insights = [
        {
          type: 'success',
          title: 'Padrão Identificado na Mega-Sena',
          description: 'Análise temporal detectou ciclo favorável para números 15-25',
          confidence: 84,
          action: 'Ver Recomendações'
        },
        {
          type: 'info',
          title: 'Cache Otimizado',
          description: `Sistema de cache atingiu ${lotteryCache.getStats().hitRate} de hit rate`,
          confidence: 100,
        }
      ];

      res.json(insights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      res.json([]);
    }
  });

  app.get('/api/performance/stats', async (req, res) => {
    try {
      const cacheStats = lotteryCache.getStats();
      const stats = {
        cacheHitRate: cacheStats.hitRate,
        memoryUsage: cacheStats.memoryUsage,
        totalCachedItems: cacheStats.totalItems,
        validItems: cacheStats.validItems,
        expiredItems: cacheStats.expiredItems,
        responseTime: '145ms',
        uptime: '99.9%',
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      res.json({ cacheHitRate: '0%', responseTime: '200ms', uptime: '99%' });
    }
  });

  // 🎯 Endpoint para predições avançadas
  app.post('/api/ai/predict/:lotteryId', async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const { method } = req.body;

      let prediction;
      switch (method) {
        case 'temporal':
          prediction = await advancedAI.performTemporalAnalysis(lotteryId);
          break;
        case 'bayesian':
          prediction = await advancedAI.performBayesianAnalysis(lotteryId);
          break;
        default:
          prediction = await advancedAI.performEnsembleAnalysis(lotteryId);
      }

      res.json(prediction);
    } catch (error) {
      console.error('Error with AI prediction:', error);
      res.status(500).json({ error: 'Failed to generate prediction' });
    }
  });

  // ===== ENDPOINTS DE MÉTRICAS DE PERFORMANCE =====

  // Obter performance de modelos para uma loteria
  app.get('/api/lotteries/:id/performance', async (req, res) => {
    const { id } = req.params;

    try {
      const performances = await storage.getModelPerformances(id);
      res.json(performances);
    } catch (error) {
      console.error('Error fetching model performances:', error);
      res.status(500).json({ error: 'Failed to fetch model performances' });
    }
  });

  // Obter relatório detalhado de performance de um modelo
  app.get('/api/performance/:modelName/:lotteryId', async (req, res) => {
    const { modelName, lotteryId } = req.params;

    try {
      const { performanceService } = await import('./services/performanceService');
      const report = await performanceService.getModelPerformanceReport(modelName, lotteryId);
      res.json(report);
    } catch (error) {
      console.error('Error fetching performance report:', error);
      res.status(500).json({ error: 'Failed to fetch performance report' });
    }
  });

  // Comparar duas estratégias
  app.get('/api/performance/compare/:strategyA/:strategyB/:lotteryId', async (req, res) => {
    const { strategyA, strategyB, lotteryId } = req.params;
    const periodDays = parseInt(req.query.days as string) || 30;

    try {
      const { performanceService } = await import('./services/performanceService');
      const comparison = await performanceService.compareStrategies(
        strategyA,
        strategyB,
        lotteryId,
        periodDays
      );
      res.json(comparison);
    } catch (error) {
      console.error('Error comparing strategies:', error);
      res.status(500).json({ error: 'Failed to compare strategies' });
    }
  });

  // Obter resultados de backtesting
  app.get('/api/performance/backtest/:modelName/:lotteryId', async (req, res) => {
    const { modelName, lotteryId } = req.params;

    try {
      const results = await storage.getBacktestResults(modelName, lotteryId);
      res.json(results);
    } catch (error) {
      console.error('Error fetching backtest results:', error);
      res.status(500).json({ error: 'Failed to fetch backtest results' });
    }
  });

  // Executar backtesting em dados históricos
  app.post('/api/performance/backtest', async (req, res) => {
    const { testName, modelName, strategy, lotteryId, testParameters } = req.body;

    try {
      // Obter dados históricos
      const historicalDraws = await storage.getLatestDraws(lotteryId, 100); // últimos 100 sorteios

      const { performanceService } = await import('./services/performanceService');
      const metrics = await performanceService.runBacktest(
        testName,
        modelName,
        strategy,
        lotteryId,
        historicalDraws,
        testParameters || {}
      );

      res.json({ success: true, metrics });
    } catch (error) {
      console.error('Error running backtest:', error);
      res.status(500).json({ error: 'Failed to run backtest' });
    }
  });

  // Avaliar predições manualmente (útil para debug)
  app.post('/api/performance/evaluate', async (req, res) => {
    const { lotteryId, contestNumber, actualNumbers } = req.body;

    try {
      const { performanceService } = await import('./services/performanceService');
      await performanceService.evaluatePredictions(lotteryId, contestNumber, actualNumbers);
      res.json({ success: true, message: 'Predições avaliadas com sucesso' });
    } catch (error) {
      console.error('Error evaluating predictions:', error);
      res.status(500).json({ error: 'Failed to evaluate predictions' });
    }
  });

  // 🎓 Endpoint para aprendizado contínuo
  app.post('/api/ai/learn', async (req, res) => {
    try {
      const { lotteryId, actualNumbers, predictedNumbers } = req.body;

      const { multiAIService } = await import('./services/multiAIService');
      const learningResult = await multiAIService.learnFromResults(
        lotteryId,
        actualNumbers,
        predictedNumbers
      );

      res.json({
        success: true,
        ...learningResult,
        message: `Sistema aprendeu com ${(learningResult.accuracy * 100).toFixed(1)}% de acurácia`
      });
    } catch (error) {
      console.error('Error in learning endpoint:', error);
      res.status(500).json({ error: 'Failed to process learning' });
    }
  });

  // 🛒 Endpoints de integração com plataformas de apostas
  app.get('/api/betting-platforms', async (req, res) => {
    try {
      const { bettingPlatformService } = await import('./services/bettingPlatformService');
      const { lotteryId } = req.query;

      if (lotteryId) {
        const platforms = bettingPlatformService.getAvailablePlatforms(lotteryId as string);
        res.json(platforms);
      } else {
        // Retorna todas as plataformas
        res.json([
          { id: 'superjogo', name: 'SuperJogo', authRequired: false },
          { id: 'caixa', name: 'Loterias Caixa', authRequired: true },
          { id: 'lottoland', name: 'Lottoland', authRequired: false }
        ]);
      }
    } catch (error) {
      console.error('Error fetching betting platforms:', error);
      res.status(500).json({ error: 'Failed to fetch betting platforms' });
    }
  });

  app.post('/api/betting-platforms/cart-url', async (req, res) => {
    try {
      const { bettingPlatformService } = await import('./services/bettingPlatformService');
      const { platformId, games } = req.body;

      if (!platformId || !games || !Array.isArray(games)) {
        res.status(400).json({ error: 'Invalid request parameters' });
        return;
      }

      const cartUrl = bettingPlatformService.generateCartUrl(platformId, games);
      const deepLink = bettingPlatformService.generateDeepLink(platformId, games);

      res.json({
        success: true,
        cartUrl,
        deepLink,
        platform: platformId
      });
    } catch (error) {
      console.error('Error generating cart URL:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate cart URL' });
    }
  });

  // 🤖 Endpoint para análise ensemble completa
  app.get('/api/ai/ensemble/:lotteryId', async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const latestDraws = await storage.getLatestDraws(lotteryId, 50);

      const { multiAIService } = await import('./services/multiAIService');
      const ensembleAnalysis = await multiAIService.performEnsembleAnalysis(lotteryId, latestDraws);

      res.json({
        id: Date.now(),
        lotteryId,
        analysisType: 'ensemble',
        result: ensembleAnalysis,
        confidence: Math.round(ensembleAnalysis.confidence * 100),
        createdAt: DataFormatter.formatToISO(new Date())
      });
    } catch (error) {
      console.error('Error in ensemble analysis:', error);
      res.status(500).json({ error: 'Failed to perform ensemble analysis' });
    }
  });

  // === ROTAS DE ANÁLISE AVANÇADA ===

  // Gerar heatmap de posições
  app.get("/api/analysis/heatmap/:lotteryId", async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const draws = await storage.getLatestDraws(lotteryId, 100);
      const lottery = await storage.getLotteryType(lotteryId);

      if (!lottery) {
        return res.status(404).json({ error: "Lottery not found" });
      }

      const heatmap = advancedDataAnalysis.generatePositionHeatmap(draws, lottery.totalNumbers);
      res.json({ lotteryId, heatmap, totalDraws: draws.length });
    } catch (error) {
      console.error("Error generating heatmap:", error);
      res.status(500).json({ error: "Failed to generate heatmap" });
    }
  });

  // Análise de sequências consecutivas
  app.get("/api/analysis/sequences/:lotteryId", async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const minLength = parseInt(req.query.minLength as string) || 3;
      const draws = await storage.getLatestDraws(lotteryId, 200);

      const sequences = correlationAnalysis.analyzeConsecutiveSequences(draws, minLength);
      res.json({ lotteryId, sequences, totalDraws: draws.length });
    } catch (error) {
      console.error("Error analyzing sequences:", error);
      res.status(500).json({ error: "Failed to analyze sequences" });
    }
  });

  // Análise de trios correlacionados
  app.get("/api/analysis/trios/:lotteryId", async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const minFrequency = parseInt(req.query.minFrequency as string) || 3;
      const draws = await storage.getLatestDraws(lotteryId, 200);

      const trios = correlationAnalysis.findNumberTrios(draws, minFrequency);
      res.json({ lotteryId, trios, totalDraws: draws.length });
    } catch (error) {
      console.error("Error finding trios:", error);
      res.status(500).json({ error: "Failed to find number trios" });
    }
  });

  // Análise de dispersão estatística
  app.get("/api/analysis/dispersion/:lotteryId", async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const frequencies = await storage.getNumberFrequencies(lotteryId);

      const dispersion = correlationAnalysis.calculateDispersionMetrics(frequencies);
      res.json({ lotteryId, dispersion });
    } catch (error) {
      console.error("Error calculating dispersion:", error);
      res.status(500).json({ error: "Failed to calculate dispersion metrics" });
    }
  });

  // Análise de atraso por posição
  app.get("/api/analysis/delays/:lotteryId", async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const draws = await storage.getLatestDraws(lotteryId, 200);
      const lottery = await storage.getLotteryType(lotteryId);

      if (!lottery) {
        return res.status(404).json({ error: "Lottery not found" });
      }

      const delays = correlationAnalysis.analyzeDelayByPosition(draws, lottery.totalNumbers);
      const delayArray = Array.from(delays.entries()).map(([number, data]) => ({
        number,
        ...data
      }));

      res.json({ lotteryId, delays: delayArray });
    } catch (error) {
      console.error("Error analyzing delays:", error);
      res.status(500).json({ error: "Failed to analyze delays" });
    }
  });

  // Aplicar filtros personalizados
  app.post("/api/analysis/filter", async (req, res) => {
    try {
      const { numbers, criteria } = req.body;

      if (!numbers || !Array.isArray(numbers)) {
        return res.status(400).json({ error: "Invalid numbers array" });
      }

      const result = advancedDataAnalysis.applyCustomFilters(numbers, criteria || {});
      res.json({ numbers, criteria, result });
    } catch (error) {
      console.error("Error applying filters:", error);
      res.status(500).json({ error: "Failed to apply filters" });
    }
  });

  // Comparar duas loterias
  app.get("/api/analysis/compare", async (req, res) => {
    try {
      const { lottery1, lottery2 } = req.query;

      if (!lottery1 || !lottery2) {
        return res.status(400).json({ error: "Both lottery1 and lottery2 parameters required" });
      }

      const draws1 = await storage.getLatestDraws(lottery1 as string, 100);
      const draws2 = await storage.getLatestDraws(lottery2 as string, 100);

      const comparison = advancedDataAnalysis.compareLotteries(draws1, draws2);
      res.json({ lottery1, lottery2, comparison });
    } catch (error) {
      console.error("Error comparing lotteries:", error);
      res.status(500).json({ error: "Failed to compare lotteries" });
    }
  });

  // Simulação de apostas
  app.post("/api/analysis/simulate", async (req, res) => {
    try {
      const { lotteryId, strategy, betCount } = req.body;

      if (!lotteryId || !strategy) {
        return res.status(400).json({ error: "lotteryId and strategy required" });
      }

      const draws = await storage.getLatestDraws(lotteryId, 200);
      const simulation = advancedDataAnalysis.simulateBets(
        strategy,
        draws,
        betCount || 50
      );

      res.json({ lotteryId, strategy, simulation });
    } catch (error) {
      console.error("Error simulating bets:", error);
      res.status(500).json({ error: "Failed to simulate bets" });
    }
  });

  // Gerar relatório completo
  app.get("/api/analysis/report/:lotteryId", async (req, res) => {
    try {
      const { lotteryId } = req.params;
      const draws = await storage.getLatestDraws(lotteryId, 200);
      const frequencies = await storage.getNumberFrequencies(lotteryId);

      const report = advancedDataAnalysis.generateReport(lotteryId, draws, frequencies);
      res.json({ lotteryId, report });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Obter estatísticas do usuário
  app.get("/api/user/stats", async (req, res) => {
    try {
      const userId = "guest-user";
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  return httpServer;
}