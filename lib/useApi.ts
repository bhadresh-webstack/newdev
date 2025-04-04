import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Set your API base URL
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Universal API Request Wrapper
export const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response: AxiosResponse<T> = await api({
      method,
      url,
      data,
      ...config
    })

    console.log('response', response)
    return { data: response.data, error: null }
  } catch (error: any) {
    console.error('API Request Error:', error)
    console.log('error', error)
    return {
      data: null,
      error:
        error.response?.data?.error || error.message || 'Something went wrong'
    }
  }
}
