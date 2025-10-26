"use client";

import { useState, useEffect, useCallback } from 'react';
import { api, LeaderboardEntry } from '@/lib/api';

export interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  fetchLeaderboard: (limit?: number, offset?: number) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

export function useLeaderboard(initialLimit = 8): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (limit = initialLimit, offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching leaderboard... (limit:', limit, ', offset:', offset, ')');
      const response = await api.getLeaderboard({ limit, offset });
      
      if (response && response.leaderboard) {
        console.log('✅ Leaderboard loaded successfully:', response.leaderboard.length, 'entries');
        setLeaderboard(response.leaderboard);
        setTotal(response.total);
        setHasMore(response.hasMore);
      } else {
        console.warn('⚠️ No leaderboard data in response:', response);
        setLeaderboard([]);
        setTotal(0);
        setHasMore(false);
      }
    } catch (err) {
      console.error('❌ Failed to fetch leaderboard:', err);
      setError(`Failed to load leaderboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLeaderboard([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit]);

  // Refresh leaderboard (same as fetch but with current offset)
  const refreshLeaderboard = useCallback(async () => {
    await fetchLeaderboard(initialLimit, 0);
  }, [fetchLeaderboard, initialLimit]);

  // Load leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshLeaderboard();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshLeaderboard, isLoading]);

  return {
    leaderboard,
    isLoading,
    error,
    total,
    hasMore,
    fetchLeaderboard,
    refreshLeaderboard,
  };
}
