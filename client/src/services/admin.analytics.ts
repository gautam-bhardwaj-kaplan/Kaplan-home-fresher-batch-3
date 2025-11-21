import { apiCall } from './api';

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalAttempts: number;
  averageAccuracy: number;
  participationRate: number;
  badgesAwarded: number;
}

export interface DailyStat {
  date: string;
  activeUsers: number;
  totalAttempts: number;
  accuracy: number;
}

export interface CategoryBreakdown {
  category: string;
  totalQuestions: number;
  totalAttempts: number;
  accuracy: number;
}

export interface StreakDistribution {
  range: string;
  count: number;
}

export interface WeeklyHeatmap {
  week: string;
  totalQuestions: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface AnalyticsOverviewResponse {
  overview: OverviewMetrics;
  dailyStats: DailyStat[];
  categoryBreakdown: CategoryBreakdown[];
  streakDistribution: StreakDistribution[];
  weeklyHeatmap: WeeklyHeatmap[];
  topPerformers: Array<{
    userId: string;
    name: string;
    currentStreak: number;
    accuracy: number;
  }>;
}

export interface DailyAnalyticsResponse {
  date: string;
  question: {
    id: string;
    scheduledDate: string;
    category: string;
    difficulty: string;
    questionText: string;
    questionType: string;
    points: number;
  };
  participation: {
    totalUsers: number;
    attempted: number;
    participationRate: number;
  };
  performance: {
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    averageTimeSpent: number;
  };
  hourlyDistribution: Array<{
    hour: number;
    attempts: number;
  }>;
  categoryDistribution: {
    category: string;
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
  };
}

const toQueryString = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};

export const getAnalyticsOverview = async (
  dateFrom?: string,
  dateTo?: string
): Promise<AnalyticsOverviewResponse> => {
  const response = await apiCall<AnalyticsOverviewResponse>(
    'get',
    `/admin/analytics/overview${toQueryString({ dateFrom, dateTo })}`
  );
  return response.data;
};

export const getDailyAnalytics = async (
  date: string
): Promise<DailyAnalyticsResponse> => {
  const response = await apiCall<DailyAnalyticsResponse>('get', `/admin/analytics/daily/${date}`);
  return response.data;
};

