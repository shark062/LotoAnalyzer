
#!/usr/bin/env tsx
/**
 * 🧪 BACKTEST COMPLETO - Comparação de Estratégias
 * 
 * Compara performance do Algoritmo Genético vs jogos aleatórios
 * em dados históricos reais
 */

import { storage } from '../server/storage';
import { generateGamesGA, calculateFitness } from '../server/services/geneticGenerator';
import { writeFileSync } from 'fs';
import { getLotteryConfig } from '../shared/lotteryConstants';

interface BacktestResult {
  concurso: number;
  data: string;
  estrategia: 'GA' | 'Aleatorio';
  jogoGerado: number[];
  numerosSorteados: number[];
  acertos: number;
  fitness: number;
}

interface BacktestStats {
  estrategia: string;
  totalConcursos: number;
  acertos3: number;
  acertos4: number;
  acertos5: number;
  acertos6: number;
  taxaAcerto3: number;
  taxaAcerto4: number;
  taxaAcerto5: number;
  taxaAcerto6: number;
  fitnessMedia: number;
  sequenciasMedia: number;
}

/**
 * Gera jogo aleatório para baseline
 */
function generateRandomGame(poolSize: number, pick: number): number[] {
  const nums = Array.from({ length: poolSize }, (_, i) => i + 1);
  
  // Fisher-Yates shuffle
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  return nums.slice(0, pick).sort((a, b) => a - b);
}

/**
 * Calcula acertos entre jogo gerado e resultado
 */
function calculateMatches(generated: number[], drawn: number[]): number {
  return generated.filter(n => drawn.includes(n)).length;
}

/**
 * Executa backtest completo
 */
async function runBacktest(
  lotteryId: string = 'megasena',
  minDraws: number = 100
): Promise<void> {
  console.log(`\n🧪 INICIANDO BACKTEST: ${lotteryId}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const config = getLotteryConfig(lotteryId);
  if (!config) {
    console.error(`❌ Configuração não encontrada para ${lotteryId}`);
    return;
  }

  // Buscar sorteios históricos
  console.log(`📚 Buscando dados históricos...`);
  const draws = await storage.getLatestDraws(lotteryId, minDraws);
  
  if (draws.length < minDraws) {
    console.error(`❌ Dados insuficientes: ${draws.length} sorteios (mínimo: ${minDraws})`);
    return;
  }

  console.log(`✅ ${draws.length} sorteios obtidos\n`);

  const resultsGA: BacktestResult[] = [];
  const resultsRandom: BacktestResult[] = [];

  // Processar cada sorteio
  console.log(`🔬 Processando sorteios...`);
  let processed = 0;

  for (const draw of draws) {
    if (!draw.drawnNumbers || draw.drawnNumbers.length === 0) continue;

    processed++;
    if (processed % 10 === 0) {
      console.log(`   Processado: ${processed}/${draws.length}`);
    }

    // Gerar com GA
    const gaGames = generateGamesGA({
      poolSize: config.totalNumbers,
      pick: config.minNumbers,
      populationSize: 100,
      generations: 50
    }, 1);

    const gaGame = gaGames[0].game;
    const gaMatches = calculateMatches(gaGame, draw.drawnNumbers);
    const gaMetrics = calculateFitness(gaGame, config.totalNumbers);

    resultsGA.push({
      concurso: draw.contestNumber,
      data: new Date(draw.drawDate).toISOString().split('T')[0],
      estrategia: 'GA',
      jogoGerado: gaGame,
      numerosSorteados: draw.drawnNumbers,
      acertos: gaMatches,
      fitness: gaMetrics.finalScore
    });

    // Gerar aleatório
    const randomGame = generateRandomGame(config.totalNumbers, config.minNumbers);
    const randomMatches = calculateMatches(randomGame, draw.drawnNumbers);
    const randomMetrics = calculateFitness(randomGame, config.totalNumbers);

    resultsRandom.push({
      concurso: draw.contestNumber,
      data: new Date(draw.drawDate).toISOString().split('T')[0],
      estrategia: 'Aleatorio',
      jogoGerado: randomGame,
      numerosSorteados: draw.drawnNumbers,
      acertos: randomMatches,
      fitness: randomMetrics.finalScore
    });
  }

  console.log(`✅ Processamento completo!\n`);

  // Calcular estatísticas
  const statsGA = calculateStats('Algoritmo Genético', resultsGA);
  const statsRandom = calculateStats('Aleatório (Baseline)', resultsRandom);

  // Exibir resultados
  console.log(`\n📊 RESULTADOS DO BACKTEST`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  printStats(statsGA);
  console.log(``);
  printStats(statsRandom);

  // Comparação
  console.log(`\n📈 COMPARAÇÃO GA vs ALEATÓRIO`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`3 acertos: ${formatComparison(statsGA.taxaAcerto3, statsRandom.taxaAcerto3)}`);
  console.log(`4 acertos: ${formatComparison(statsGA.taxaAcerto4, statsRandom.taxaAcerto4)}`);
  console.log(`5 acertos: ${formatComparison(statsGA.taxaAcerto5, statsRandom.taxaAcerto5)}`);
  console.log(`6 acertos: ${formatComparison(statsGA.taxaAcerto6, statsRandom.taxaAcerto6)}`);
  console.log(`Fitness médio: ${formatComparison(statsGA.fitnessMedia, statsRandom.fitnessMedia)}\n`);

  // Salvar CSV
  const csvGA = generateCSV(resultsGA);
  const csvRandom = generateCSV(resultsRandom);
  
  writeFileSync('backtest_ga.csv', csvGA);
  writeFileSync('backtest_random.csv', csvRandom);
  
  console.log(`💾 Resultados salvos:`);
  console.log(`   - backtest_ga.csv`);
  console.log(`   - backtest_random.csv\n`);

  // Salvar resumo JSON
  const summary = {
    lotteryId,
    dataBacktest: new Date().toISOString(),
    totalConcursos: draws.length,
    config,
    resultados: {
      GA: statsGA,
      Aleatorio: statsRandom
    },
    melhorEstrategia: statsGA.taxaAcerto4 > statsRandom.taxaAcerto4 ? 'GA' : 'Aleatório'
  };

  writeFileSync('backtest_summary.json', JSON.stringify(summary, null, 2));
  console.log(`📄 Resumo salvo em: backtest_summary.json\n`);
}

/**
 * Calcula estatísticas de uma estratégia
 */
function calculateStats(nome: string, results: BacktestResult[]): BacktestStats {
  const total = results.length;
  const acertos3 = results.filter(r => r.acertos === 3).length;
  const acertos4 = results.filter(r => r.acertos === 4).length;
  const acertos5 = results.filter(r => r.acertos === 5).length;
  const acertos6 = results.filter(r => r.acertos === 6).length;

  const fitnessMedia = results.reduce((sum, r) => sum + r.fitness, 0) / total;
  
  const sequenciasMedia = results.reduce((sum, r) => {
    const metrics = calculateFitness(r.jogoGerado, 60);
    return sum + metrics.sequencePenalty;
  }, 0) / total;

  return {
    estrategia: nome,
    totalConcursos: total,
    acertos3,
    acertos4,
    acertos5,
    acertos6,
    taxaAcerto3: (acertos3 / total) * 100,
    taxaAcerto4: (acertos4 / total) * 100,
    taxaAcerto5: (acertos5 / total) * 100,
    taxaAcerto6: (acertos6 / total) * 100,
    fitnessMedia,
    sequenciasMedia
  };
}

/**
 * Imprime estatísticas formatadas
 */
function printStats(stats: BacktestStats): void {
  console.log(`${stats.estrategia}`);
  console.log(`${'─'.repeat(stats.estrategia.length)}`);
  console.log(`Total de testes: ${stats.totalConcursos}`);
  console.log(`3 acertos: ${stats.acertos3} (${stats.taxaAcerto3.toFixed(2)}%)`);
  console.log(`4 acertos: ${stats.acertos4} (${stats.taxaAcerto4.toFixed(2)}%)`);
  console.log(`5 acertos: ${stats.acertos5} (${stats.taxaAcerto5.toFixed(2)}%)`);
  console.log(`6 acertos: ${stats.acertos6} (${stats.taxaAcerto6.toFixed(2)}%)`);
  console.log(`Fitness médio: ${stats.fitnessMedia.toFixed(2)}`);
  console.log(`Sequências médias: ${stats.sequenciasMedia.toFixed(2)}`);
}

/**
 * Formata comparação entre valores
 */
function formatComparison(ga: number, random: number): string {
  const diff = ((ga - random) / random) * 100;
  const symbol = diff > 0 ? '↑' : diff < 0 ? '↓' : '=';
  const color = diff > 0 ? '\x1b[32m' : diff < 0 ? '\x1b[31m' : '\x1b[33m';
  const reset = '\x1b[0m';
  
  return `${color}${symbol} ${Math.abs(diff).toFixed(2)}%${reset} (GA: ${ga.toFixed(2)}% vs Random: ${random.toFixed(2)}%)`;
}

/**
 * Gera CSV dos resultados
 */
function generateCSV(results: BacktestResult[]): string {
  const headers = 'Concurso,Data,Estrategia,Jogo_Gerado,Numeros_Sorteados,Acertos,Fitness\n';
  
  const rows = results.map(r => 
    `${r.concurso},${r.data},${r.estrategia},"${r.jogoGerado.join('-')}","${r.numerosSorteados.join('-')}",${r.acertos},${r.fitness.toFixed(2)}`
  ).join('\n');
  
  return headers + rows;
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const lotteryId = process.argv[2] || 'megasena';
  const minDraws = parseInt(process.argv[3] || '100');
  
  runBacktest(lotteryId, minDraws)
    .then(() => {
      console.log('✅ Backtest concluído com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro no backtest:', error);
      process.exit(1);
    });
}

export { runBacktest };
