import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLotteryTypes, useNextDrawInfo } from "@/hooks/useLotteryData";
import { 
  Trophy, 
  TrendingUp, 
  Sparkles,
  Calendar,
  DollarSign,
  Clock,
  Zap,
  Target
} from "lucide-react";
import type { LotteryType } from "@/types/lottery";

interface LotteryCardProps {
  lottery: LotteryType;
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

  const getGradientClass = (id: string) => {
    const gradients: Record<string, string> = {
      'megasena': 'from-emerald-500/20 to-green-600/20',
      'lotofacil': 'from-purple-500/20 to-violet-600/20',
      'quina': 'from-blue-500/20 to-cyan-600/20',
      'lotomania': 'from-pink-500/20 to-rose-600/20',
      'duplasena': 'from-yellow-500/20 to-amber-600/20',
      'supersete': 'from-orange-500/20 to-red-600/20',
      'milionaria': 'from-green-500/20 to-emerald-600/20',
      'timemania': 'from-red-500/20 to-pink-600/20'
    };
    return gradients[id] || 'from-primary/20 to-secondary/20';
  };

  if (isLoading) {
    return (
      <Card className="border border-border/30 bg-card/20 backdrop-blur-sm animate-pulse">
        <CardContent className="p-4">
          <div className="h-24 bg-muted/20 rounded mb-3"></div>
          <div className="h-4 bg-muted/20 rounded mb-2"></div>
          <div className="h-3 bg-muted/20 rounded mb-4"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-muted/20 rounded flex-1"></div>
            <div className="h-8 bg-muted/20 rounded flex-1"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/30 bg-card/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 relative overflow-hidden group opacity-80">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-scan"></div>
      <CardContent className="p-4 relative z-10">
        <div className="text-center mb-3">
          <div className="text-3xl mb-2">{getEmojiForLottery(lottery.id)}</div>
          <h3 className="font-bold text-lg text-foreground mb-1" data-testid={`lottery-name-${lottery.id}`}>
            {lottery.displayName}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lottery.minNumbers}-{lottery.maxNumbers} números • {lottery.totalNumbers} disponíveis
          </p>
        </div>

        <div className="space-y-2 mb-4 text-center">
          {nextDraw ? (
            <>
              <div className="flex items-center justify-center space-x-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Concurso #{nextDraw.contestNumber}
                </span>
              </div>

              <div className={`text-lg font-bold ${getPrizeColor(lottery.id)} neon-text`} data-testid={`lottery-prize-${lottery.id}`}>
                {nextDraw.estimatedPrize}
              </div>

              {nextDraw.timeRemaining && (
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="h-3 w-3 text-accent" />
                  <span className="text-xs font-mono text-accent">
                    {nextDraw.timeRemaining.days}d {nextDraw.timeRemaining.hours}h {nextDraw.timeRemaining.minutes}m
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Carregando dados...</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs hover:bg-primary/10"
            onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
            data-testid={`quick-generate-${lottery.id}`}
          >
            <Zap className="h-3 w-3 mr-1" />
            Gerar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs hover:bg-accent/10"
            onClick={() => window.location.href = `/heat-map?lottery=${lottery.id}`}
            data-testid={`quick-heatmap-${lottery.id}`}
          >
            <Target className="h-3 w-3 mr-1" />
            Mapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AllLotteriesCard() {
  const { data: lotteryTypes, isLoading: lotteriesLoading } = useLotteryTypes();

  const allLotteries = [
    { 
      id: 'megasena', 
      name: 'Mega-Sena', 
      icon: '💎', 
      description: '6-15 números • 60 disponíveis',
      nextPrize: '45.000.000,00',
      nextDraw: '2d 0h 7m',
      bgClass: 'from-emerald-500/20 via-green-600/20 to-teal-500/20',
      borderClass: 'border-emerald-500/40'
    },
    { 
      id: 'lotofacil', 
      name: 'Lotofácil', 
      icon: '⭐', 
      description: '15-20 números • 25 disponíveis',
      nextPrize: '1.500.000,00',
      nextDraw: '1d 12h 30m',
      bgClass: 'from-purple-500/20 via-violet-600/20 to-indigo-500/20',
      borderClass: 'border-purple-500/40'
    },
    { 
      id: 'quina', 
      name: 'Quina', 
      icon: '🪙', 
      description: '5-15 números • 80 disponíveis',
      nextPrize: '8.500.000,00',
      nextDraw: '0d 18h 45m',
      bgClass: 'from-pink-500/20 via-rose-600/20 to-red-500/20',
      borderClass: 'border-pink-500/40'
    },
    { 
      id: 'lotomania', 
      name: 'Lotomania', 
      icon: '♾️', 
      description: '50-50 números • 100 disponíveis',
      nextPrize: '500.000,00',
      nextDraw: '2d 0h 7m',
      bgClass: 'from-cyan-500/20 via-blue-600/20 to-indigo-500/20',
      borderClass: 'border-cyan-500/40'
    },
    { 
      id: 'duplasena', 
      name: 'Dupla Sena', 
      icon: '👑', 
      description: '6-15 números • 50 disponíveis',
      nextPrize: '7.000.000,00',
      nextDraw: '2d 0h 7m',
      bgClass: 'from-yellow-500/20 via-amber-600/20 to-orange-500/20',
      borderClass: 'border-yellow-500/40'
    },
    { 
      id: 'supersete', 
      name: 'Super Sete', 
      icon: '🚀', 
      description: '7 colunas • 10 números cada',
      nextPrize: '2.500.000,00',
      nextDraw: '1d 6h 15m',
      bgClass: 'from-violet-500/20 via-purple-600/20 to-fuchsia-500/20',
      borderClass: 'border-violet-500/40'
    },
    { 
      id: 'milionaria', 
      name: '+Milionária', 
      icon: '➕', 
      description: '6+2 trevos • 50+6 disponíveis',
      nextPrize: '100.000.000,00',
      nextDraw: '3d 8h 20m',
      bgClass: 'from-amber-500/20 via-yellow-600/20 to-lime-500/20',
      borderClass: 'border-amber-500/40'
    },
    { 
      id: 'timemania', 
      name: 'Timemania', 
      icon: '🎁', 
      description: '10 números • 80 disponíveis',
      nextPrize: '3.200.000,00',
      nextDraw: '1d 14h 30m',
      bgClass: 'from-red-500/20 via-pink-600/20 to-rose-500/20',
      borderClass: 'border-red-500/40'
    },
    { 
      id: 'diadesore', 
      name: 'Dia de Sorte', 
      icon: '🌟', 
      description: '7 números • 31 disponíveis',
      nextPrize: '800.000,00',
      nextDraw: '0d 22h 10m',
      bgClass: 'from-teal-500/20 via-cyan-600/20 to-blue-500/20',
      borderClass: 'border-teal-500/40'
    },
    { 
      id: 'loteca', 
      name: 'Loteca', 
      icon: '⚽', 
      description: '14 jogos • 3 resultados',
      nextPrize: '450.000,00',
      nextDraw: '2d 10h 40m',
      bgClass: 'from-green-500/20 via-emerald-600/20 to-teal-500/20',
      borderClass: 'border-green-500/40'
    }
  ];

  if (lotteriesLoading) {
    return (
      <Card className="neon-border bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-accent animate-pulse" />
              Carregando Modalidades...
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="neon-border bg-card/30 backdrop-blur-sm animate-pulse">
                <CardContent className="p-4">
                  <div className="h-24 bg-muted/20 rounded mb-3"></div>
                  <div className="h-4 bg-muted/20 rounded mb-2"></div>
                  <div className="h-3 bg-muted/20 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted/20 rounded flex-1"></div>
                    <div className="h-8 bg-muted/20 rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lotteryTypes || lotteryTypes.length === 0) {
    return (
      <Card className="neon-border bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-destructive" />
              Erro ao Carregar Modalidades
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            Não foi possível carregar as modalidades de loteria
          </div>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-cyan-400 flex items-center justify-center mb-2">
          <TrendingUp className="h-6 w-6 mr-3" />
          Todas as Modalidades
        </h3>
        <p className="text-gray-400">Próximos sorteios • Análise em tempo real • IA integrada</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6">
        {allLotteries.map((lottery) => (
          <Card
            key={lottery.id}
            className={`neon-border bg-gradient-to-br ${lottery.bgClass} backdrop-blur-sm border ${lottery.borderClass} rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group`}
            onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
            data-testid={`lottery-card-${lottery.id}`}
          >
            <CardContent className="p-8 text-center">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center group-hover:animate-pulse">
                <span className="text-3xl">{lottery.icon}</span>
              </div>

              {/* Lottery Name */}
              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                {lottery.name}
              </h4>

              {/* Info */}
              <div className="text-sm text-gray-300 mb-4">
                {lottery.description}
              </div>

              {/* Prize Info */}
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-1">Próximo concurso</div>
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  R$ {lottery.nextPrize}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {lottery.nextDraw}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl border border-gray-600 hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/generator?lottery=${lottery.id}`;
                  }}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar
                </Button>
                <Button
                  className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl border border-gray-600 hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/heat-map?lottery=${lottery.id}`;
                  }}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Mapa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}