
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface Game {
  numbers: number[];
  contestNumber?: number;
}

interface UseBettingPlatformReturn {
  addToCart: (platformId: string, lotteryId: string, games: Game[]) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useBettingPlatform(): UseBettingPlatformReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const addToCart = async (platformId: string, lotteryId: string, games: Game[]) => {
    setLoading(true);
    setError(null);

    try {
      const cartItems = games.map(game => ({
        lotteryId,
        numbers: game.numbers,
        contestNumber: game.contestNumber
      }));

      const response = await apiRequest('POST', '/api/betting-platforms/cart-url', {
        platformId,
        games: cartItems
      });

      const data = await response.json();

      if (data.success) {
        // Detecta se é mobile para usar deeplink
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const urlToOpen = (isMobile && data.deepLink) ? data.deepLink : data.cartUrl;

        // Abre em nova aba
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');

        // Feedback de sucesso
        const platformNames: Record<string, string> = {
          superjogo: 'SuperJogo',
          caixa: 'Loterias Caixa',
          lottoland: 'Lottoland'
        };

        toast({
          title: "🎯 Jogos Adicionados!",
          description: `Seus ${games.length} jogo(s) foram adicionados ao carrinho do ${platformNames[platformId] || platformId}`,
        });

        // Analytics (opcional)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'add_to_cart', {
            platform: platformId,
            lottery: lotteryId,
            games_count: games.length
          });
        }
      } else {
        throw new Error(data.error || 'Falha ao gerar URL do carrinho');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Erro ao Adicionar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    addToCart,
    loading,
    error
  };
}
