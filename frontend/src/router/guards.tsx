import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { ROUTES } from '@/constants'
import { PageLoadingState } from '@/components/common'

// ─── Auth guard ───────────────────────────────────────────────────────────────

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, login } = useAuth()

  if (!isInitialized) {
    return <PageLoadingState />
  }

  if (!isAuthenticated) {
    login()
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--text-muted)] text-sm">Redirecting to sign in…</p>
      </div>
    )
  }

  return <>{children}</>
}

// ─── Role guard ───────────────────────────────────────────────────────────────

interface RoleRouteProps {
  children: ReactNode
  role: string
}

export function RoleRoute({ children, role }: RoleRouteProps) {
  const { user, isAuthenticated, isInitialized } = useAuth()

  if (!isInitialized) return <PageLoadingState />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  if (!user?.roles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <>{children}</>
}
