import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import keycloak from './keycloak'
import type { AuthUser } from '@/types'
import { ROLES } from '@/constants'

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  isOrganizer: boolean
  isStaff: boolean
  login: () => void
  logout: () => void
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Parse user from Keycloak token ──────────────────────────────────────────

function parseUser(): AuthUser | null {
  if (!keycloak.authenticated || !keycloak.tokenParsed) return null

  const parsed = keycloak.tokenParsed as Record<string, unknown>
  const realmAccess = parsed['realm_access'] as { roles?: string[] } | undefined
  const roles: string[] = realmAccess?.roles?.filter((r) => r.startsWith('ROLE_')) ?? []

  return {
    id: keycloak.subject ?? '',
    email: (parsed['email'] as string) ?? '',
    name: (parsed['preferred_username'] as string) ?? (parsed['name'] as string) ?? '',
    roles,
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated) {
          setUser(parseUser())
          setToken(keycloak.token ?? null)
        }
        setIsInitialized(true)
      })
      .catch(() => {
        setIsInitialized(true)
      })

    // Token refresh
    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            setToken(keycloak.token ?? null)
            setUser(parseUser())
          }
        })
        .catch(() => {
          keycloak.clearToken()
          setUser(null)
          setToken(null)
        })
    }

    keycloak.onAuthSuccess = () => {
      setUser(parseUser())
      setToken(keycloak.token ?? null)
    }

    keycloak.onAuthLogout = () => {
      setUser(null)
      setToken(null)
    }
  }, [])

  const login = useCallback(() => {
    keycloak.login({ redirectUri: window.location.href })
  }, [])

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin })
  }, [])

  // Always returns a valid (refreshed) token before API calls
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!keycloak.authenticated) return null
    try {
      await keycloak.updateToken(30)
      setToken(keycloak.token ?? null)
      return keycloak.token ?? null
    } catch {
      return null
    }
  }, [])

  const isOrganizer = user?.roles.includes(ROLES.ORGANIZER) ?? false
  const isStaff = user?.roles.includes(ROLES.STAFF) ?? false

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isInitialized,
        isOrganizer,
        isStaff,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
