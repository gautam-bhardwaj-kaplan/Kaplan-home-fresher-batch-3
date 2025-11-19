import { type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'LEARNER' | 'ADMIN';
  profilePicture?: string;
  currentStreak: number;
  longestStreak?: number;
  totalQuestionsAttempted?: number;
  totalCorrectAnswers?: number;
  totalPoints?: number;
  accuracy?: number;
  emailNotifications?: boolean;
  notificationTime?: string;
  badges?: Array<{
    badgeId: string;
    name: string;
    earnedAt: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserProgress {
  overview: {
    currentStreak: number;
    longestStreak: number;
    totalAttempts: number;
    correctAnswers: number;
    accuracy: number;
    totalPoints: number;
    rank: number;
  };
  categoryPerformance: Array<{
    category: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  recentActivity: Array<{
    date: string;
    isCorrect: boolean;
    points: number;
    category: string;
  }>;
  streakHistory: Array<{
    date: string;
    hasAttempt: boolean;
    isCorrect?: boolean;
  }>;
  badges: Array<{
    badgeId: string;
    name: string;
    earnedAt: string;
  }>;
}

export interface StatsChartData {
  labels: string[];
  values: number[];
}

export interface BadgeProps {
  label: string;
  variant?: 'green' | 'yellow' | 'blue' | 'gray';
}

export interface ErrorAlertProps {
  message: string;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
}

export interface ModalBackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export type ModalMode = 'create' | 'edit';

export interface QuestionModalProps {
  open: boolean;
  mode: ModalMode;
  questionId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export interface QuestionStatsCardsProps {
  total: number;
  active: number;
  scheduled: number;
  inactive: number;
}

export interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  avgAccuracy: number;
  longestStreak: number;
}