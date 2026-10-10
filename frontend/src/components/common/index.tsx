import { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Search, AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 text-[var(--accent)]', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function PageLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner className="h-8 w-8" />
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function EventCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-9 w-full mt-2" />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-[var(--text-muted)]">
        {icon ?? <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}

// ─── Error Message ────────────────────────────────────────────────────────────

export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertCircle className="h-10 w-10 text-[var(--danger)] mb-3" />
      <p className="text-sm text-[var(--text-secondary)] mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  back?: { label: string; onClick: () => void }
}

export function PageHeader({ title, subtitle, actions, back }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {back && (
        <button
          onClick={back.onClick}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          {back.label}
        </button>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="mt-1 text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-10 pl-9 pr-4 rounded-lg text-sm',
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'border border-[var(--border)]',
          'placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:border-[var(--border-focus)]',
          'transition-colors duration-150'
        )}
      />
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number      // 0-based
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const start = currentPage * pageSize + 1
  const end = Math.min((currentPage + 1) * pageSize, totalElements)

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
      <p className="text-sm text-[var(--text-muted)]">
        Showing {start}–{end} of {totalElements}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[var(--text-muted)] text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                p === currentPage
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
              )}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  if (current < 4) return [0, 1, 2, 3, 4, '…', total - 1]
  if (current > total - 5) return [0, '…', total - 5, total - 4, total - 3, total - 2, total - 1]
  return [0, '…', current - 1, current, current + 1, '…', total - 1]
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string | number
  icon: ReactNode
  accent?: boolean
}) {
  return (
    <div className={cn('card p-5 flex items-center gap-4', accent && 'glow-accent')}>
      <div
        className={cn(
          'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
          accent ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  )
}
