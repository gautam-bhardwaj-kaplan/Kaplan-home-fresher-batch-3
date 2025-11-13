import { apiCall } from './api';
import type { LoginCredentials, SignupData, AuthResponse, User, UserProgress, StatsChartData } from '../types';

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const response = await apiCall<AuthResponse>('post', '/users/signup', data);
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiCall<AuthResponse>('post', '/users/login', credentials);
  return response.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await apiCall<User>('get', '/users/me');
  return response.data;
};

export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiCall<User>('patch', '/users/me', data);
  return response.data;
};

export const getUserProgress = async (): Promise<UserProgress> => {
  const response = await apiCall<UserProgress>('get', '/users/me/progress');
  return response.data;
};

export const getUserStatsChart = async (
  period: 'week' | 'month' | 'year' = 'month',
  metric: 'accuracy' | 'attempts' | 'points' = 'accuracy'
): Promise<StatsChartData> => {
  const response = await apiCall<StatsChartData>(
    'get',
    `/users/me/stats/chart?period=${period}&metric=${metric}`
  );
  return response.data;
};