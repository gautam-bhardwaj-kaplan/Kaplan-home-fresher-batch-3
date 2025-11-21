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
  createdAt?: string;
  badges?: Array<{
    badgeId: string;
    name: string;
    earnedAt: string;
    iconUrl?: string;
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
    questionText: string;
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

export interface Question {
  id: string;
  date: string;
  category: string;
  difficulty: string;
  questionText: string;
  questionType: 'MCQ' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
}

export interface QuestionStats {
  totalQuestions: number;
}

export interface Submission {
  id: string;
  submittedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer?: string;
  explanation?: string;
  submittedAt?: string;
}

export interface TodayQuestionResponse {
  question: Question;
  hasAttempted: boolean;
  submission: Submission | null;
}

export interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
}

export interface Badge {
  badgeId: string;
  name: string;
  earnedAt: string;
}

export interface UserStats {
  totalPoints: number;
  accuracy: number;
}

export interface SubmitAnswerResponse {
  submission: {
    id: string;
    isCorrect: boolean;
    pointsEarned: number;
    correctAnswer: string;
    explanation?: string;
  };
  streakUpdate?: StreakUpdate;
  newBadges?: Badge[];
  userStats?: UserStats;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  profilePicture?: string | null;
  currentStreak: number;
  totalPoints: number;
  badges: number;
}

export interface LeaderboardCurrentUser {
  rank: number;
  currentStreak: number;
  totalPoints: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardCurrentUser | null;
  period: 'all' | 'week' | 'month';
  generatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export type NavSection = 'dashboard' | 'leaderboard' | 'profile';

export interface AppNavbarProps {
  active: NavSection;
  userName?: string;
  onLogout: () => void;
}

export interface ProtectedRouteProps {
  children: ReactNode;
}