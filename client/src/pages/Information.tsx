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
  const lotteryData: LotteryInfo[] = [
    {
      id: 'megasena',
      name: 'Mega-Sena',
      displayName: 'MEGA-SENA',
      icon: '💎',
      color: 'neon-green',
      minNumbers: 6,
      maxNumbers: 15,
      totalNumbers: 60,
      drawDays: ['Quarta-feira', 'Sábado'],
      drawTime: '20:00',
      description: 'A maior e mais tradicional loteria do Brasil. Para ganhar na Sena, você deve acertar os 6 números sorteados.',
      minBet: 'R$ 5,00',
      maxBet: 'R$ 22.522,50',
      prizes: [
        { tier: 'Sena', matches: 6, probability: '1 em 50.063.860', avgPrize: 'R$ 30.000.000+' },
        { tier: 'Quina', matches: 5, probability: '1 em 154.518', avgPrize: 'R$ 50.000' },
        { tier: 'Quadra', matches: 4, probability: '1 em 2.332', avgPrize: 'R$ 1.000' },
      ]
    },
    {
      id: 'lotofacil',
      name: 'Lotofácil',
      displayName: 'LOTOFÁCIL',
      icon: '⭐',
      color: 'neon-purple',
      minNumbers: 15,
      maxNumbers: 20,
      totalNumbers: 25,
      drawDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      drawTime: '20:00',
      description: 'A loteria mais fácil de ganhar! Marque 15 números e torça para acertar 11, 12, 13, 14 ou 15.',
      minBet: 'R$ 3,00',
      maxBet: 'R$ 46.512,00',
      prizes: [
        { tier: '15 acertos', matches: 15, probability: '1 em 3.268.760', avgPrize: 'R$ 1.500.000+' },
        { tier: '14 acertos', matches: 14, probability: '1 em 21.791', avgPrize: 'R$ 1.500' },
        { tier: '13 acertos', matches: 13, probability: '1 em 691', avgPrize: 'R$ 30' },
        { tier: '12 acertos', matches: 12, probability: '1 em 60', avgPrize: 'R$ 12' },
        { tier: '11 acertos', matches: 11, probability: '1 em 11', avgPrize: 'R$ 6' },
      ]
    },
    {
      id: 'quina',
      name: 'Quina',
      displayName: 'QUINA',
      icon: '🪙',
      color: 'neon-pink',
      minNumbers: 5,
      maxNumbers: 15,
      totalNumbers: 80,
      drawDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      drawTime: '20:00',
      description: 'Escolha 5 números entre 80 disponíveis. Ganha quem acertar 2, 3, 4 ou 5 números.',
      minBet: 'R$ 2,50',
      maxBet: 'R$ 9.289,50',
      prizes: [
        { tier: 'Quina', matches: 5, probability: '1 em 24.040.016', avgPrize: 'R$ 10.000.000+' },
        { tier: 'Quadra', matches: 4, probability: '1 em 64.106', avgPrize: 'R$ 8.000' },
        { tier: 'Terno', matches: 3, probability: '1 em 866', avgPrize: 'R$ 120' },
        { tier: 'Duque', matches: 2, probability: '1 em 36', avgPrize: 'R$ 4' },
      ]
    },
    {
      id: 'lotomania',
      name: 'Lotomania',
      displayName: 'LOTOMANIA',
      icon: '♾️',
      color: 'primary',
      minNumbers: 50,
      maxNumbers: 50,
      totalNumbers: 100,
      drawDays: ['Terça', 'Quinta', 'Sábado'],
      drawTime: '20:00',
      description: 'Marque 50 números de 00 a 99. Ganha quem acertar 15, 16, 17, 18, 19, 20 números ou nenhum número!',
      minBet: 'R$ 3,00',
      maxBet: 'R$ 3,00',
      prizes: [
        { tier: '20 acertos', matches: 20, probability: '1 em 11.372.635', avgPrize: 'R$ 2.000.000+' },
        { tier: '0 acertos', matches: 0, probability: '1 em 11.372.635', avgPrize: 'R$ 2.000.000+' },
        { tier: '19 acertos', matches: 19, probability: '1 em 352.551', avgPrize: 'R$ 25.000' },
        { tier: '18 acertos', matches: 18, probability: '1 em 24.235', avgPrize: 'R$ 1.000' },
      ]
    },
    {
        id: 'loteca',
        name: 'Loteca',
        displayName: 'LOTECA',
        icon: '⚽',
        color: 'primary',
        minNumbers: 14,
        maxNumbers: 14,
        totalNumbers: 3,
        drawDays: ['Sábado'],
        drawTime: '20:00',
        description: 'A loteria dos palpites esportivos! Faça seus palpites em 14 jogos de futebol.',
        minBet: 'R$ 3,00',
        maxBet: 'R$ 3,00',
        prizes: [
          { tier: '14 acertos', matches: 14, probability: '1 em 4.782.969', avgPrize: 'R$ 500.000+' },
          { tier: '13 acertos', matches: 13, probability: '1 em 68.328', avgPrize: 'R$ 1.000' },
          { tier: '12 acertos', matches: 12, probability: '1 em 2.187', avgPrize: 'R$ 50' },
        ]
      },
  ];

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
          <Card className="neon-border bg-card/30 text-center">
            <CardContent className="p-4">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary neon-text">8</div>
              <div className="text-xs text-muted-foreground">Modalidades</div>
            </CardContent>
          </Card>

          <Card className="neon-border bg-card/30 text-center">
            <CardContent className="p-4">
              <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-accent neon-text">6x</div>
              <div className="text-xs text-muted-foreground">Sorteios/Semana</div>
            </CardContent>
          </Card>

          <Card className="neon-border bg-card/30 text-center">
            <CardContent className="p-4">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-neon-green" />
              <div className="text-2xl font-bold text-neon-green neon-text">R$ 2,50</div>
              <div className="text-xs text-muted-foreground">Aposta Mínima</div>
            </CardContent>
          </Card>

          <Card className="neon-border bg-card/30 text-center">
            <CardContent className="p-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-secondary neon-text">Milhões</div>
              <div className="text-xs text-muted-foreground">de Jogadores</div>
            </CardContent>
          </Card>
        </div>

        {/* How SHARK LOTO Works */}
        <Card className="neon-border bg-gradient-to-r from-secondary/10 to-primary/10 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-primary flex items-center">
              <Brain className="h-6 w-6 mr-2" />
              Como o SHARK LOTO Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 neon-border">
                  <Target className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground mb-2">1. Análise de Dados</h4>
                <p className="text-sm text-muted-foreground">
                  Coletamos dados oficiais da Loterias Caixa em tempo real e analisamos padrões históricos.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4 neon-border">
                  <Brain className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-foreground mb-2">2. IA Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Nossa IA processa estatísticas e identifica tendências para gerar estratégias otimizadas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-neon-gold rounded-full flex items-center justify-center mx-auto mb-4 neon-border">
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
        <Card className="neon-border bg-card/30 backdrop-blur-sm mb-8">
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
                        <h3 className={`text-lg font-bold ${getColorClass(lottery.color)} neon-text`}>
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
                      <div className="text-center p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Números</div>
                        <div className="font-bold text-foreground">
                          {lottery.minNumbers} - {lottery.maxNumbers}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total</div>
                        <div className="font-bold text-foreground">
                          1 a {lottery.totalNumbers}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Aposta Mín.</div>
                        <div className="font-bold text-neon-green">
                          {lottery.minBet}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-muted/20 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Sorteios</div>
                        <div className="font-bold text-foreground">
                          {lottery.drawTime}
                        </div>
                      </div>
                    </div>

                    {/* Prize Structure */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-neon-gold" />
                        Estrutura de Prêmios
                      </h4>
                      <div className="space-y-2">
                        {lottery.prizes.map((prize, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                                {prize.matches}
                              </Badge>
                              <div>
                                <div className="font-medium text-foreground">{prize.tier}</div>
                                <div className="text-xs text-muted-foreground">
                                  Probabilidade: {prize.probability}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-neon-green">{prize.avgPrize}</div>
                              <div className="text-xs text-muted-foreground">Prêmio médio</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Action */}
                    <div className="text-center pt-2">
                      <Button
                        onClick={() => window.location.href = `/generator?lottery=${lottery.id}`}
                        className="bg-gradient-to-r from-primary to-secondary"
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
          <Card className="neon-border bg-card/30">
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
                  <h4 className="font-medium text-foreground mb-1">Use a IA do SHARK LOTO</h4>
                  <p className="text-sm text-muted-foreground">
                    Nossa inteligência artificial aprende continuamente para otimizar suas chances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="neon-border bg-card/30">
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
                    O SHARK LOTO funciona online e offline. Você pode gerar jogos offline, 
                    mas precisa estar online para sincronizar dados e verificar resultados.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Legal Disclaimer */}
        <Card className="neon-border bg-gradient-to-r from-destructive/10 to-amber-500/10 border-destructive/30">
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
                  O SHARK LOTO é uma ferramenta de análise estatística. Não garantimos vitórias ou prêmios em qualquer modalidade de loteria.
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

            <div className="bg-muted/20 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Objetivo do SHARK LOTO</span>
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
              className="bg-gradient-to-r from-primary to-secondary"
              data-testid="start-playing-button"
            >
              <Zap className="h-4 w-4 mr-2" />
              Começar a Jogar
            </Button>

            <Button 
              onClick={() => window.location.href = '/heat-map'}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
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