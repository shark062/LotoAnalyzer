import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLotteryTypes } from "@/hooks/useLotteryData";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dice6, 
  Sparkles, 
  Zap, 
  Flame, 
  Snowflake, 
  Sun,
  Brain,
  Copy,
  Download,
  Share,
  RefreshCw,
  Target,
  Settings
} from "lucide-react";
import type { UserGame, LotteryType } from "@/types/lottery";

const generateGameSchema = z.object({
  lotteryId: z.string().min(1, "Selecione uma modalidade"),
  numbersCount: z.number().min(1, "Quantidade de dezenas inválida"),
  gamesCount: z.number().min(1, "Quantidade de jogos inválida").max(100, "Máximo 100 jogos"),
  strategy: z.enum(['hot', 'cold', 'mixed', 'ai']),
});

type GenerateGameForm = z.infer<typeof generateGameSchema>;

interface GeneratedGame {
  numbers: number[];
  strategy: string;
  confidence?: number;
  reasoning?: string;
}

export default function Generator() {
  const [location] = useLocation();
  const [generatedGames, setGeneratedGames] = useState<GeneratedGame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const preselectedLottery = urlParams.get('lottery');
  const preselectedNumber = urlParams.get('number');

  // Data queries
  const { data: lotteryTypes, isLoading: lotteriesLoading } = useLotteryTypes();

  // Form setup
  const form = useForm<GenerateGameForm>({
    resolver: zodResolver(generateGameSchema),
    defaultValues: {
      lotteryId: preselectedLottery || '',
      numbersCount: undefined,
      gamesCount: undefined,
      strategy: 'mixed',
    },
  });

  const selectedLotteryId = form.watch('lotteryId');
  const selectedLottery = lotteryTypes?.find(l => l.id === selectedLotteryId);

  // Update numbers count when lottery changes
  useEffect(() => {
    if (selectedLottery) {
      form.setValue('numbersCount', selectedLottery.minNumbers);
    }
  }, [selectedLottery, form]);

  // Generate games mutation
  const generateGamesMutation = useMutation({
    mutationFn: async (data: GenerateGameForm) => {
      const response = await apiRequest('POST', '/api/games/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedGames(data.map((game: UserGame) => ({
        numbers: game.selectedNumbers,
        strategy: game.strategy || 'mixed',
      })));
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      toast({
        title: "Jogos Gerados!",
        description: `${data.length} jogo(s) gerado(s) com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao Gerar Jogos",
        description: "Não foi possível gerar os jogos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: GenerateGameForm) => {
    setIsGenerating(true);
    try {
      await generateGamesMutation.mutateAsync(data);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStrategyInfo = (strategy: string) => {
    const strategies = {
      hot: {
        icon: <Flame className="h-4 w-4 text-destructive" />,
        emoji: '🔥',
        name: 'Números Quentes',
        description: 'Foca nos números que mais saem',
        color: 'text-destructive',
      },
      cold: {
        icon: <Snowflake className="h-4 w-4 text-primary" />,
        emoji: '❄️',
        name: 'Números Frios',
        description: 'Foca nos números que menos saem',
        color: 'text-primary',
      },
      mixed: {
        icon: <Sun className="h-4 w-4 text-amber-500" />,
        emoji: '♨️',
        name: 'Estratégia Mista',
        description: '40% quentes, 30% mornos, 30% frios',
        color: 'text-amber-500',
      },
      ai: {
        icon: <Brain className="h-4 w-4 text-secondary" />,
        emoji: '🤖',
        name: 'IA Avançada',
        description: 'Análise inteligente com padrões',
        color: 'text-secondary',
      },
    };
    return strategies[strategy as keyof typeof strategies] || strategies.mixed;
  };

  const getNumberStyle = (number: number, strategy: string) => {
    // Simulate temperature based on strategy and number
    // In real app, this would use actual frequency data
    const mod = number % 3;
    
    if (strategy === 'hot' || (strategy === 'mixed' && mod === 0)) {
      return "bg-gradient-to-br from-destructive to-red-600 text-white neon-text";
    } else if (strategy === 'cold' || (strategy === 'mixed' && mod === 2)) {
      return "bg-gradient-to-br from-blue-600 to-primary text-white";
    } else {
      return "bg-gradient-to-br from-amber-500 to-orange-500 text-white";
    }
  };

  const copyToClipboard = (numbers: number[]) => {
    const text = numbers.join(' - ');
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Números copiados para a área de transferência.",
    });
  };

  const exportGames = () => {
    const content = generatedGames.map((game, index) => 
      `Jogo ${index + 1}: ${game.numbers.join(' - ')}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jogos-shark-loto.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold neon-text text-primary mb-2" data-testid="generator-title">
            Gerador Inteligente 🔮
          </h2>
          <p className="text-muted-foreground">
            Gere jogos com estratégias baseadas em IA e análise estatística
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Form */}
          <Card className="neon-border bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações do Jogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Lottery Selection */}
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Modalidade
                  </Label>
                  <Select 
                    value={form.watch('lotteryId')} 
                    onValueChange={(value) => form.setValue('lotteryId', value)}
                    disabled={lotteriesLoading}
                  >
                    <SelectTrigger data-testid="lottery-selector">
                      <SelectValue placeholder="Escolha a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {lotteryTypes?.map((lottery) => (
                        <SelectItem key={lottery.id} value={lottery.id}>
                          {lottery.displayName} ({lottery.minNumbers}-{lottery.maxNumbers} números)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.lotteryId && (
                    <p className="text-destructive text-sm mt-1">{form.formState.errors.lotteryId.message}</p>
                  )}
                </div>

                {/* Numbers Count */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                      <Dice6 className="h-4 w-4 mr-2 text-accent" />
                      Dezenas
                    </Label>
                    <Input
                      type="number"
                      min={selectedLottery?.minNumbers || 1}
                      max={selectedLottery?.maxNumbers || 60}
                      placeholder="Ex: 6"
                      {...form.register('numbersCount', { valueAsNumber: true })}
                      className="bg-input border-border"
                      data-testid="numbers-count-input"
                    />
                    {selectedLottery && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Mín: {selectedLottery.minNumbers}, Máx: {selectedLottery.maxNumbers}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                      <Copy className="h-4 w-4 mr-2 text-secondary" />
                      Qtd. Jogos
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="Ex: 3"
                      {...form.register('gamesCount', { valueAsNumber: true })}
                      className="bg-input border-border"
                      data-testid="games-count-input"
                    />
                  </div>
                </div>

                {/* Strategy Selection */}
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                    <Brain className="h-4 w-4 mr-2 text-secondary" />
                    Estratégia de Números
                  </Label>
                  <div className="space-y-3">
                    {(['hot', 'cold', 'mixed', 'ai'] as const).map((strategy) => {
                      const info = getStrategyInfo(strategy);
                      const isSelected = form.watch('strategy') === strategy;
                      
                      return (
                        <Card 
                          key={strategy}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary' 
                              : 'bg-muted/10 border-border hover:bg-muted/20 hover:border-primary/50'
                          }`}
                          onClick={() => form.setValue('strategy', strategy)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-background">
                                  {info.icon}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground flex items-center">
                                    {info.name}
                                    <span className="ml-2 text-lg">{info.emoji}</span>
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {info.description}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Strategy Details */}
                {form.watch('strategy') && (
                  <Card className="bg-gradient-to-r from-accent/5 to-secondary/5 border-accent/30">
                    <CardContent className="p-4">
                      <h5 className="font-medium text-accent mb-3 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Como Funciona: {getStrategyInfo(form.watch('strategy')).name}
                      </h5>
                      <div className="space-y-2">
                        {form.watch('strategy') === 'hot' && (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center mb-2">
                              <Flame className="h-4 w-4 mr-2 text-destructive" />
                              <span className="font-medium">Foco em números frequentes</span>
                            </div>
                            <ul className="space-y-1 ml-6">
                              <li>• Seleciona números que saíram mais vezes recentemente</li>
                              <li>• Baseado na tendência de repetição</li>
                              <li>• Ideal para quem acredita em "sequências quentes"</li>
                            </ul>
                          </div>
                        )}
                        {form.watch('strategy') === 'cold' && (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center mb-2">
                              <Snowflake className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">Foco em números atrasados</span>
                            </div>
                            <ul className="space-y-1 ml-6">
                              <li>• Seleciona números que não saem há mais tempo</li>
                              <li>• Baseado na teoria de compensação</li>
                              <li>• Ideal para quem acredita que "tudo se equilibra"</li>
                            </ul>
                          </div>
                        )}
                        {form.watch('strategy') === 'mixed' && (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center mb-2">
                              <Sun className="h-4 w-4 mr-2 text-amber-500" />
                              <span className="font-medium">Estratégia equilibrada</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center p-2 bg-destructive/10 rounded">
                                <div className="font-bold text-destructive">40%</div>
                                <div className="text-xs">🔥 Quentes</div>
                              </div>
                              <div className="text-center p-2 bg-amber-500/10 rounded">
                                <div className="font-bold text-amber-500">30%</div>
                                <div className="text-xs">♨️ Mornos</div>
                              </div>
                              <div className="text-center p-2 bg-primary/10 rounded">
                                <div className="font-bold text-primary">30%</div>
                                <div className="text-xs">❄️ Frios</div>
                              </div>
                            </div>
                            <p className="text-xs">Combina diferentes temperaturas para balancear riscos e oportunidades</p>
                          </div>
                        )}
                        {form.watch('strategy') === 'ai' && (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center mb-2">
                              <Brain className="h-4 w-4 mr-2 text-secondary" />
                              <span className="font-medium">Inteligência artificial avançada</span>
                            </div>
                            <ul className="space-y-1 ml-6">
                              <li>• Analisa padrões complexos nos dados históricos</li>
                              <li>• Considera múltiplas variáveis simultâneas</li>
                              <li>• Algoritmo de machine learning otimizado</li>
                              <li>• Recomendado para jogadores experientes</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generate Button */}
                <Button
                  type="submit"
                  disabled={isGenerating || !selectedLottery}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-4 text-lg hover:animate-glow transition-all duration-300 font-bold"
                  data-testid="generate-games-button"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      GERANDO JOGOS...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      GERAR JOGOS INTELIGENTES
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Games */}
          <Card className="neon-border bg-card/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-accent flex items-center">
                <Dice6 className="h-5 w-5 mr-2" />
                Jogos Gerados
              </CardTitle>
              {generatedGames.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportGames}
                    data-testid="export-games-button"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedGames.length > 0 ? (
                generatedGames.map((game, index) => {
                  const strategyInfo = getStrategyInfo(game.strategy);
                  
                  return (
                    <Card key={index} className="bg-muted/20 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-primary">
                              Jogo #{index + 1}
                            </span>
                            <Badge variant="secondary" className={`${strategyInfo.color} text-xs`}>
                              {strategyInfo.emoji} {strategyInfo.name}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(game.numbers)}
                            data-testid={`copy-game-${index}-button`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {game.numbers.map((number) => (
                            <Badge
                              key={number}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                getNumberStyle(number, game.strategy)
                              }`}
                              data-testid={`game-${index}-number-${number}`}
                            >
                              {number.toString().padStart(2, '0')}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Estratégia: {strategyInfo.description}
                          {game.confidence && ` • Confiança: ${Math.round(game.confidence * 100)}%`}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Dice6 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Nenhum jogo gerado ainda</p>
                  <p className="text-sm">Configure os parâmetros e clique em "Gerar Jogos"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {generatedGames.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex gap-4">
              <Button 
                onClick={() => window.location.href = '/heat-map'}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                data-testid="view-heatmap-button"
              >
                <Flame className="h-4 w-4 mr-2" />
                Ver Mapa de Calor
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/results'}
                className="bg-gradient-to-r from-accent to-neon-gold"
                data-testid="view-results-button"
              >
                <Target className="h-4 w-4 mr-2" />
                Verificar Resultados
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
