import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'
import type { ApiError } from '@/types'

// ─── Class name helper ────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return '—'
    return format(date, 'MMM d, yyyy · h:mm a')
  } catch {
    return '—'
  }
}

export function formatDateRange(startStr?: string | null, endStr?: string | null): string {
  const start = formatDateTime(startStr)
  const end = formatDateTime(endStr)
  if (start === '—' && end === '—') return 'Dates TBD'
  if (end === '—') return start
  return `${start} – ${end}`
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// ─── Error parsing ────────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred'

  // Axios error with backend ApiError shape
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosErr = error as { response?: { data?: ApiError | unknown } }
    const data = axiosErr.response?.data
    if (data && typeof data === 'object' && 'error' in data) {
      return (data as ApiError).error
    }
  }

  if (error instanceof Error) return error.message

  return 'An unexpected error occurred'
}

// ─── Local datetime format for <input type="datetime-local"> ──────────────────

export function toInputDateTime(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return ''
    // format as YYYY-MM-DDTHH:mm (no seconds, no Z)
    return format(date, "yyyy-MM-dd'T'HH:mm")
  } catch {
    return ''
  }
}

export function fromInputDateTime(inputValue: string): string | undefined {
  if (!inputValue) return undefined
  // Input gives "2024-06-01T18:00" — backend wants LocalDateTime "2024-06-01T18:00:00"
  return inputValue.length === 16 ? `${inputValue}:00` : inputValue
}

// ─── Truncate text ────────────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}…`
}

// ─── Pluralize ────────────────────────────────────────────────────────────────

export function pluralize(count: number, word: string, plural?: string): string {
  return count === 1 ? `${count} ${word}` : `${count} ${plural ?? word + 's'}`
}
