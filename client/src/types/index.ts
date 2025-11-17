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