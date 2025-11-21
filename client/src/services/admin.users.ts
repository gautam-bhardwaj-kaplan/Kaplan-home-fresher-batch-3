import { apiCall } from './api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'LEARNER' | 'ADMIN';
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  currentStreak?: number;
  longestStreak?: number;
  totalQuestionsAttempted?: number;
  totalCorrectAnswers?: number;
  totalPoints?: number;
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await apiCall<AdminUser[]>('get', '/admin/users');
  return response.data;
};