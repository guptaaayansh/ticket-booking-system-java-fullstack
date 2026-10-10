import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <ShieldOff className="h-9 w-9 text-[var(--danger)]" />
      </div>
      <h1 className="text-5xl font-extrabold text-[var(--text-primary)] mb-2"
        style={{ letterSpacing: '-0.03em' }}>
        403
      </h1>
      <p className="text-lg text-[var(--text-secondary)] mb-2">Access denied</p>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-8">
        You don't have the required role to access this page.
        Contact your administrator if you think this is a mistake.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
        <Button onClick={() => navigate(ROUTES.HOME)}>Home</Button>
      </div>
    </div>
  )
}
