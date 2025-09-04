import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLotteryTypes } from "@/hooks/useLotteryData";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Target,
  Zap,
  Trophy,
  TrendingUp
} from "lucide-react";

export default function AllLotteriesCard() {
  const { data: lotteryTypes, isLoading } = useLotteryTypes();

  // Mock data for next draws - in real app this would come from API
  const mockNextDraws = {
    megasena: {
      contestNumber: 2819,
      drawDate: "2024-12-07",
      estimatedPrize: "R$ 5.000.000,00",
      timeRemaining: { days: 2, hours: 8, minutes: 45 }
    },
    lotofacil: {
      contestNumber: 3256,
      drawDate: "2024-12-06",
      estimatedPrize: "R$ 1.700.000,00", 
      timeRemaining: { days: 1, hours: 8, minutes: 45 }
    },
    quina: {
      contestNumber: 6612,
      drawDate: "2024-12-05",
      estimatedPrize: "R$ 850.000,00",
      timeRemaining: { days: 0, hours: 8, minutes: 45 }
    },
    lotomania: {
      contestNumber: 2856,
      drawDate: "2024-12-06",
      estimatedPrize: "R$ 500.000,00",
      timeRemaining: { days: 1, hours: 20, minutes: 15 }
    },
    duplasena: {
      contestNumber: 2856,
      drawDate: "2024-12-05", 
      estimatedPrize: "R$ 7.000.000,00",
      timeRemaining: { days: 0, hours: 20, minutes: 15 }
    }
  };

  const lotteries = [
    {
      id: 'megasena',
      name: 'Mega-Sena',
      icon: '💎',
      color: 'from-neon-green to-primary',
      accentColor: 'text-neon-green',
      description: '6-15 números • 60 disponíveis',
      nextDraw: mockNextDraws.megasena
    },
    {
      id: 'lotofacil', 
      name: 'Lotofácil',
      icon: '⭐',
      color: 'from-neon-purple to-secondary',
      accentColor: 'text-neon-purple',
      description: '15-20 números • 25 disponíveis',
      nextDraw: mockNextDraws.lotofacil
    },
    {
      id: 'quina',
      name: 'Quina', 
      icon: '🪙',
      color: 'from-neon-pink to-destructive',
      accentColor: 'text-neon-pink',
      description: '5-15 números • 80 disponíveis',
      nextDraw: mockNextDraws.quina
    },
    {
      id: 'lotomania',
      name: 'Lotomania',
      icon: '♾️', 
      color: 'from-primary to-neon-cyan',
      accentColor: 'text-primary',
      description: '50-50 números • 100 disponíveis',
      nextDraw: mockNextDraws.lotomania
    },
    {
      id: 'duplasena',
      name: 'Dupla Sena',
      icon: '👑',
      color: 'from-accent to-neon-gold', 
      accentColor: 'text-accent',
      description: '6-15 números • 50 disponíveis',
      nextDraw: mockNextDraws.duplasena
    }
  ];

  const formatTimeRemaining = (timeRemaining: { days: number; hours: number; minutes: number }) => {
    const { days, hours, minutes } = timeRemaining;
    return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="dark-card animate-pulse">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-6 bg-muted rounded w-32 mb-1"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </div>
              <div className="h-20 bg-muted rounded mb-4"></div>
              <div className="h-16 bg-muted rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {lotteries.map((lottery) => (
        <div 
          key={lottery.id}
          className="dark-card hover:animate-float transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="p-6 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${lottery.color} rounded-full flex items-center justify-center animate-pulse-slow`}>
                  <span className="text-black text-xl font-bold">{lottery.icon}</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${lottery.accentColor} neon-text`}>
                    {lottery.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lottery.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Contest Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-center">
                <span className="font-mono text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1 inline" />
                  Concurso #{lottery.nextDraw.contestNumber}
                </span>
              </div>

              {/* Prize Amount */}
              <div className={`bg-gradient-to-r ${lottery.color} bg-opacity-10 rounded-lg p-4 text-center border border-opacity-20`}>
                <div className={`font-bold text-2xl ${lottery.accentColor} neon-text mb-1`}>
                  {lottery.nextDraw.estimatedPrize}
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-muted/20 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1 text-accent" />
                  {formatTimeRemaining(lottery.nextDraw.timeRemaining)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
                className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all duration-300 rounded-lg"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Gerar
              </Button>

              <Button 
                onClick={() => window.location.href = `/heat-map?lottery=${lottery.id}`}
                className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-all duration-300 rounded-lg"
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Mapa
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}