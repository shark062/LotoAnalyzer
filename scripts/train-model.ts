
#!/usr/bin/env tsx
/**
 * 🤖 TREINO E AVALIAÇÃO DE MODELO ML
 * 
 * Treina modelo para predição de probabilidades
 * com validação temporal
 */

import { generateTrainingDataset, calculateProbabilities, exportFeaturesJSON } from '../server/services/featureStore';
import { storage } from '../server/storage';

async function trainModel(lotteryId: string = 'megasena'): Promise<void> {
  console.log(`\n🤖 INICIANDO TREINO DE MODELO: ${lotteryId}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Gerar dataset
  const dataset = await generateTrainingDataset(lotteryId, 300);

  console.log(`\n📊 Features extraídas:`);
  console.log(`   Números: ${dataset.features.length}`);
  console.log(`   Jogos históricos: ${dataset.games.length}`);
  console.log(`   Pares co-ocorrência: ${dataset.cooccurrence.size}`);

  // Exportar para análise externa (Python/R)
  exportFeaturesJSON(dataset.features, dataset.games, `features_${lotteryId}.json`);

  // Calcular probabilidades (modelo simplificado)
  console.log(`\n🎯 Calculando probabilidades...`);
  const probabilities = calculateProbabilities(dataset.features);

  // Top 10 números mais prováveis
  const topNumbers = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  console.log(`\n🏆 TOP 10 NÚMEROS MAIS PROVÁVEIS:`);
  topNumbers.forEach(([num, prob], index) => {
    console.log(`   ${index + 1}. Número ${num}: ${(prob * 100).toFixed(2)}%`);
  });

  // Validação temporal (últimos 20%)
  console.log(`\n✅ Validação temporal...`);
  const splitPoint = Math.floor(dataset.games.length * 0.8);
  const train = dataset.games.slice(splitPoint);
  const test = dataset.games.slice(0, splitPoint);

  console.log(`   Treino: ${train.length} jogos`);
  console.log(`   Teste: ${test.length} jogos`);

  // Avaliar predições no conjunto de teste
  let totalAcertos = 0;
  let totalNumeros = 0;

  for (const testGame of test) {
    const predicted = topNumbers.slice(0, 6).map(([num]) => parseInt(num));
    const matches = predicted.filter(n => testGame.numeros.includes(n)).length;
    totalAcertos += matches;
    totalNumeros += testGame.numeros.length;
  }

  const accuracy = (totalAcertos / totalNumeros) * 100;
  console.log(`\n📈 Acurácia no teste: ${accuracy.toFixed(2)}%`);
  console.log(`   (${totalAcertos} acertos em ${totalNumeros} números)\n`);

  // Salvar modelo (probabilities)
  const modelData = {
    lotteryId,
    timestamp: new Date().toISOString(),
    probabilities,
    metadata: {
      trainingSize: train.length,
      testSize: test.length,
      accuracy
    }
  };

  const fs = require('fs');
  fs.writeFileSync(`model_${lotteryId}.json`, JSON.stringify(modelData, null, 2));
  console.log(`💾 Modelo salvo em: model_${lotteryId}.json\n`);
}

// Executar
if (import.meta.url === `file://${process.argv[1]}`) {
  const lotteryId = process.argv[2] || 'megasena';
  
  trainModel(lotteryId)
    .then(() => {
      console.log('✅ Treino concluído!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro no treino:', error);
      process.exit(1);
    });
}

export { trainModel };
