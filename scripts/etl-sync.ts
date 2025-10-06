
#!/usr/bin/env tsx
/**
 * 📥 SINCRONIZAÇÃO ETL
 * 
 * Executa fetch e armazenamento de resultados
 */

import { syncAllLotteries, scheduleDailySync } from '../server/services/fetchResults';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--schedule')) {
    console.log('⏰ Agendando sincronização diária...');
    scheduleDailySync();
    console.log('✅ Sincronização agendada. Processo rodando...');
    
    // Manter processo vivo
    await new Promise(() => {});
  } else {
    console.log('🔄 Executando sincronização única...');
    await syncAllLotteries();
    console.log('✅ Sincronização concluída!');
  }
}

main().catch(console.error);
