import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import AllLotteriesCard from "@/components/AllLotteriesCard";
import HeatMapGrid from "@/components/HeatMapGrid";
import CelebrationAnimation from "@/components/CelebrationAnimation";
import CyberpunkEffects, { useCyberpunkEffects } from "@/components/CyberpunkEffects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLotteryTypes, useNextDrawInfo, useNumberFrequencies, useUserStats } from "@/hooks/useLotteryData";
import { useAuth } from "@/hooks/useAuth";

import { useSharkAI } from "@/lib/sharkAI";
import { useSharkGamification } from "@/lib/gamification";
import { useSecureStorage } from "@/lib/secureStorage";
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
  Star,
  Shield,
  Gamepad2,

  Coins,
  Award,
  Wifi,
  WifiOff
} from "lucide-react";
import type { UserGame } from "@/types/lottery";

// Componente de efeito typewriter para mensagens da IA Shark
function TypewriterText({ text, speed = 80, className = "" }: { text: string; speed?: number; className?: string }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [previousText, setPreviousText] = useState("");

  // Reset quando o texto mudar
  useEffect(() => {
    if (text && text !== previousText) {
      setPreviousText(text);
      setDisplayText("");
      setCurrentIndex(0);
      setIsTyping(true);
    }
  }, [text, previousText]);

  // Efeito de digitação
  useEffect(() => {
    if (!isTyping || !text) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      // Terminou de digitar
      setIsTyping(false);
    }
  }, [currentIndex, text, speed, isTyping]);

  return (
    <span className={className}>
      {displayText}
      {isTyping && <span className="animate-pulse text-neon-pink ml-1">|</span>}
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPrize, setCelebrationPrize] = useState<string>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sharkAIMessage, setSharkAIMessage] = useState<string>("");
  const [showSharkMode, setShowSharkMode] = useState(false);

  // Hooks das funcionalidades avançadas
  const cyberpunkEffects = useCyberpunkEffects();
  const sharkAI = useSharkAI();
  const gamification = useSharkGamification();
  const secureStorage = useSecureStorage();

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
        cyberpunkEffects.triggerGlitch(3000); // Efeito visual
      }
    }
  }, [recentGames, showCelebration, cyberpunkEffects]);

  // IA Shark analisando dados ao carregar
  useEffect(() => {
    if (megasenaFrequencies && megasenaFrequencies.length > 0) {
      const randomNumbers = [1, 15, 23, 35, 44, 58]; // Exemplo
      const analysis = sharkAI.analyzeNumbers(randomNumbers, 'megasena', megasenaFrequencies);
      setSharkAIMessage(analysis.message);

      // Registrar análise na gamificação
      gamification.onAnalysisPerformed('megasena', 0.75);
    }
  }, [megasenaFrequencies, sharkAI, gamification]);

  // Inicialização da IA Shark com dados de fallback
  useEffect(() => {
    if (!megasenaFrequencies || megasenaFrequencies.length === 0) {
      const fallbackAnalysis = sharkAI.analyzeNumbers([1, 15, 23, 35, 44, 58], 'megasena');
      setSharkAIMessage(fallbackAnalysis.message);
    }
  }, [sharkAI]);

  // Funções para controlar as funcionalidades
  const activateSharkMode = () => {
    setShowSharkMode(true);
    cyberpunkEffects.activateSharkMode();

    // IA Shark em modo agressivo
    const aggressiveAnalysis = sharkAI.analyzeStrategy('aggressive', recentGames || []);
    setSharkAIMessage(aggressiveAnalysis.message);

    setTimeout(() => setShowSharkMode(false), 5000);
  };

  const performQuickAnalysis = () => {
    gamification.onAnalysisPerformed('megasena', Math.random());
    cyberpunkEffects.triggerGlitch(1000);

    const numbers = Array.from({length: 6}, () => Math.floor(Math.random() * 60) + 1);
    const analysis = sharkAI.analyzeNumbers(numbers, 'megasena', megasenaFrequencies);
    setSharkAIMessage(analysis.message);
  };

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
    { id: 'loteca', name: 'Loteca', icon: '⚽', color: 'from-neon-green to-primary' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative">

      {/* Efeitos Cyberpunk */}
      <CyberpunkEffects 
        intensity={showSharkMode ? 'high' : 'medium'}
        glitchActive={cyberpunkEffects.glitchActive}
        matrixRain={cyberpunkEffects.matrixRain}
        scanLines={cyberpunkEffects.scanLines}
      />

      <Navigation />

      <main className={`container mx-auto px-4 py-4 relative z-40 ${isMenuOpen ? 'hidden' : ''}`}>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center lg:hidden">
          <Button 
            onClick={() => {
              performQuickAnalysis();
              setTimeout(() => window.location.href = '/generator', 500);
            }}
            className="bg-black/20 neon-border hover:animate-pulse transition-all duration-300"
            data-testid="quick-generate-button"
          >
            <Zap className="h-4 w-4 mr-2" />
            Gerar Jogos Rápido
          </Button>
          <Button 
            onClick={() => {
              window.location.href = '/results';
            }}
            className="bg-black/20 neon-border"
            data-testid="quick-results-button"
          >
            <History className="h-4 w-4 mr-2" />
            Ver Resultados
          </Button>
          <Button 
            onClick={performQuickAnalysis}
            className="bg-black/20 neon-border hover:bg-neon-cyan/10 text-neon-cyan"
            data-testid="quick-analysis-button"
          >
            <Brain className="h-4 w-4 mr-2" />
            Análise Shark
          </Button>
        </div>

        {/* All Lotteries - Complete Dashboard */}
        <section className="mb-6">
          <AllLotteriesCard />
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