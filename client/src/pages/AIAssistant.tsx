
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Copy, Flame, Snowflake, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  visualizations?: any[];
  suggestions?: string[];
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou o assistente inteligente da **Shark Loterias**!\n\nPosso te ajudar a:\n\n🎲 Gerar jogos inteligentes\n🔥 Mostrar mapas de calor\n📊 Fazer análises completas\n🔮 Ver predições\n📈 Conferir resultados\n\nComo posso te ajudar hoje?',
      suggestions: ['Gerar 3 jogos para mega-sena', 'Mostrar mapa de calor', 'Ver predições', 'Analisar quina'],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest-user',
          message: messageText,
          context: {}
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        visualizations: data.visualizations,
        suggestions: data.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro no chat:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua mensagem',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para área de transferência'
    });
  };

  const renderVisualization = (viz: any) => {
    switch (viz.type) {
      case 'games':
        return (
          <div className="bg-black/20 rounded-lg p-4 my-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">🎲 {viz.content.lottery}</h4>
              <Badge variant="secondary">{viz.content.strategy}</Badge>
            </div>
            <div className="space-y-2">
              {viz.content.games.map((game: number[], idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-black/30 rounded p-3">
                  <div className="flex gap-2 flex-wrap">
                    {game.map((num: number) => (
                      <Badge
                        key={num}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                      >
                        {num.toString().padStart(2, '0')}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(game.join(' - '))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className="bg-black/20 rounded-lg p-4 my-3">
            <h4 className="font-semibold text-white mb-3">🔥 Mapa de Calor - {viz.content.lottery}</h4>
            <div className="grid grid-cols-10 gap-1 mb-4">
              {Array.from({ length: viz.content.maxNumbers }, (_, i) => {
                const number = i + 1;
                const freq = viz.content.frequencies.find((f: any) => f.number === number);
                const temp = freq?.temperature || 'cold';
                
                const colors = {
                  hot: 'bg-red-500',
                  warm: 'bg-yellow-500',
                  cold: 'bg-blue-500'
                };

                return (
                  <div
                    key={number}
                    className={`aspect-square ${colors[temp as keyof typeof colors]} rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                    title={`${number} - ${temp}`}
                  >
                    {number}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                <span>Quentes: {viz.content.stats.hot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span>Mornos: {viz.content.stats.warm}</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-blue-500" />
                <span>Frios: {viz.content.stats.cold}</span>
              </div>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="bg-black/20 rounded-lg p-4 my-3">
            <h4 className="font-semibold text-white mb-3">📊 Análise - {viz.content.lottery}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">Mais Frequentes</h5>
                <div className="flex flex-wrap gap-1">
                  {viz.content.mostFrequent.slice(0, 5).map((f: any) => (
                    <Badge key={f.number} className="bg-red-500 text-white">
                      {f.number}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">Menos Frequentes</h5>
                <div className="flex flex-wrap gap-1">
                  {viz.content.leastFrequent.slice(0, 5).map((f: any) => (
                    <Badge key={f.number} className="bg-blue-500 text-white">
                      {f.number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-300">
              {viz.content.sequences.length > 0 && (
                <p>🔗 Sequências detectadas: {viz.content.sequences.length}</p>
              )}
              <p>📈 Sorteios analisados: {viz.content.totalAnalyzed}</p>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="bg-black/20 rounded-lg p-4 my-3">
            <h4 className="font-semibold text-white mb-3">📊 Comparação de Modalidades</h4>
            <div className="space-y-2">
              {viz.content.comparison.map((c: any) => (
                <div key={c.id} className="bg-black/30 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{c.name}</h5>
                    <Badge variant="outline">{c.hotNumbers} quentes</Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {c.minNumbers}-{c.maxNumbers} números de {c.totalNumbers}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bot className="h-10 w-10 text-purple-400" />
            Assistente IA Completo
          </h1>
          <p className="text-gray-300">
            Gere jogos, veja análises, mapas de calor e muito mais através do chat
          </p>
        </div>

        <Card className="w-full h-[700px] flex flex-col neon-border bg-black/20">
          <CardHeader className="border-b border-border/20">
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Chat Inteligente
            </CardTitle>
            <CardDescription className="text-gray-400">
              Peça o que quiser: gerar jogos, análises, predições, mapas de calor...
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                          : 'bg-black/40 border border-border/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {msg.role === 'assistant' ? (
                          <Bot className="h-5 w-5 mt-1 text-purple-400 flex-shrink-0" />
                        ) : (
                          <User className="h-5 w-5 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="whitespace-pre-wrap break-words text-white">
                            {msg.content}
                          </div>
                          
                          {msg.visualizations?.map((viz, i) => (
                            <div key={i}>
                              {renderVisualization(viz)}
                            </div>
                          ))}

                          {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.suggestions.map((suggestion, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendMessage(suggestion)}
                                  className="text-xs bg-black/20 border-purple-500/30 hover:bg-purple-500/20 text-white"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs opacity-50 mt-2 block text-right">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-black/40 rounded-lg p-4 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5 animate-pulse text-purple-400" />
                        <span className="text-sm text-white">Processando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Digite sua mensagem... Ex: gerar 3 jogos para mega-sena"
                disabled={loading}
                className="bg-black/20 border-border/20 text-white placeholder:text-gray-500"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
