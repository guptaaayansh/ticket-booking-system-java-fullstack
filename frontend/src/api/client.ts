import axios, { type AxiosError } from 'axios'
import keycloak from '@/auth/keycloak'
import { API_BASE } from '@/constants'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor — attach token ───────────────────────────────────────

apiClient.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      try {
        // Refresh token if it expires within 30 seconds
        await keycloak.updateToken(30)
        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`
        }
      } catch {
        // Token refresh failed — user will be treated as unauthenticated
        keycloak.clearToken()
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor — handle 401 ───────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Force re-login
      keycloak.login({ redirectUri: window.location.href })
    }
    return Promise.reject(error)
  }
)

export default apiClient
