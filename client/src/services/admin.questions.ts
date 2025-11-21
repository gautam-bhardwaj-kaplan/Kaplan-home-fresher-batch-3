import { apiCall } from './api';
import type { ApiResponse } from '../types';

export type QuestionCategory = 'MATH' | 'ENGLISH' | 'CODING' | 'SCIENCE' | 'GENERAL';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MCQ' | 'SHORT_ANSWER';

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AdminQuestionListItem {
  id: string;
  scheduledDate: string | Date;
  category: QuestionCategory;
  difficulty?: Difficulty;
  questionText: string;
  totalAttempts?: number;
  correctAttempts?: number;
  isActive: boolean;
}

export interface AdminQuestionDetail {
  id: string;
  scheduledDate: string | Date;
  category: QuestionCategory;
  difficulty?: Difficulty;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  explanation?: string;
  points?: number;
  isActive: boolean;
}

export interface ListQuestionsResponse {
  questions: AdminQuestionListItem[];
  pagination: Pagination;
}

export interface QuestionAnalytics {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  optionDistribution: Array<{ option: string; count: number }>;
}

export type ListFilters = {
  page?: number;
  limit?: number;
  category?: QuestionCategory;
  dateFrom?: string;
  dateTo?: string;
  difficulty?: Difficulty;
  status?: 'active' | 'inactive';
};

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

export const listAdminQuestions = async (
  filters: ListFilters = {}
): Promise<ListQuestionsResponse> => {
  const response = await apiCall<ListQuestionsResponse>('get', `/admin/questions${toQueryString(filters)}`);
  return response.data;
};

export const getAdminQuestion = async (
  questionId: string
): Promise<{ question: AdminQuestionDetail; analytics: QuestionAnalytics }> => {
  const response = await apiCall<{ question: AdminQuestionDetail; analytics: QuestionAnalytics }>(
    'get',
    `/admin/questions/${questionId}`
  );
  return response.data;
};

export const createAdminQuestion = async (
  payload: Partial<AdminQuestionDetail> & { scheduledDate: string; category: QuestionCategory; questionText: string; correctAnswer: string; questionType?: QuestionType; points?: number; options?: string[]; acceptedAnswers?: string[]; difficulty?: Difficulty }
): Promise<{ question: AdminQuestionDetail }> => {
  const response = await apiCall<{ question: AdminQuestionDetail }>('post', '/admin/questions', payload);
  return response.data;
};

export const updateAdminQuestion = async (
  questionId: string,
  payload: Partial<AdminQuestionDetail>
): Promise<AdminQuestionDetail> => {
  const response = await apiCall<AdminQuestionDetail>('patch', `/admin/questions/${questionId}`, payload);
  return response.data;
};

export const deleteAdminQuestion = async (
  questionId: string
): Promise<ApiResponse<unknown>> => {
  return apiCall<unknown>('delete', `/admin/questions/${questionId}`);
};