import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toast: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    warning: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; colorClass: string }> = {
  success: { icon: CheckCircle, colorClass: 'text-[var(--success)] border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)]' },
  error: { icon: AlertCircle, colorClass: 'text-[var(--danger)] border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)]' },
  warning: { icon: AlertTriangle, colorClass: 'text-[var(--warning)] border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)]' },
  info: { icon: Info, colorClass: 'text-[var(--accent)] border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.08)]' },
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const { icon: Icon, colorClass } = toastConfig[t.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-80 p-4 rounded-xl border',
        'bg-[var(--bg-card)] shadow-xl',
        'animate-in slide-in-from-right-5 fade-in duration-200',
        colorClass
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{t.title}</p>
        {t.message && (
          <p className="text-xs mt-0.5 text-[var(--text-secondary)]">{t.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue['toast'] {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx.toast
}
