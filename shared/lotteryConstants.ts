/**
 * 🎯 FASE 1 - CONSOLIDAÇÃO: Arquivo centralizado de constantes das loterias
 * 
 * Todas as configurações das modalidades de loteria brasileiras estão
 * centralizadas neste arquivo para garantir consistência e facilitar manutenção.
 * 
 * Baseado nas especificações oficiais da Caixa Econômica Federal
 */

export interface LotteryConfig {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  minNumbers: number;
  maxNumbers: number;
  totalNumbers: number;
  drawDays: string[];
  drawTime: string;
  isActive: boolean;
  apiEndpoint: string;
  prizeCategories: {
    name: string;
    numbersMatched: number;
    probability: string;
  }[];
}

/**
 * 📋 CONFIGURAÇÕES OFICIAIS DAS LOTERIAS BRASILEIRAS
 * Dados validados e padronizados segundo regulamento da Caixa
 */
export const LOTTERY_CONFIGS: Record<string, LotteryConfig> = {
  megasena: {
    id: 'megasena',
    name: 'megasena',
    displayName: 'Mega-Sena',
    emoji: '💎',
    minNumbers: 6,
    maxNumbers: 15,
    totalNumbers: 60,
    drawDays: ['Wednesday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'megasena',
    prizeCategories: [
      { name: 'Sena (6 números)', numbersMatched: 6, probability: '1 em 50.063.860' },
      { name: 'Quina (5 números)', numbersMatched: 5, probability: '1 em 154.518' },
      { name: 'Quadra (4 números)', numbersMatched: 4, probability: '1 em 2.332' },
    ],
  },

  lotofacil: {
    id: 'lotofacil',
    name: 'lotofacil',
    displayName: 'Lotofácil',
    emoji: '⭐',
    minNumbers: 15,
    maxNumbers: 20,
    totalNumbers: 25,
    drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'lotofacil',
    prizeCategories: [
      { name: '15 números', numbersMatched: 15, probability: '1 em 3.268.760' },
      { name: '14 números', numbersMatched: 14, probability: '1 em 21.791' },
      { name: '13 números', numbersMatched: 13, probability: '1 em 691' },
      { name: '12 números', numbersMatched: 12, probability: '1 em 60' },
      { name: '11 números', numbersMatched: 11, probability: '1 em 11' },
    ],
  },

  quina: {
    id: 'quina',
    name: 'quina',
    displayName: 'Quina',
    emoji: '🪙',
    minNumbers: 5,
    maxNumbers: 15,
    totalNumbers: 80,
    drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'quina',
    prizeCategories: [
      { name: 'Quina (5 números)', numbersMatched: 5, probability: '1 em 24.040.016' },
      { name: 'Quadra (4 números)', numbersMatched: 4, probability: '1 em 64.106' },
      { name: 'Terno (3 números)', numbersMatched: 3, probability: '1 em 866' },
    ],
  },

  lotomania: {
    id: 'lotomania',
    name: 'lotomania',
    displayName: 'Lotomania',
    emoji: '♾️',
    minNumbers: 50,
    maxNumbers: 50,
    totalNumbers: 100,
    drawDays: ['Tuesday', 'Friday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'lotomania',
    prizeCategories: [
      { name: '20 números', numbersMatched: 20, probability: '1 em 11.372.635' },
      { name: '19 números', numbersMatched: 19, probability: '1 em 352.551' },
      { name: '18 números', numbersMatched: 18, probability: '1 em 24.235' },
      { name: '17 números', numbersMatched: 17, probability: '1 em 2.776' },
      { name: '16 números', numbersMatched: 16, probability: '1 em 472' },
      { name: '0 números', numbersMatched: 0, probability: '1 em 11.372.635' },
    ],
  },

  duplasena: {
    id: 'duplasena',
    name: 'duplasena',
    displayName: 'Dupla Sena',
    emoji: '👑',
    minNumbers: 6,
    maxNumbers: 15,
    totalNumbers: 50,
    drawDays: ['Tuesday', 'Thursday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'duplasena',
    prizeCategories: [
      { name: 'Sena (6 números)', numbersMatched: 6, probability: '1 em 15.890.700' },
      { name: 'Quina (5 números)', numbersMatched: 5, probability: '1 em 60.192' },
      { name: 'Quadra (4 números)', numbersMatched: 4, probability: '1 em 1.357' },
      { name: 'Terno (3 números)', numbersMatched: 3, probability: '1 em 81' },
    ],
  },

  supersete: {
    id: 'supersete',
    name: 'supersete',
    displayName: 'Super Sete',
    emoji: '🚀',
    minNumbers: 7,
    maxNumbers: 21,
    totalNumbers: 10,
    drawDays: ['Monday', 'Wednesday', 'Friday'],
    drawTime: '15:00',
    isActive: true,
    apiEndpoint: 'supersete',
    prizeCategories: [
      { name: '7 colunas', numbersMatched: 7, probability: '1 em 10.000.000' },
      { name: '6 colunas', numbersMatched: 6, probability: '1 em 1.000.000' },
      { name: '5 colunas', numbersMatched: 5, probability: '1 em 100.000' },
      { name: '4 colunas', numbersMatched: 4, probability: '1 em 10.000' },
      { name: '3 colunas', numbersMatched: 3, probability: '1 em 1.000' },
    ],
  },

  milionaria: {
    id: 'milionaria',
    name: 'milionaria',
    displayName: '+Milionária',
    emoji: '➕',
    minNumbers: 6,
    maxNumbers: 12,
    totalNumbers: 50,
    drawDays: ['Wednesday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'maismilionaria',
    prizeCategories: [
      { name: '6 + 2 trevos', numbersMatched: 8, probability: '1 em 238.360.500' },
      { name: '6 + 1 trevo', numbersMatched: 7, probability: '1 em 79.453.500' },
      { name: '6 + 0 trevos', numbersMatched: 6, probability: '1 em 39.726.750' },
      { name: '5 + 2 trevos', numbersMatched: 7, probability: '1 em 1.357.510' },
    ],
  },

  timemania: {
    id: 'timemania',
    name: 'timemania',
    displayName: 'Timemania',
    emoji: '🎁',
    minNumbers: 10,
    maxNumbers: 10,
    totalNumbers: 80,
    drawDays: ['Tuesday', 'Thursday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'timemania',
    prizeCategories: [
      { name: '7 números', numbersMatched: 7, probability: '1 em 26.472.637' },
      { name: '6 números', numbersMatched: 6, probability: '1 em 216.103' },
      { name: '5 números', numbersMatched: 5, probability: '1 em 5.220' },
      { name: '4 números', numbersMatched: 4, probability: '1 em 276' },
      { name: '3 números', numbersMatched: 3, probability: '1 em 29' },
    ],
  },

  diadesore: {
    id: 'diadesore',
    name: 'diadesore',
    displayName: 'Dia de Sorte',
    emoji: '🌟',
    minNumbers: 7,
    maxNumbers: 15,
    totalNumbers: 31,
    drawDays: ['Tuesday', 'Thursday', 'Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'diadesorte',
    prizeCategories: [
      { name: '7 números + mês', numbersMatched: 8, probability: '1 em 2.629.575' },
      { name: '7 números', numbersMatched: 7, probability: '1 em 219.298' },
      { name: '6 números + mês', numbersMatched: 7, probability: '1 em 39.761' },
      { name: '6 números', numbersMatched: 6, probability: '1 em 3.314' },
      { name: '5 números + mês', numbersMatched: 6, probability: '1 em 1.169' },
      { name: '5 números', numbersMatched: 5, probability: '1 em 97' },
      { name: '4 números', numbersMatched: 4, probability: '1 em 15' },
    ],
  },

  loteca: {
    id: 'loteca',
    name: 'loteca',
    displayName: 'Loteca',
    emoji: '⚽',
    minNumbers: 14,
    maxNumbers: 14,
    totalNumbers: 3,
    drawDays: ['Saturday'],
    drawTime: '20:00',
    isActive: true,
    apiEndpoint: 'loteca',
    prizeCategories: [
      { name: '14 jogos', numbersMatched: 14, probability: '1 em 4.782.969' },
      { name: '13 jogos', numbersMatched: 13, probability: '1 em 54.182' },
    ],
  },
};

/**
 * 🎯 UTILITÁRIOS DE VALIDAÇÃO E ACESSO
 */

export const getLotteryConfig = (lotteryId: string): LotteryConfig | null => {
  return LOTTERY_CONFIGS[lotteryId] || null;
};

export const getAllLotteryConfigs = (): LotteryConfig[] => {
  return Object.values(LOTTERY_CONFIGS).filter(lottery => lottery.isActive);
};

export const validateLotteryNumbers = (lotteryId: string, numbers: number[]): boolean => {
  const config = getLotteryConfig(lotteryId);
  if (!config) return false;

  // Validar quantidade de números
  if (numbers.length < config.minNumbers || numbers.length > config.maxNumbers) {
    return false;
  }

  // Validar range dos números
  return numbers.every(num => num >= 1 && num <= config.totalNumbers);
};

export const getLotteryDisplayInfo = (lotteryId: string) => {
  const config = getLotteryConfig(lotteryId);
  if (!config) return null;

  return {
    name: config.displayName,
    emoji: config.emoji,
    range: `${config.minNumbers}-${config.maxNumbers} números de 1 a ${config.totalNumbers}`,
    drawDays: config.drawDays.join(', '),
    drawTime: config.drawTime,
  };
};

/**
 * 📅 CONSTANTES DE FORMATAÇÃO DE DATA (ISO 8601)
 */
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

/**
 * 🔧 CONFIGURAÇÕES DE API
 */
export const API_ENDPOINTS = {
  CAIXA_BASE: 'https://servicebus2.caixa.gov.br/portaldeloterias/api',
  FALLBACK_BASE: 'https://api.loterias.caixa.gov.br',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
} as const;

/**
 * 🎨 CONFIGURAÇÕES DE TEMPERATURA DOS NÚMEROS
 */
export const NUMBER_TEMPERATURE = {
  HOT_THRESHOLD: 0.8,     // 80% das aparições
  WARM_THRESHOLD: 0.5,    // 50% das aparições
  COLD_THRESHOLD: 0.2,    // 20% das aparições
  MIN_DRAWS_SAMPLE: 50,   // Mínimo de sorteios para análise
} as const;

/**
 * 🎯 ESTRATÉGIAS DE GERAÇÃO DE JOGOS
 */
export const GAME_STRATEGIES = {
  HOT: 'hot',
  COLD: 'cold',
  MIXED: 'mixed',
  BALANCED: 'balanced',
  PATTERN: 'pattern',
} as const;

/**
 * 🔧 FUNÇÃO UTILITÁRIA PARA OBTER CONFIGURAÇÃO DA LOTERIA
 */
export function getLotteryConfig(lotteryId: string) {
  return LOTTERY_CONFIGS[lotteryId as keyof typeof LOTTERY_CONFIGS];
}d', 
  MIXED: 'mixed',
  AI: 'ai',
  RANDOM: 'random',
} as const;

export type GameStrategy = keyof typeof GAME_STRATEGIES;