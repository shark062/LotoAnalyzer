
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import AIChat from '@/components/AIChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLotteryTypes } from '@/hooks/useLotteryData';
import { Brain, Zap, MessageSquare } from 'lucide-react';

export default function AIAssistant() {
  const [selectedLottery, setSelectedLottery] = useState('megasena');
  const { data: lotteryTypes } = useLotteryTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="h-10 w-10 text-purple-400" />
            Assistente IA Híbrida
          </h1>
          <p className="text-gray-300">
            Combine o poder de 4 IAs avançadas com análise local para previsões ultra-precisas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Multi-IA Fusion
              </CardTitle>
              <CardDescription>
                OpenAI GPT-4 + Gemini Pro + DeepSeek + Claude 3
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Sistema de fusão ponderada com auto-tuning baseado em performance real
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                3 Personas
              </CardTitle>
              <CardDescription>
                Escolha o estilo de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Analista (técnico), Lek do Black (agressivo) ou Coach (motivador)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white">Loteria Ativa</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedLottery} onValueChange={setSelectedLottery}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lotteryTypes?.map(lt => (
                    <SelectItem key={lt.id} value={lt.id}>
                      {lt.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <AIChat lotteryId={selectedLottery} />
      </div>
    </div>
  );
}
