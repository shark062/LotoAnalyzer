
import { storage } from "../server/storage";
import { aiService } from "../server/aiService";
import { lotteryService } from "../server/services/lotteryService";

interface AccuracyTest {
  lotteryId: string;
  totalTests: number;
  uniqueGames: number;
  averageMatches: number;
  bestMatch: number;
  probabilityScore: number;
}

async function testAccuracy(): Promise<void> {
  console.log('🧪 Iniciando testes de acertividade...\n');

  const lotteries = ['megasena', 'lotofacil', 'quina'];
  const results: AccuracyTest[] = [];

  for (const lotteryId of lotteries) {
    console.log(`\n📊 Testando ${lotteryId}...`);
    
    try {
      // Obter dados reais
      const latestDraws = await storage.getLatestDraws(lotteryId, 10);
      const lottery = await storage.getLotteryType(lotteryId);
      
      if (!lottery || latestDraws.length === 0) {
        console.log(`❌ Dados insuficientes para ${lotteryId}`);
        continue;
      }

      // Gerar múltiplos jogos para verificar unicidade
      const generatedGames: number[][] = [];
      for (let i = 0; i < 10; i++) {
        const game = await lotteryService.generateGames({
          lotteryId,
          numbersCount: lottery.minNumbers,
          gamesCount: 1,
          strategy: 'ai',
          userId: 'test-user'
        });
        generatedGames.push(game[0].selectedNumbers);
      }

      // Verificar unicidade
      const uniqueGames = new Set(generatedGames.map(g => g.join(','))).size;
      
      // Comparar com sorteios reais
      let totalMatches = 0;
      let bestMatch = 0;

      for (const game of generatedGames) {
        for (const draw of latestDraws) {
          const matches = game.filter(n => draw.drawnNumbers.includes(n)).length;
          totalMatches += matches;
          bestMatch = Math.max(bestMatch, matches);
        }
      }

      const averageMatches = totalMatches / (generatedGames.length * latestDraws.length);
      
      // Calcular probabilidade teórica
      const probabilityScore = (averageMatches / lottery.minNumbers) * 100;

      results.push({
        lotteryId,
        totalTests: generatedGames.length,
        uniqueGames,
        averageMatches: Number(averageMatches.toFixed(2)),
        bestMatch,
        probabilityScore: Number(probabilityScore.toFixed(2))
      });

      console.log(`✅ ${lotteryId}: ${uniqueGames}/${generatedGames.length} jogos únicos`);
      console.log(`📈 Média de acertos: ${averageMatches.toFixed(2)}/${lottery.minNumbers}`);
      console.log(`🎯 Melhor resultado: ${bestMatch} acertos`);
      console.log(`💯 Score de probabilidade: ${probabilityScore.toFixed(2)}%`);

    } catch (error) {
      console.error(`❌ Erro testando ${lotteryId}:`, error);
    }
  }

  // Relatório final
  console.log('\n\n📊 RELATÓRIO FINAL DE ACERTIVIDADE\n');
  console.log('═'.repeat(60));
  
  for (const result of results) {
    console.log(`\n🎰 ${result.lotteryId.toUpperCase()}`);
    console.log(`   Unicidade: ${result.uniqueGames}/${result.totalTests} (${(result.uniqueGames/result.totalTests*100).toFixed(0)}%)`);
    console.log(`   Média de acertos: ${result.averageMatches}`);
    console.log(`   Melhor resultado: ${result.bestMatch} acertos`);
    console.log(`   Probabilidade: ${result.probabilityScore}%`);
  }

  // Análise estatística global
  const avgProbability = results.reduce((sum, r) => sum + r.probabilityScore, 0) / results.length;
  const avgUniqueness = results.reduce((sum, r) => sum + (r.uniqueGames/r.totalTests), 0) / results.length * 100;

  console.log('\n═'.repeat(60));
  console.log(`\n🎯 MÉTRICAS GLOBAIS:`);
  console.log(`   Unicidade média: ${avgUniqueness.toFixed(2)}%`);
  console.log(`   Probabilidade média: ${avgProbability.toFixed(2)}%`);
  console.log(`   Status: ${avgUniqueness > 90 && avgProbability > 15 ? '✅ EXCELENTE' : avgProbability > 10 ? '⚠️ BOM' : '❌ PRECISA MELHORIAS'}`);
  console.log('\n');
}

testAccuracy().catch(console.error);
