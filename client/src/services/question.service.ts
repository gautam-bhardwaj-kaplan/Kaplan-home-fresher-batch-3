import { apiCall } from './api';
import type { TodayQuestionResponse, SubmitAnswerResponse } from '../types';

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

