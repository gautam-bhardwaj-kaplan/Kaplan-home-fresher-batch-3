import { apiCall } from './api';
import type { TodayQuestionResponse, SubmitAnswerResponse, QuestionStats } from '../types';

export const getTodayQuestion = async (): Promise<TodayQuestionResponse> => {
  const response = await apiCall<TodayQuestionResponse>('get', '/questions/today');
  return response.data;
};

export const submitAnswer = async (
  questionId: string,
  answer: string,
  timeSpent?: number
): Promise<SubmitAnswerResponse> => {
  const response = await apiCall<SubmitAnswerResponse>(
    'post',
    `/questions/${questionId}/submit`,
    {
      answer,
      timeSpent,
    }
  );
  return response.data;
};

export const getQuestionStats = async (): Promise<QuestionStats> => {
  const response = await apiCall<QuestionStats>('get', '/questions/stats');
  return response.data;
};

