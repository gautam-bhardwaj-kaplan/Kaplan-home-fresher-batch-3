import axios, { type AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '../types';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/users/login') || requestUrl.includes('/users/signup');

    if (status === 401 && !isAuthEndpoint) {
      const token = localStorage.getItem('authToken');
      if (token) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const apiCall = async <T>(
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>({
      method,
      url: endpoint,
      data,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data;
      
      // Backend error format returns: { success: false, error: { message: string, details?: array } }
      if (errorData?.error) {
        const errorObj = errorData.error;
        
        if (errorObj.details && Array.isArray(errorObj.details) && errorObj.details.length > 0) {
          const errorMessage = errorObj.details
            .map((detail: { field?: string; message?: string }) => {
              const field = detail.field ? `${detail.field}: ` : '';
              return field + (detail.message || 'Validation error');
            })
            .join(', ');
          throw new Error(errorMessage);
        }
        
        if (errorObj.message) {
          throw new Error(errorObj.message);
        }
      }
      
      throw new Error('An error occurred');
    }
    throw error;
  }
};

export default apiClient;