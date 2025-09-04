import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import AllLotteriesCard from "@/components/AllLotteriesCard";
import HeatMapGrid from "@/components/HeatMapGrid";
import CelebrationAnimation from "@/components/CelebrationAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLotteryTypes, useNextDrawInfo, useNumberFrequencies, useUserStats } from "@/hooks/useLotteryData";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  History,
  Brain,
  Trophy,
  Zap,
  Target,
  DollarSign,
  BarChart3,
  Activity,
  Star
} from "lucide-react";
import type { UserGame } from "@/types/lottery";

export default function Home() {
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPrize, setCelebrationPrize] = useState<string>();

  // Data queries
  const { data: lotteryTypes, isLoading: lotteriesLoading } = useLotteryTypes();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  
  // Get next draw info for main lotteries
  const megasenaNextDraw = useNextDrawInfo('megasena');
  const lotofacilNextDraw = useNextDrawInfo('lotofacil');
  const quinaNextDraw = useNextDrawInfo('quina');
  
  // Get frequency data for Mega-Sena heat map preview
  const { data: megasenaFrequencies, isLoading: frequenciesLoading } = useNumberFrequencies('megasena');

  // User games and recent results
  const { data: recentGames, isLoading: gamesLoading } = useQuery<UserGame[]>({
    queryKey: ["/api/games", "limit=10"],
    staleTime: 2 * 60 * 1000,
  });

  // AI analysis status
  const { data: aiAnalysis } = useQuery({
    queryKey: ["/api/ai/analysis/megasena", "type=prediction"],
    staleTime: 5 * 60 * 1000,
  });

  // Recent winners/celebrations
  const { data: recentWinners } = useQuery({
    queryKey: ["/api/users/stats"],
    select: (data) => {
      // Transform stats into recent winners format
      return recentGames?.filter(game => parseFloat(game.prizeWon || "0") > 0).slice(0, 3) || [];
    },
    enabled: !!recentGames,
  });

  // Check for recent wins to trigger celebration
  useEffect(() => {
    if (recentGames && recentGames.length > 0) {
      const latestWin = recentGames.find(game => 
        parseFloat(game.prizeWon || "0") > 0 && 
        new Date(game.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
      );
      
      if (latestWin && !showCelebration) {
        setCelebrationPrize(`R$ ${latestWin.prizeWon}`);
        setShowCelebration(true);
      }
    }
  }, [recentGames, showCelebration]);

  const mainLotteries = [
    {
      id: 'megasena',
      name: 'megasena',
      displayName: 'MEGA-SENA',
      color: 'green',
      icon: '💎',
      nextDraw: megasenaNextDraw.data
    },
    {
      id: 'lotofacil',
      name: 'lotofacil', 
      displayName: 'LOTOFÁCIL',
      color: 'purple',
      icon: '⭐',
      nextDraw: lotofacilNextDraw.data
    },
    {
      id: 'quina',
      name: 'quina',
      displayName: 'QUINA', 
      color: 'pink',
      icon: '🪙',
      nextDraw: quinaNextDraw.data
    }
  ];

  const allLotteries = [
    { id: 'megasena', name: 'Mega-Sena', icon: '💎', color: 'from-neon-green to-primary' },
    { id: 'lotofacil', name: 'Lotofácil', icon: '⭐', color: 'from-neon-purple to-secondary' },
    { id: 'quina', name: 'Quina', icon: '🪙', color: 'from-neon-pink to-destructive' },
    { id: 'lotomania', name: 'Lotomania', icon: '♾️', color: 'from-primary to-neon-cyan' },
    { id: 'duplasena', name: 'Dupla Sena', icon: '👑', color: 'from-accent to-neon-gold' },
    { id: 'supersete', name: 'Super Sete', icon: '🚀', color: 'from-secondary to-neon-purple' },
    { id: 'milionaria', name: '+Milionária', icon: '➕', color: 'from-neon-gold to-accent' },
    { id: 'timemania', name: 'Timemania', icon: '🎁', color: 'from-destructive to-neon-pink' },
    { id: 'diadesore', name: 'Dia de Sorte', icon: '🌟', color: 'from-neon-cyan to-primary' },
    { id: 'loteca', name: 'Loteca', icon: '⚽', color: 'from-primary to-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold neon-text text-primary mb-2" data-testid="dashboard-title">
            Dashboard Principal
          </h2>
          <p className="text-muted-foreground mb-2">
            Análise inteligente das loterias federais com dados oficiais
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-xs bg-neon-green/10 text-neon-green px-2 py-1 rounded-full border border-neon-green/30">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              Dados Oficiais Caixa
            </div>
            <div className="flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full border border-secondary/30">
              🤖 IA Ativa
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center lg:hidden">
          <Button 
            onClick={() => window.location.href = '/generator'}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 rounded-lg neon-border hover:animate-glow transition-all duration-300 font-semibold"
            data-testid="quick-generate-button"
          >
            <Zap className="h-4 w-4 mr-2" />
            Gerar Jogos Rápido
          </Button>
          <Button 
            onClick={() => window.location.href = '/results'}
            className="bg-gradient-to-r from-accent to-neon-gold text-accent-foreground px-6 py-3 rounded-lg neon-border hover:animate-glow transition-all duration-300 font-semibold"
            data-testid="quick-results-button"
          >
            <History className="h-4 w-4 mr-2" />
            Ver Resultados
          </Button>
        </div>

        {/* All Lotteries - Complete Dashboard */}
        <section className="mb-12">
          <AllLotteriesCard />
        </section>

        {/* Stats Overview */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-3 text-accent" />
            Estatísticas Gerais
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="neon-border bg-card/30 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary neon-text" data-testid="stat-total-games">
                  {statsLoading ? "..." : userStats?.totalGames || 0}
                </div>
                <div className="text-xs text-muted-foreground">Jogos Gerados</div>
              </CardContent>
            </Card>
            
            <Card className="neon-border bg-card/30 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-neon-green neon-text" data-testid="stat-wins">
                  {statsLoading ? "..." : userStats?.wins || 0}
                </div>
                <div className="text-xs text-muted-foreground">Prêmios Ganhos</div>
              </CardContent>
            </Card>
            
            <Card className="neon-border bg-card/30 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent neon-text" data-testid="stat-accuracy">
                  {statsLoading ? "..." : `${userStats?.accuracy || 0}%`}
                </div>
                <div className="text-xs text-muted-foreground">Taxa de Acerto</div>
              </CardContent>
            </Card>
            
            <Card className="neon-border bg-card/30 text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-secondary neon-text" data-testid="stat-ai-level">
                  Nível {Math.min(10, Math.floor((userStats?.totalGames || 0) / 10) + 1)}
                </div>
                <div className="text-xs text-muted-foreground">IA Aprendizado</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Heat Map Preview */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary flex items-center">
              <Target className="h-5 w-5 mr-3 text-destructive" />
              Mapa de Calor - Mega-Sena
            </h3>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/heat-map'}
              className="text-primary hover:text-accent transition-all duration-300"
              data-testid="view-full-heatmap-button"
            >
              Ver Completo <span className="ml-1">→</span>
            </Button>
          </div>
          
          {megasenaFrequencies && megasenaFrequencies.length > 0 ? (
            <HeatMapGrid
              frequencies={megasenaFrequencies.slice(0, 60)} // Show first 60 numbers
              maxNumbers={60}
              isLoading={frequenciesLoading}
              onNumberClick={(number) => console.log(`Selected number: ${number}`)}
            />
          ) : (
            <Card className="neon-border bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  {frequenciesLoading ? "Carregando dados do mapa de calor..." : "Dados não disponíveis"}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* AI Analysis Section */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
            <Brain className="h-5 w-5 mr-3 text-secondary" />
            Análise Inteligente IA
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Status */}
            <Card className="neon-border bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-secondary flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Status do Sistema IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Learning Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Aprendizado</span>
                    <span className="text-secondary font-mono" data-testid="ai-learning-progress">
                      {userStats ? Math.min(100, Math.floor((userStats.totalGames / 100) * 100)) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full animate-pulse"
                      style={{ 
                        width: `${userStats ? Math.min(100, Math.floor((userStats.totalGames / 100) * 100)) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Processed Games */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jogos Processados:</span>
                  <span className="font-mono text-accent" data-testid="ai-processed-games">
                    {userStats?.totalGames || 0}
                  </span>
                </div>
                
                {/* Accuracy */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precisão Atual:</span>
                  <span className="font-mono text-neon-green" data-testid="ai-accuracy">
                    {userStats?.accuracy ? `+${userStats.accuracy}% acima da média` : "Coletando dados..."}
                  </span>
                </div>
                
                {/* AI Recommendation */}
                <Card className="bg-secondary/10 border border-secondary/30">
                  <CardContent className="p-3">
                    <div className="text-xs text-secondary mb-1">🤖 Recomendação IA</div>
                    <div className="text-sm text-foreground" data-testid="ai-recommendation">
                      {(aiAnalysis as any)?.result?.reasoning || "Analisando padrões dos últimos concursos..."}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="neon-border bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-accent flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Seus Últimos Resultados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gamesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-muted rounded w-24"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                          <div className="h-3 bg-muted rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentGames && recentGames.length > 0 ? (
                  recentGames.slice(0, 3).map((game, index) => {
                    const prizeWon = parseFloat(game.prizeWon || "0");
                    const hasWon = prizeWon > 0;
                    
                    return (
                      <div 
                        key={game.id}
                        className={`flex items-center justify-between p-3 bg-muted/20 rounded-lg ${!hasWon ? 'opacity-50' : ''}`}
                        data-testid={`recent-result-${index}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            hasWon ? 'bg-neon-green text-black' : 'bg-muted text-muted-foreground'
                          }`}>
                            {game.matches || 0}
                          </div>
                          <div>
                            <div className="text-sm font-medium" data-testid={`result-lottery-${index}`}>
                              {game.lotteryId} #{game.contestNumber}
                            </div>
                            <div className="text-xs text-muted-foreground" data-testid={`result-date-${index}`}>
                              {new Date(game.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${hasWon ? 'text-neon-green' : 'text-muted-foreground'}`} data-testid={`result-prize-${index}`}>
                            R$ {prizeWon.toFixed(2).replace('.', ',')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {hasWon ? `${game.matches} acertos` : 'Sem acerto'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum jogo encontrado</p>
                    <Button 
                      onClick={() => window.location.href = '/generator'}
                      className="mt-4"
                      variant="outline"
                      size="sm"
                    >
                      Gerar Primeiro Jogo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Winners Celebration */}
        {recentWinners && recentWinners.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
              <Trophy className="h-5 w-5 mr-3 text-neon-gold" />
              Últimas Comemorações 🎉
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentWinners.map((winner, index) => (
                <Card 
                  key={winner.id}
                  className="neon-border bg-gradient-to-br from-neon-gold/10 to-accent/5 backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-gold/5 to-transparent animate-scan"></div>
                  <CardContent className="p-4 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-neon-gold">🎉 PRÊMIO!</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(winner.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground mb-1" data-testid={`winner-amount-${index}`}>
                      R$ {parseFloat(winner.prizeWon || "0").toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`winner-details-${index}`}>
                      {winner.lotteryId} - {winner.matches} acertos
                    </div>
                    <div className="text-xs text-accent mt-2">
                      Usuário: {(user as any)?.firstName || 'Anônimo'}***
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Lotteries Quick Access */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-3 text-muted-foreground" />
            Todas as Modalidades
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {allLotteries.map((lottery) => (
              <Button
                key={lottery.id}
                onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
                variant="ghost"
                className="neon-border h-auto p-4 bg-card/20 hover:bg-card/40 transition-all duration-300 group text-center flex-col space-y-3"
                data-testid={`lottery-button-${lottery.id}`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${lottery.color} rounded-full flex items-center justify-center mx-auto group-hover:animate-pulse`}>
                  <span className="text-black text-lg">{lottery.icon}</span>
                </div>
                <div className="text-xs font-medium text-foreground">{lottery.name}</div>
              </Button>
            ))}
          </div>
        </section>
      </main>

      {/* Celebration Animation */}
      <CelebrationAnimation 
        isVisible={showCelebration}
        prizeAmount={celebrationPrize}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
