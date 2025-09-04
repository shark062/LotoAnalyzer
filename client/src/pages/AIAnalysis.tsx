import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLotteryTypes, useUserStats } from "@/hooks/useLotteryData";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Sparkles,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle,
  Activity,
  Eye,
  Calculator,
  Calendar
} from "lucide-react";

interface AIAnalysisResult {
  id: number;
  lotteryId: string;
  analysisType: string;
  result: any;
  confidence: string;
  createdAt: string;
}

interface PatternAnalysis {
  pattern: string;
  frequency: number;
  lastOccurrence: string;
  predictedNext: number[];
}

interface PredictionResult {
  primaryPrediction: number[];
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    numbers: number[];
    strategy: string;
  }>;
  riskLevel: string;
}

interface StrategyRecommendation {
  recommendedStrategy: string;
  reasoning: string;
  numberSelection: {
    hotPercentage: number;
    warmPercentage: number;
    coldPercentage: number;
  };
  riskLevel: string;
  playFrequency: string;
  budgetAdvice: string;
  expectedImprovement: string;
}

export default function AIAnalysis() {
  const [selectedLottery, setSelectedLottery] = useState<string>('megasena');
  const [activeTab, setActiveTab] = useState<'pattern' | 'prediction' | 'strategy'>('prediction');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Data queries
  const { data: lotteryTypes } = useLotteryTypes();
  const { data: userStats } = useUserStats();

  // AI Analysis queries
  const { data: patternAnalysis, isLoading: patternLoading, refetch: refetchPattern } = useQuery<AIAnalysisResult>({
    queryKey: ["/api/ai/analysis", selectedLottery, "type=pattern"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: predictionAnalysis, isLoading: predictionLoading, refetch: refetchPrediction } = useQuery<AIAnalysisResult>({
    queryKey: ["/api/ai/analysis", selectedLottery, "type=prediction"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: strategyAnalysis, isLoading: strategyLoading, refetch: refetchStrategy } = useQuery<AIAnalysisResult>({
    queryKey: ["/api/ai/analysis", selectedLottery, "type=strategy"],
    staleTime: 5 * 60 * 1000,
  });

  // Generate new analysis mutation
  const analyzeWithAI = useMutation({
    mutationFn: async (analysisType: string) => {
      const response = await apiRequest('POST', '/api/ai/analyze', {
        lotteryId: selectedLottery,
        analysisType,
      });
      return response.json();
    },
    onSuccess: (data, analysisType) => {
      // Refetch the appropriate analysis
      if (analysisType === 'pattern') refetchPattern();
      else if (analysisType === 'prediction') refetchPrediction();
      else if (analysisType === 'strategy') refetchStrategy();
      
      toast({
        title: "Análise Concluída",
        description: "A IA terminou a análise com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro na Análise",
        description: "Não foi possível completar a análise. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = async (analysisType: string) => {
    setIsAnalyzing(true);
    try {
      await analyzeWithAI.mutateAsync(analysisType);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedLotteryData = lotteryTypes?.find(l => l.id === selectedLottery);

  const getConfidenceColor = (confidence: string | number) => {
    const conf = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
    if (conf >= 0.8) return "text-neon-green";
    if (conf >= 0.6) return "text-accent";
    if (conf >= 0.4) return "text-amber-500";
    return "text-destructive";
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': case 'conservative': return "text-neon-green";
      case 'medium': case 'balanced': return "text-accent";
      case 'high': case 'aggressive': return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const aiLearningProgress = userStats ? Math.min(100, Math.floor((userStats.totalGames / 100) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold neon-text text-primary mb-2" data-testid="ai-analysis-title">
            Análises Inteligentes 🤖
          </h2>
          <p className="text-muted-foreground">
            Análise avançada com inteligência artificial para otimizar suas estratégias
          </p>
        </div>

        {/* AI Status Overview */}
        <Card className="neon-border bg-gradient-to-r from-secondary/10 to-primary/10 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto mb-3 text-secondary" />
                <div className="text-2xl font-bold text-secondary neon-text" data-testid="ai-level">
                  Nível {Math.min(10, Math.floor((userStats?.totalGames || 0) / 10) + 1)}
                </div>
                <div className="text-sm text-muted-foreground">Sistema IA</div>
              </div>
              
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-primary neon-text" data-testid="learning-progress">
                  {aiLearningProgress}%
                </div>
                <div className="text-sm text-muted-foreground">Aprendizado</div>
                <Progress value={aiLearningProgress} className="mt-2 h-2" />
              </div>
              
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-accent" />
                <div className="text-2xl font-bold text-accent neon-text" data-testid="accuracy-improvement">
                  +{userStats?.accuracy || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Melhoria</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-48" data-testid="lottery-selector">
              <SelectValue placeholder="Selecione a modalidade" />
            </SelectTrigger>
            <SelectContent>
              {lotteryTypes?.map((lottery) => (
                <SelectItem key={lottery.id} value={lottery.id}>
                  {lottery.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            {(['pattern', 'prediction', 'strategy'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "bg-gradient-to-r from-primary to-secondary neon-border" : ""}
                data-testid={`tab-${tab}`}
              >
                {tab === 'pattern' && <Eye className="h-4 w-4 mr-2" />}
                {tab === 'prediction' && <Brain className="h-4 w-4 mr-2" />}
                {tab === 'strategy' && <Target className="h-4 w-4 mr-2" />}
                {tab === 'pattern' ? 'Padrões' : tab === 'prediction' ? 'Predições' : 'Estratégias'}
              </Button>
            ))}
          </div>
        </div>

        {/* Analysis Content */}
        <div className="space-y-6">
          {/* Pattern Analysis */}
          {activeTab === 'pattern' && (
            <Card className="neon-border bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-primary flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Análise de Padrões
                </CardTitle>
                <Button
                  onClick={() => handleAnalyze('pattern')}
                  disabled={isAnalyzing}
                  variant="outline"
                  size="sm"
                  data-testid="analyze-patterns-button"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analisando...' : 'Nova Análise'}
                </Button>
              </CardHeader>
              <CardContent>
                {patternLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-4 bg-muted/20 rounded-lg animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : patternAnalysis?.result?.patterns ? (
                  <div className="space-y-4">
                    {(patternAnalysis.result.patterns as PatternAnalysis[]).map((pattern, index) => (
                      <Card key={index} className="bg-muted/20 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{pattern.pattern}</h4>
                            <Badge variant="secondary" className="font-mono">
                              {pattern.frequency}% frequência
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-3">
                            Última ocorrência: {pattern.lastOccurrence}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-muted-foreground mr-2">Próximos preditos:</span>
                              {pattern.predictedNext.map((num) => (
                                <Badge key={num} variant="outline" className="text-xs">
                                  {num.toString().padStart(2, '0')}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.location.href = `/generator?lottery=${selectedLottery}&numbers=${pattern.predictedNext.join(',')}`}
                              data-testid={`use-pattern-${index}`}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Usar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Nenhuma análise de padrões disponível</p>
                    <p className="text-sm mb-6">Clique em "Nova Análise" para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Prediction Analysis */}
          {activeTab === 'prediction' && (
            <Card className="neon-border bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-secondary flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Predições IA
                </CardTitle>
                <Button
                  onClick={() => handleAnalyze('prediction')}
                  disabled={isAnalyzing}
                  variant="outline"
                  size="sm"
                  data-testid="analyze-prediction-button"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analisando...' : 'Nova Predição'}
                </Button>
              </CardHeader>
              <CardContent>
                {predictionLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="p-6 bg-muted/20 rounded-lg">
                      <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="flex space-x-2 mb-4">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-12 h-12 bg-muted rounded-full"></div>
                        ))}
                      </div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ) : predictionAnalysis?.result ? (
                  <div className="space-y-6">
                    {/* Primary Prediction */}
                    <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/30">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-secondary flex items-center">
                            <Sparkles className="h-5 w-5 mr-2" />
                            Predição Principal
                          </h4>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getConfidenceColor(predictionAnalysis.result.confidence)}`}>
                              {Math.round((predictionAnalysis.result.confidence || 0) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Confiança</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(predictionAnalysis.result.primaryPrediction || []).map((number: number, index: number) => (
                            <Badge
                              key={index}
                              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-secondary to-primary text-white neon-text"
                              data-testid={`prediction-number-${number}`}
                            >
                              {number.toString().padStart(2, '0')}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-4">
                          <strong>Reasoning:</strong> {predictionAnalysis.result.reasoning}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className={`${getRiskLevelColor(predictionAnalysis.result.riskLevel)} border-current`}
                          >
                            Risco: {predictionAnalysis.result.riskLevel}
                          </Badge>
                          
                          <Button
                            onClick={() => window.location.href = `/generator?lottery=${selectedLottery}&numbers=${(predictionAnalysis.result.primaryPrediction || []).join(',')}`}
                            className="bg-gradient-to-r from-secondary to-primary"
                            data-testid="use-prediction-button"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Usar Predição
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Alternative Predictions */}
                    {predictionAnalysis.result.alternatives && predictionAnalysis.result.alternatives.length > 0 && (
                      <div>
                        <h5 className="text-lg font-semibold text-foreground mb-4">Alternativas</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {predictionAnalysis.result.alternatives.slice(0, 4).map((alt: any, index: number) => (
                            <Card key={index} className="bg-muted/20 border-border/50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h6 className="font-medium text-foreground">{alt.strategy}</h6>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.location.href = `/generator?lottery=${selectedLottery}&numbers=${alt.numbers.join(',')}`}
                                    data-testid={`use-alternative-${index}`}
                                  >
                                    Usar
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {alt.numbers.map((num: number, numIndex: number) => (
                                    <Badge key={numIndex} variant="secondary" className="text-xs">
                                      {num.toString().padStart(2, '0')}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Nenhuma predição disponível</p>
                    <p className="text-sm mb-6">Clique em "Nova Predição" para gerar análise</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Strategy Analysis */}
          {activeTab === 'strategy' && (
            <Card className="neon-border bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-accent flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recomendações Estratégicas
                </CardTitle>
                <Button
                  onClick={() => handleAnalyze('strategy')}
                  disabled={isAnalyzing}
                  variant="outline"
                  size="sm"
                  data-testid="analyze-strategy-button"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analisando...' : 'Nova Análise'}
                </Button>
              </CardHeader>
              <CardContent>
                {strategyLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ) : strategyAnalysis?.result ? (
                  <div className="space-y-6">
                    {/* Strategy Overview */}
                    <Card className="bg-gradient-to-r from-accent/10 to-neon-gold/10 border-accent/30">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-accent flex items-center">
                            <Lightbulb className="h-5 w-5 mr-2" />
                            {strategyAnalysis.result.recommendedStrategy}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`${getRiskLevelColor(strategyAnalysis.result.riskLevel)} border-current`}
                          >
                            {strategyAnalysis.result.riskLevel}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-6">
                          {strategyAnalysis.result.reasoning}
                        </p>

                        {/* Number Selection Distribution */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-destructive">
                              {strategyAnalysis.result.numberSelection?.hotPercentage || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">🔥 Quentes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-amber-500">
                              {strategyAnalysis.result.numberSelection?.warmPercentage || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">♨️ Mornos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {strategyAnalysis.result.numberSelection?.coldPercentage || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">❄️ Frios</div>
                          </div>
                        </div>

                        <Button
                          onClick={() => window.location.href = `/generator?lottery=${selectedLottery}&strategy=${strategyAnalysis.result.recommendedStrategy.toLowerCase()}`}
                          className="w-full bg-gradient-to-r from-accent to-neon-gold"
                          data-testid="apply-strategy-button"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Aplicar Estratégia
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Additional Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-muted/20 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            <h5 className="font-semibold">Frequência de Jogo</h5>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {strategyAnalysis.result.playFrequency}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/20 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Calculator className="h-5 w-5 mr-2 text-neon-green" />
                            <h5 className="font-semibold">Gestão de Orçamento</h5>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {strategyAnalysis.result.budgetAdvice}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Expected Improvement */}
                    <Card className="bg-neon-green/10 border-neon-green/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-neon-green" />
                            <span className="font-semibold">Melhoria Esperada</span>
                          </div>
                          <div className="text-xl font-bold text-neon-green">
                            {strategyAnalysis.result.expectedImprovement}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Nenhuma estratégia disponível</p>
                    <p className="text-sm mb-6">Clique em "Nova Análise" para gerar recomendações</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="text-center mt-8">
          <div className="inline-flex gap-4">
            <Button 
              onClick={() => window.location.href = '/generator'}
              className="bg-gradient-to-r from-primary to-secondary"
              data-testid="go-to-generator-button"
            >
              <Zap className="h-4 w-4 mr-2" />
              Ir para Gerador
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/heat-map'}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              data-testid="view-heatmap-button"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Mapa de Calor
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
