
/**
 * 📥 ETL - FETCH DE RESULTADOS DAS LOTERIAS
 * 
 * Busca resultados de APIs públicas e armazena no banco
 * com retry automático e caching inteligente
 */

import axios, { AxiosError } from 'axios';
import { storage } from '../storage';
import type { InsertLotteryDraw } from '@shared/schema';

interface APIResult {
  concurso: number;
  data: string;
  dezenas: string[];
  premiacao?: {
    acertos_6?: { vencedores: number; valor: string };
    acertos_5?: { vencedores: number; valor: string };
    acertos_4?: { vencedores: number; valor: string };
  };
}

// Mapeamento de APIs (use a que preferir)
const API_ENDPOINTS: Record<string, string> = {
  megasena: 'https://loteriascaixa-api.herokuapp.com/api/megasena',
  lotofacil: 'https://loteriascaixa-api.herokuapp.com/api/lotofacil',
  quina: 'https://loteriascaixa-api.herokuapp.com/api/quina',
  lotomania: 'https://loteriascaixa-api.herokuapp.com/api/lotomania',
  duplasena: 'https://loteriascaixa-api.herokuapp.com/api/duplasena',
  // Adicione outras conforme necessário
};

// Alternativa: API da Caixa (oficial)
const CAIXA_API_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';

/**
 * Retry com backoff exponencial
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⚠️  Tentativa ${attempt + 1} falhou, aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Busca último resultado de uma loteria (com fallback)
 */
export async function fetchLatestResult(lotteryId: string): Promise<APIResult | null> {
  console.log(`📡 Buscando último resultado: ${lotteryId}`);

  // Tentar API Heroku primeiro
  try {
    const url = `${API_ENDPOINTS[lotteryId]}/latest`;
    const response = await retryWithBackoff(() => 
      axios.get<APIResult>(url, { timeout: 10000 })
    );
    
    if (response.data && response.data.concurso) {
      console.log(`✅ Resultado obtido via Heroku API: Concurso ${response.data.concurso}`);
      return response.data;
    }
  } catch (error) {
    console.log(`⚠️  Heroku API falhou, tentando API da Caixa...`);
  }

  // Fallback: API da Caixa
  try {
    const url = `${CAIXA_API_BASE}/${lotteryId}`;
    const response = await retryWithBackoff(() =>
      axios.get(url, { timeout: 15000 })
    );

    if (response.data) {
      // Transformar formato da Caixa para nosso padrão
      return {
        concurso: response.data.numero || response.data.concurso,
        data: response.data.dataApuracao || response.data.data,
        dezenas: response.data.listaDezenas || response.data.dezenas || [],
        premiacao: response.data.listaRateioPremio
      };
    }
  } catch (error) {
    console.error(`❌ Falha ao buscar ${lotteryId}:`, (error as Error).message);
  }

  return null;
}

/**
 * Busca múltiplos concursos (histórico)
 */
export async function fetchHistoricalResults(
  lotteryId: string,
  fromContest: number,
  toContest: number
): Promise<APIResult[]> {
  console.log(`📚 Buscando histórico ${lotteryId}: ${fromContest} a ${toContest}`);
  
  const results: APIResult[] = [];
  const batchSize = 10; // Buscar em lotes para não sobrecarregar
  
  for (let i = fromContest; i <= toContest; i += batchSize) {
    const batch = [];
    const end = Math.min(i + batchSize - 1, toContest);
    
    for (let concurso = i; concurso <= end; concurso++) {
      batch.push(fetchResultByContest(lotteryId, concurso));
    }
    
    const batchResults = await Promise.allSettled(batch);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
    
    // Aguardar entre lotes para respeitar rate limits
    if (end < toContest) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`✅ ${results.length} concursos históricos obtidos`);
  return results;
}

/**
 * Busca resultado específico por concurso
 */
async function fetchResultByContest(lotteryId: string, concurso: number): Promise<APIResult | null> {
  try {
    const url = `${API_ENDPOINTS[lotteryId]}/${concurso}`;
    const response = await axios.get<APIResult>(url, { timeout: 8000 });
    return response.data;
  } catch (error) {
    // Tentar API da Caixa
    try {
      const url = `${CAIXA_API_BASE}/${lotteryId}/${concurso}`;
      const response = await axios.get(url, { timeout: 10000 });
      
      return {
        concurso: response.data.numero || concurso,
        data: response.data.dataApuracao,
        dezenas: response.data.listaDezenas || [],
        premiacao: response.data.listaRateioPremio
      };
    } catch (fallbackError) {
      return null;
    }
  }
}

/**
 * Salva resultado no banco (evita duplicatas)
 */
export async function saveResultToDatabase(lotteryId: string, result: APIResult): Promise<boolean> {
  try {
    // Verificar se já existe
    const existing = await storage.getDrawByContest(lotteryId, result.concurso);
    
    if (existing) {
      console.log(`⏭️  Concurso ${result.concurso} já existe, pulando...`);
      return false;
    }

    // Preparar dados
    const drawData: InsertLotteryDraw = {
      lotteryId,
      contestNumber: result.concurso,
      drawDate: new Date(result.data),
      drawnNumbers: result.dezenas.map(d => parseInt(d)),
      prize: result.premiacao?.acertos_6?.valor || '0',
      winners: result.premiacao?.acertos_6?.vencedores || 0
    };

    await storage.createLotteryDraw(drawData);
    console.log(`✅ Concurso ${result.concurso} salvo no banco`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar concurso ${result.concurso}:`, (error as Error).message);
    return false;
  }
}

/**
 * Sincronização completa (buscar e salvar últimos resultados)
 */
export async function syncAllLotteries(): Promise<{
  success: string[];
  failed: string[];
}> {
  console.log('🔄 Iniciando sincronização completa...\n');
  
  const lotteries = Object.keys(API_ENDPOINTS);
  const success: string[] = [];
  const failed: string[] = [];

  for (const lotteryId of lotteries) {
    try {
      const result = await fetchLatestResult(lotteryId);
      
      if (result) {
        const saved = await saveResultToDatabase(lotteryId, result);
        if (saved) {
          success.push(lotteryId);
        }
      } else {
        failed.push(lotteryId);
      }
    } catch (error) {
      console.error(`❌ Falha em ${lotteryId}:`, (error as Error).message);
      failed.push(lotteryId);
    }
    
    // Aguardar entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Sincronização completa:`);
  console.log(`   Sucesso: ${success.join(', ')}`);
  if (failed.length > 0) {
    console.log(`   Falhas: ${failed.join(', ')}`);
  }

  return { success, failed };
}

/**
 * Agendar sincronização periódica (rodar como cron)
 */
export function scheduleDailySync(): NodeJS.Timeout {
  console.log('⏰ Agendando sincronização diária às 22:00...');
  
  const runSync = async () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Executar às 22h (após sorteios)
    if (hour === 22) {
      await syncAllLotteries();
    }
  };

  // Verificar a cada hora
  const interval = setInterval(runSync, 60 * 60 * 1000);
  
  // Executar primeira vez agora (se for horário)
  runSync();
  
  return interval;
}

/**
 * Adicionar método ao storage para buscar por concurso
 */
declare module '../storage' {
  interface Storage {
    getDrawByContest(lotteryId: string, contestNumber: number): Promise<any | null>;
  }
}
