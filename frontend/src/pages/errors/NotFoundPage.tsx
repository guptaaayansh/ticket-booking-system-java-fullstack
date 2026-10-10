import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants'

// ─── 404 Not Found ────────────────────────────────────────────────────────────

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <FileQuestion className="h-9 w-9 text-[var(--text-muted)]" />
      </div>
      <h1 className="text-5xl font-extrabold text-[var(--text-primary)] mb-2"
        style={{ letterSpacing: '-0.03em' }}>
        404
      </h1>
      <p className="text-lg text-[var(--text-secondary)] mb-2">Page not found</p>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate(ROUTES.HOME)}>Back to home</Button>
    </div>
  )
}
