import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Info,
  AlertTriangle,
  BookOpen,
  Shield,
  Target,
  DollarSign,
  Clock,
  Users,
  Zap,
  Brain,
  Calculator,
  HelpCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { useLotteryTypes } from "@/hooks/useLotteryData";

interface LotteryInfo {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  minNumbers: number;
  maxNumbers: number;
  totalNumbers: number;
  drawDays: string[];
  drawTime: string;
  description: string;
  minBet: string;
  maxBet: string;
  prizes: Array<{
    tier: string;
    matches: number;
    probability: string;
    avgPrize: string;
  }>;
}

export default function Information() {
  // Helper functions for lottery information - moved before component to fix initialization error
  const getEmojiForLottery = (id: string) => {
    const emojis: Record<string, string> = {
      'megasena': '💎',
      'lotofacil': '⭐',
      'quina': '🪙',
      'lotomania': '♾️',
      'duplasena': '👑',
      'supersete': '🚀',
      'milionaria': '➕',
      'timemania': '🎁',
      'diadesore': '🌟',
      'loteca': '⚽'
    };
    return emojis[id] || '🎰';
  };

  const getPrizeColor = (id: string) => {
    const colors: Record<string, string> = {
      'megasena': 'text-emerald-400',
      'lotofacil': 'text-purple-400',
      'quina': 'text-yellow-400',
      'lotomania': 'text-pink-400',
      'duplasena': 'text-yellow-400',
      'supersete': 'text-red-400',
      'milionaria': 'text-green-400',
      'timemania': 'text-rose-400',
      'diadesore': 'text-cyan-400',
      'loteca': 'text-orange-400'
    };
    return colors[id] || 'text-pink-400';
  };

  const getCategoriesForLottery = (id: string) => {
    const categories: Record<string, Array<{name: string, probability: string, prize: string}>> = {
      'megasena': [
        { name: 'Sena (6 números)', probability: '1 em 50.063.860', prize: 'Estimado' },
        { name: 'Quina (5 números)', probability: '1 em 154.518', prize: 'Fixo' },
        { name: 'Quadra (4 números)', probability: '1 em 2.332', prize: 'Fixo' },
      ],
      'lotofacil': [
        { name: '15 números', probability: '1 em 3.268.760', prize: 'Estimado' },
        { name: '14 números', probability: '1 em 21.791', prize: 'Fixo' },
        { name: '13 números', probability: '1 em 691', prize: 'Fixo' },
        { name: '12 números', probability: '1 em 60', prize: 'Fixo' },
        { name: '11 números', probability: '1 em 11', prize: 'Fixo' },
      ],
      'quina': [
        { name: 'Quina (5 números)', probability: '1 em 24.040.016', prize: 'Estimado' },
        { name: 'Quadra (4 números)', probability: '1 em 64.106', prize: 'Fixo' },
        { name: 'Terno (3 números)', probability: '1 em 866', prize: 'Fixo' },
      ],
      'lotomania': [
        { name: '20 números', probability: '1 em 11.372.635', prize: 'Estimado' },
        { name: '19 números', probability: '1 em 352.551', prize: 'Fixo' },
        { name: '18 números', probability: '1 em 24.235', prize: 'Fixo' },
        { name: '17 números', probability: '1 em 2.776', prize: 'Fixo' },
        { name: '16 números', probability: '1 em 472', prize: 'Fixo' },
        { name: '0 números', probability: '1 em 11.372.635', prize: 'Especial' },
      ],
      'duplasena': [
        { name: 'Sena (6 números)', probability: '1 em 15.890.700', prize: 'Estimado' },
        { name: 'Quina (5 números)', probability: '1 em 60.192', prize: 'Fixo' },
        { name: 'Quadra (4 números)', probability: '1 em 1.357', prize: 'Fixo' },
        { name: 'Terno (3 números)', probability: '1 em 81', prize: 'Fixo' },
      ],
      'supersete': [
        { name: '7 colunas', probability: '1 em 10.000.000', prize: 'Estimado' },
        { name: '6 colunas', probability: '1 em 1.000.000', prize: 'Fixo' },
        { name: '5 colunas', probability: '1 em 100.000', prize: 'Fixo' },
        { name: '4 colunas', probability: '1 em 10.000', prize: 'Fixo' },
        { name: '3 colunas', probability: '1 em 1.000', prize: 'Fixo' },
      ],
      'milionaria': [
        { name: '6 + 2 trevos', probability: '1 em 238.360.500', prize: 'Estimado' },
        { name: '6 + 1 trevo', probability: '1 em 79.453.500', prize: 'Fixo' },
        { name: '6 + 0 trevos', probability: '1 em 39.726.750', prize: 'Fixo' },
        { name: '5 + 2 trevos', probability: '1 em 1.357.510', prize: 'Fixo' },
      ],
      'timemania': [
        { name: '7 números', probability: '1 em 26.472.637', prize: 'Estimado' },
        { name: '6 números', probability: '1 em 216.103', prize: 'Fixo' },
        { name: '5 números', probability: '1 em 5.220', prize: 'Fixo' },
        { name: '4 números', probability: '1 em 276', prize: 'Fixo' },
        { name: '3 números', probability: '1 em 29', prize: 'Fixo' },
      ],
      'diadesore': [
        { name: '7 números + mês', probability: '1 em 2.629.575', prize: 'Estimado' },
        { name: '7 números', probability: '1 em 219.298', prize: 'Fixo' },
        { name: '6 números + mês', probability: '1 em 39.761', prize: 'Fixo' },
        { name: '6 números', probability: '1 em 3.314', prize: 'Fixo' },
        { name: '5 números + mês', probability: '1 em 1.169', prize: 'Fixo' },
        { name: '5 números', probability: '1 em 97', prize: 'Fixo' },
        { name: '4 números', probability: '1 em 15', prize: 'Fixo' },
      ],
      'loteca': [
        { name: '14 jogos', probability: '1 em 4.782.969', prize: 'Estimado' },
        { name: '13 jogos', probability: '1 em 54.182', prize: 'Fixo' },
      ],
    };
    return categories[id] || [];
  };

  const getDescriptionForLottery = (id: string) => {
    const descriptions: Record<string, string> = {
      'megasena': 'A maior e mais famosa loteria do Brasil. Sorteios às quartas e sábados.',
      'lotofacil': 'A loteria mais fácil de ganhar! Sorteios de segunda a sábado.',
      'quina': 'Sorteios diários com ótimas chances de premiação.',
      'lotomania': 'Escolha 50 números e concorra a prêmios milionários.',
      'duplasena': 'Uma aposta, dois sorteios! Mais chances de ganhar.',
      'supersete': 'Modalidade com sorteios três vezes por semana.',
      'milionaria': 'A loteria com os maiores prêmios do Brasil.',
      'timemania': 'A loteria do seu time do coração.',
      'diadesore': 'Escolha números e o mês da sorte.',
      'loteca': 'Palpites esportivos com grandes prêmios.',
    };
    return descriptions[id] || 'Modalidade de loteria com grandes prêmios.';
  };

  const getTipsForLottery = (id: string) => {
    const tips: Record<string, string[]> = {
      'megasena': [
        'Evite sequências numéricas como 1-2-3-4-5-6',
        'Distribua os números por toda a cartela',
        'Considere jogar com números que não saíram recentemente',
        'Use a estratégia mista: números quentes e frios'
      ],
      'lotofacil': [
        'Equilibre números das extremidades (1-5 e 21-25)',
        'Use estratégia de fechamento para reduzir custos',
        'Considere números que saem com mais frequência',
        'Evite apostar apenas em números baixos ou altos'
      ],
      'quina': [
        'Distribua os números pelas dezenas (1-10, 11-20, etc.)',
        'Misture números pares e ímpares',
        'Observe os números mais sorteados recentemente',
        'Use fechamentos para aumentar as chances'
      ],
      'lotomania': [
        'Distribua os números por toda a cartela (1 a 100)',
        'Evite concentrar números em poucas dezenas',
        'Considere a estratégia do zero (não acertar nenhum)',
        'Use fechamentos inteligentes para reduzir custos'
      ],
      'duplasena': [
        'Lembre-se: são dois sorteios por aposta',
        'Distribua números equilibradamente (1 a 50)',
        'Evite sequências óbvias',
        'Considere números que não saíram recentemente'
      ],
      'supersete': [
        'Escolha números de 0 a 9 para cada coluna',
        'Varie os números por coluna',
        'Evite repetir muitos números',
        'Use estratégias de fechamento'
      ],
      'milionaria': [
        'Escolha 6 números principais + 2 trevos',
        'Distribua bem os números de 1 a 50',
        'Os trevos vão de 1 a 6',
        'Combine números quentes e frios'
      ],
      'timemania': [
        'Escolha 10 números de 1 a 80',
        'Distribua por todas as dezenas',
        'Escolha seu time do coração',
        'Misture números pares e ímpares'
      ],
      'diadesore': [
        'Escolha 7 números de 1 a 31',
        'Selecione o mês da sorte',
        'Distribua números pelo calendário',
        'Considere datas especiais'
      ],
      'loteca': [
        'Analise o desempenho dos times',
        'Considere jogos em casa e fora',
        'Estude estatísticas recentes',
        'Varie entre 1, X e 2'
      ],
    };
    return tips[id] || [
      'Distribua os números equilibradamente',
      'Evite sequências óbvias',
      'Considere números quentes e frios',
      'Use estratégias de fechamento'
    ];
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'neon-green': 'text-neon-green',
      'neon-purple': 'text-neon-purple',
      'neon-pink': 'text-neon-pink',
      'primary': 'text-primary',
      'accent': 'text-accent',
    };
    return colorMap[color] || 'text-primary';
  };

  // Use lottery data from the system
  const { data: lotteryTypes, isLoading: lotteriesLoading } = useLotteryTypes();

  // Map lottery data with complete information
  const lotteryData = lotteryTypes?.map(lottery => ({
    id: lottery.id,
    name: lottery.name,
    displayName: lottery.displayName,
    icon: getEmojiForLottery(lottery.id),
    color: getPrizeColor(lottery.id),
    minNumbers: lottery.minNumbers,
    maxNumbers: lottery.maxNumbers,
    totalNumbers: lottery.totalNumbers,
    drawDays: lottery.drawDays || [],
    drawTime: lottery.drawTime || '20:00',
    categories: getCategoriesForLottery(lottery.id),
    description: getDescriptionForLottery(lottery.id),
    tips: getTipsForLottery(lottery.id),
    minBet: 'R$ 2,50' // Default minimum bet
  })) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold neon-text text-primary mb-2" data-testid="information-title">
            Informações 📚
          </h2>
          <p className="text-muted-foreground">
            Tudo que você precisa saber sobre as loterias federais
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="neon-border bg-black/20 text-center">
            <CardContent className="p-4">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary neon-text">{lotteryData.length}</div>
              <div className="text-xs text-muted-foreground">Modalidades</div>
            </CardContent>
          </Card>

          <Card className="neon-border bg-black/20 text-center">
            <CardContent className="p-4">
              <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-accent neon-text">6x</div>
              <div className="text-xs text-muted-foreground">Sorteios/Semana</div>
            </CardContent>
          </Card>

          <Card className="neon-border bg-black/20 text-center">
            <CardContent className="p-4">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-neon-green" />
              <div className="text-2xl font-bold text-neon-green neon-text">R$ 2,50</div>
              <div className="text-xs text-muted-foreground">Aposta Mínima</div>
            </CardContent>
          </Card>

          <Card className="neon-border bg-black/20 text-center">
            <CardContent className="p-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-secondary neon-text">Milhões</div>
              <div className="text-xs text-muted-foreground">de Jogadores</div>
            </CardContent>
          </Card>
        </div>

        {/* How Shark Loterias Works */}
        <Card className="neon-border bg-black/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Brain className="h-6 w-6 mr-2" />
              Como o Shark Loterias Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-black/20">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground mb-2">1. Análise de Dados</h4>
                <p className="text-sm text-muted-foreground">
                  Coletamos dados oficiais da Loterias Caixa em tempo real e analisamos padrões históricos.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black/20">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground mb-2">2. IA Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Nossa IA processa estatísticas e identifica tendências para gerar estratégias otimizadas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black/20">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground mb-2">3. Geração Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Geramos jogos baseados em números quentes, frios e estratégias mistas para maximizar chances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lottery Information */}
        <Card className="neon-border bg-black/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-accent flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Guia das Modalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {lotteryData.map((lottery) => (
                <AccordionItem key={lottery.id} value={lottery.id} className="border border-border/50 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline" data-testid={`lottery-accordion-${lottery.id}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lottery.icon}</span>
                      <div className="text-left">
                        <h3 className={`text-lg font-bold ${getPrizeColor(lottery.id)} neon-text`}>
                          {lottery.displayName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {lottery.minNumbers}-{lottery.maxNumbers} números • {lottery.drawDays.join(', ')}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {/* Description */}
                    <p className="text-muted-foreground">{lottery.description}</p>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-black/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Números</div>
                        <div className="font-bold text-foreground">
                          {lottery.minNumbers} - {lottery.maxNumbers}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-black/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total</div>
                        <div className="font-bold text-foreground">
                          1 a {lottery.totalNumbers}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-black/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Aposta Mín.</div>
                        <div className="font-bold text-neon-green">
                          {lottery.minBet}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-black/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Sorteios</div>
                        <div className="font-bold text-foreground">
                          {lottery.drawTime}
                        </div>
                      </div>
                    </div>

                    {/* Prize Structure */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-neon-green" />
                        Estrutura de Prêmios
                      </h4>
                      <div className="space-y-2">
                        {lottery.categories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="text-xs px-2 py-1">
                                {index + 1}º
                              </Badge>
                              <div>
                                <div className="font-medium text-foreground">{category.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Probabilidade: {category.probability}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-neon-green">{category.prize}</div>
                              <div className="text-xs text-muted-foreground">Prêmio</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Action */}
                    <div className="text-center pt-2">
                      <Button
                        onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
                        className="bg-black/20"
                        data-testid={`play-${lottery.id}-button`}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Jogar {lottery.name}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Tips and Strategies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tips */}
          <Card className="neon-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-secondary flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-neon-green mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Jogue com Responsabilidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Estabeleça um orçamento e nunca aposte mais do que pode perder.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-neon-green mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Use Estratégias Diversificadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Combine números quentes, frios e mornos para equilibrar suas chances.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-neon-green mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Acompanhe Resultados</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitore seus jogos e analise padrões para melhorar estratégias.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-neon-green mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Use a IA do Shark Loterias</h4>
                  <p className="text-sm text-muted-foreground">
                    Nossa inteligência artificial aprende continuamente para otimizar suas chances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="neon-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-accent flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="faq-1" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-medium text-left">
                    Como funciona a análise de números quentes e frios?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Analisamos a frequência dos números nos últimos 20 concursos. Números que saíram mais vezes são "quentes",
                    os que saíram menos são "frios", e os intermediários são "mornos".
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-medium text-left">
                    A IA realmente aumenta as chances de ganhar?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Nossa IA otimiza estratégias baseadas em dados históricos e padrões estatísticos,
                    mas não pode garantir prêmios. O objetivo é maximizar as chances dentro das probabilidades matemáticas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3" className="border-b border-border/50">
                  <AccordionTrigger className="text-sm font-medium text-left">
                    Os dados são realmente oficiais?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    Sim, coletamos todos os dados diretamente do site oficial da Loterias Caixa,
                    garantindo informações atualizadas e confiáveis.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4" className="border-b-0">
                  <AccordionTrigger className="text-sm font-medium text-left">
                    Posso jogar offline?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    O Shark Loterias funciona online e offline. Você pode gerar jogos offline,
                    mas precisa estar online para sincronizar dados e verificar resultados.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Legal Disclaimer */}
        <Card className="neon-border bg-black/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Aviso Legal e Isenção de Responsabilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Não Garantimos Prêmios</h4>
                <p className="text-sm text-muted-foreground">
                  O Shark Loterias é uma ferramenta de análise estatística. Não garantimos vitórias ou prêmios em qualquer modalidade de loteria.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Jogo Responsável</h4>
                <p className="text-sm text-muted-foreground">
                  Loterias envolvem riscos. Jogue apenas o que pode perder e procure ajuda se desenvolver problemas com jogos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Isenção de Responsabilidade</h4>
                <p className="text-sm text-muted-foreground">
                  Não nos responsabilizamos por perdas financeiras. Nossa função é fornecer análises estatísticas para fins educacionais.
                </p>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Objetivo do Shark Loterias</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Nossa missão é fornecer ferramentas de análise estatística avançada para ajudar usuários a tomar
                decisões mais informadas, sempre dentro dos limites das probabilidades matemáticas das loterias.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="text-center mt-8">
          <div className="inline-flex gap-4">
            <Button
              onClick={() => window.location.href = '/generator'}
              className="bg-black/20"
              data-testid="start-playing-button"
            >
              <Zap className="h-4 w-4 mr-2" />
              Começar a Jogar
            </Button>

            <Button
              onClick={() => window.location.href = '/heat-map'}
              variant="outline"
              className="border-primary text-primary hover:bg-black/20"
              data-testid="view-analysis-button"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Análises
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}