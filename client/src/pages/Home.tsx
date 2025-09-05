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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      
      <main className={`container mx-auto px-4 py-8 ${isMenuOpen ? 'hidden' : ''}`}>
        {/* Status Indicators */}
        <div className="text-center mb-6">
          <p className="text-lg text-muted-foreground mb-4">
            Central de Comando • Análise Inteligente das Loterias Federais
          </p>
          
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm bg-neon-green/10 text-neon-green px-3 py-1.5 rounded-full border border-neon-green/30">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="font-mono font-semibold">Dados Oficiais Caixa</span>
            </div>
            <div className="flex items-center gap-1 text-sm bg-black/20 text-secondary px-3 py-1.5 rounded-full border border-secondary/30">
              <Brain className="w-4 h-4" />
              <span className="font-mono font-semibold">IA ChatGPT Ativa</span>
            </div>
            <div className="flex items-center gap-1 text-sm bg-black/20 text-accent px-3 py-1.5 rounded-full border border-accent/30">
              <Activity className="w-4 h-4" />
              <span className="font-mono font-semibold">Análise Tempo Real</span>
            </div>
            <div className="flex items-center gap-1 text-sm bg-black/20 text-primary px-3 py-1.5 rounded-full border border-primary/30">
              <Star className="w-4 h-4" />
              <span className="font-mono font-semibold">10 Modalidades</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center lg:hidden">
          <Button 
            onClick={() => window.location.href = '/generator'}
            className="bg-black/20"
            data-testid="quick-generate-button"
          >
            <Zap className="h-4 w-4 mr-2" />
            Gerar Jogos Rápido
          </Button>
          <Button 
            onClick={() => window.location.href = '/results'}
            className="bg-black/20"
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
                className="neon-border h-auto p-4 bg-transparent hover:bg-black/10 transition-all duration-300 group text-center flex-col space-y-3"
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

      {/* Developer Footer */}
      <footer className="text-center py-4 mt-8 border-t border-border/20">
        <p className="text-xs text-muted-foreground">
          powered by <span className="text-accent font-semibold">Shark062</span>
        </p>
      </footer>

      {/* Celebration Animation */}
      <CelebrationAnimation 
        isVisible={showCelebration}
        prizeAmount={celebrationPrize}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
