
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="neon-border bg-card/30 backdrop-blur-sm animate-pulse">
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
    <Card className={`neon-border bg-gradient-to-br ${getGradientClass(lottery.id)} backdrop-blur-sm hover:scale-105 transition-all duration-300 relative overflow-hidden group`}>
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
    <Card className="neon-border bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-accent" />
            Todas as Modalidades
            <Sparkles className="h-4 w-4 ml-2 text-secondary animate-pulse" />
          </div>
          <Badge variant="secondary" className="animate-pulse">
            {lotteryTypes.length} modalidades ativas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {lotteryTypes.map((lottery) => (
            <SingleLotteryCard key={lottery.id} lottery={lottery} />
          ))}
        </div>
        
        {/* Quick Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border border-border/30">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="font-medium">Total em prêmios oficiais:</span>
            </div>
            <span className="text-lg font-bold text-accent animate-pulse">
              Dados da Caixa
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Todas as modalidades com dados oficiais da Caixa Econômica Federal • Atualizações automáticas
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={() => window.location.href = '/generator'}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 text-sm neon-border hover:animate-glow transition-all duration-300"
            >
              <Zap className="h-4 w-4 mr-2" />
              Gerar Jogos
            </Button>
            
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/sync/latest-draws', { method: 'POST' });
                  const data = await response.json();
                  console.log('Sync completed:', data.message);
                  window.location.reload();
                } catch (error) {
                  console.error('Sync error:', error);
                }
              }}
              variant="outline"
              size="sm"
              className="text-xs border-accent/30 hover:bg-accent/10 transition-all duration-300"
            >
              🔄 Atualizar da Caixa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
