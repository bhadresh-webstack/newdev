import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Set your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Universal API Request Wrapper
export const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response: AxiosResponse<T> = await api({
      method,
      url,
      data,
      withCredentials: true,
      ...config,
    });

    return { data: response.data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.response?.data?.error || error.message || 'Something went wrong',
    };
  }
};
