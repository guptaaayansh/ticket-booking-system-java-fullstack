import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[var(--bg-primary)]',
    'disabled:pointer-events-none disabled:opacity-40 select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--accent)] text-white',
          'hover:bg-[var(--accent-hover)]',
          'active:scale-[0.98]',
        ].join(' '),
        secondary: [
          'bg-[var(--bg-surface)] text-[var(--text-primary)]',
          'border border-[var(--border)]',
          'hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]',
          'active:scale-[0.98]',
        ].join(' '),
        ghost: [
          'text-[var(--text-secondary)]',
          'hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]',
        ].join(' '),
        danger: [
          'bg-[var(--danger)] text-white',
          'hover:opacity-90 active:scale-[0.98]',
        ].join(' '),
        outline: [
          'border border-[var(--border)] text-[var(--text-primary)]',
          'hover:bg-[var(--bg-surface)]',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
