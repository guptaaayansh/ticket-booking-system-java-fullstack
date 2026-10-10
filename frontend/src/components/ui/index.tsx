import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils'

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'success' | 'danger' | 'warning' | 'muted' | 'accent'
}

export function Badge({ children, className, variant = 'muted' }: BadgeProps) {
  const variantClass = `badge-${variant}`
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClass,
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-lg text-sm',
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'border border-[var(--border)]',
          'placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:border-[var(--border-focus)]',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[var(--danger)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Label ────────────────────────────────────────────────────────────────────

export function Label({
  children,
  htmlFor,
  required,
  className,
}: {
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
  className?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-sm font-medium text-[var(--text-secondary)]', className)}
    >
      {children}
      {required && <span className="ml-1 text-[var(--danger)]">*</span>}
    </label>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        className={cn(
          'w-full min-h-[80px] px-3 py-2 rounded-lg text-sm resize-y',
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'border border-[var(--border)]',
          'placeholder:text-[var(--text-muted)]',
          'focus:outline-none focus:border-[var(--border-focus)]',
          'transition-colors duration-150',
          error && 'border-[var(--danger)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <select
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-lg text-sm appearance-none cursor-pointer',
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'border border-[var(--border)]',
          'focus:outline-none focus:border-[var(--border-focus)]',
          'transition-colors duration-150',
          'disabled:opacity-50',
          error && 'border-[var(--danger)]',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── FormField wrapper ────────────────────────────────────────────────────────

export function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
  hint,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-[var(--border)]', className)} />
}
