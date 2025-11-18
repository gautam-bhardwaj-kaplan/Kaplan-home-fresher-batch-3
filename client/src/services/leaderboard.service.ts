import { apiCall } from './api';
import type { LeaderboardResponse } from '../types';

export type LeaderboardType = 'points' | 'streak';
export type LeaderboardPeriod = 'all' | 'week' | 'month';

export const getLeaderboard = async (
  type: LeaderboardType,
  period: LeaderboardPeriod = 'all',
  limit = 20
): Promise<LeaderboardResponse> => {
  const endpoint =
    type === 'points'
      ? `/leaderboard/points?period=${period}&limit=${limit}`
      : `/leaderboard/streak?period=${period}&limit=${limit}`;

  const response = await apiCall<LeaderboardResponse>('get', endpoint);
  return response.data;
};

