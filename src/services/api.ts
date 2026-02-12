/**
 * API client configuration and setup
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import type { APIError } from '@types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: APIError = {
          message: error.message,
          status: error.response?.status,
          code: error.code,
        }
        return Promise.reject(apiError)
      }
    )
  }

  getClient(): AxiosInstance {
    return this.client
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization']
  }
}

export const apiClient = new APIClient()
export default apiClient.getClient()
