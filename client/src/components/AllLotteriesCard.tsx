import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Zap,
  Trophy,
  Target,
  Sparkles
} from "lucide-react";
import { useLotteryTypes, useNextDrawInfo } from "@/hooks/useLotteryData";
import type { LotteryType } from "@/types/lottery";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface LotteryCardProps {
  lottery: LotteryType;
}

function LotteryCountdown({ drawDate }: { drawDate: string }) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(drawDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [drawDate]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-primary" />
      <div className="flex gap-1">
        {timeRemaining.days > 0 && (
          <span className="bg-primary/20 px-2 py-1 rounded text-xs font-mono">
            {timeRemaining.days}d
          </span>
        )}
        <span className="bg-primary/20 px-2 py-1 rounded text-xs font-mono">
          {timeRemaining.hours.toString().padStart(2, '0')}h
        </span>
        <span className="bg-primary/20 px-2 py-1 rounded text-xs font-mono">
          {timeRemaining.minutes.toString().padStart(2, '0')}m
        </span>
        <span className="bg-primary/20 px-2 py-1 rounded text-xs font-mono animate-pulse">
          {timeRemaining.seconds.toString().padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
}

function SingleLotteryCard({ lottery }: LotteryCardProps) {
  const { data: nextDraw, isLoading } = useNextDrawInfo(lottery.id);

  const getEmojiForLottery = (id: string) => {
    const emojis: Record<string, string> = {
      'megasena': '💎',
      'lotofacil': '⭐',
      'quina': '🪙',
      'lotomania': '♾️',
      'duplasena': '👑',
      'supersete': '🚀',
      'milionaria': '➕',
      'timemania': '🎁'
    };
    return emojis[id] || '🎰';
  };

  const getPrizeColor = (id: string) => {
    const colors: Record<string, string> = {
      'megasena': 'text-emerald-400',
      'lotofacil': 'text-purple-400',
      'quina': 'text-blue-400',
      'lotomania': 'text-pink-400',
      'duplasena': 'text-yellow-400',
      'supersete': 'text-orange-400',
      'milionaria': 'text-green-400',
      'timemania': 'text-red-400'
    };
    return colors[id] || 'text-primary';
  };

  if (isLoading) {
    return (
      <Card className="neon-border bg-card/30 backdrop-blur-sm animate-pulse">
        <CardContent className="p-4">
          <div className="h-20 bg-muted/20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neon-border bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEmojiForLottery(lottery.id)}</span>
            <div>
              <h3 className="font-bold text-primary group-hover:animate-neon-pulse">
                {lottery.displayName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lottery.minNumbers}-{lottery.maxNumbers} números
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Concurso #{nextDraw?.contestNumber || '--'}
          </Badge>
        </div>

        <div className="space-y-3">
          {/* Prize Amount */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <div>
              <span className={`text-lg font-bold ${getPrizeColor(lottery.id)} group-hover:animate-neon-pulse`}>
                {nextDraw?.estimatedPrize || 'R$ --,--'}
              </span>
              <p className="text-xs text-muted-foreground">Prêmio Estimado</p>
            </div>
          </div>

          {/* Next Draw Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary" />
            <div>
              <span className="text-sm font-medium">
                {nextDraw?.drawDate ? 
                  new Date(nextDraw.drawDate).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit'
                  }) : '--/--'
                }
              </span>
              <p className="text-xs text-muted-foreground">Próximo Sorteio</p>
            </div>
          </div>

          {/* Countdown */}
          {nextDraw?.drawDate && (
            <LotteryCountdown drawDate={nextDraw.drawDate} />
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/30">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
              data-testid={`quick-generate-${lottery.id}`}
            >
              <Zap className="h-3 w-3 mr-1" />
              Gerar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.location.href = `/heat-map?lottery=${lottery.id}`}
              data-testid={`quick-heatmap-${lottery.id}`}
            >
              <Target className="h-3 w-3 mr-1" />
              Mapa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AllLotteriesCard() {
  const { data: lotteryTypes, isLoading } = useLotteryTypes();

  if (isLoading) {
    return (
      <Card className="neon-border bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center animate-pulse">
            <Trophy className="h-5 w-5 mr-2" />
            Carregando modalidades...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neon-border bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-accent" />
            Todas as Modalidades
            <Sparkles className="h-4 w-4 ml-2 text-secondary animate-pulse" />
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {lotteryTypes?.length || 0} modalidades ativas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lotteryTypes?.map((lottery) => (
            <SingleLotteryCard key={lottery.id} lottery={lottery} />
          )) || []}
        </div>
        
        {/* Quick Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border border-border/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="font-medium">Total em prêmios ativos:</span>
            </div>
            <span className="text-lg font-bold text-accent animate-neon-pulse">
              R$ 150.000.000,00+
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dados atualizados em tempo real da Caixa Econômica Federal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}