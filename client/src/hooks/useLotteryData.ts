import { useQuery } from "@tanstack/react-query";
import type { LotteryType, LotteryDraw, NextDrawInfo, NumberFrequency, UserStats } from "@/types/lottery";

export function useLotteryTypes() {
  return useQuery<LotteryType[]>({
    queryKey: ["/api/lotteries"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLotteryDraws(lotteryId?: string, limit = 10) {
  return useQuery<LotteryDraw[]>({
    queryKey: ["/api/lotteries", lotteryId, "draws", `limit=${limit}`],
    enabled: !!lotteryId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useNextDrawInfo(lotteryId?: string) {
  return useQuery<NextDrawInfo>({
    queryKey: ["/api/lotteries", lotteryId, "next-draw"],
    enabled: !!lotteryId,
    refetchInterval: 1000, // Refetch every second for real-time countdown
    staleTime: 500, // 500ms for real-time updates
  });
}

export function useNumberFrequencies(lotteryId?: string) {
  return useQuery<NumberFrequency[]>({
    queryKey: ["/api/lotteries", lotteryId, "frequency"],
    enabled: !!lotteryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}


