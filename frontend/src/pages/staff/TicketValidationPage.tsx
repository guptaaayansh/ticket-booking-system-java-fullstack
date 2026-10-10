import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ScanLine, Keyboard, CheckCircle2, XCircle, AlertTriangle, RotateCcw,
} from 'lucide-react'
import { useValidateTicket } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input, FormField } from '@/components/ui/index'
import { PageHeader } from '@/components/common'
import { useToast } from '@/components/ui/Toast'
import QrCameraScanner from '@/components/validation/QrCameraScanner'
import { ticketValidationSchema, type TicketValidationFormValues } from '@/schemas'
import { getErrorMessage } from '@/utils'
import type { TicketValidationResponse, ValidationMethod } from '@/types'
import { cn } from '@/utils'

// ─── Result card ──────────────────────────────────────────────────────────────

function ValidationResult({
  result,
  onReset,
}: {
  result: TicketValidationResponse
  onReset: () => void
}) {
  const config = {
    VALID: {
      icon: CheckCircle2,
      label: 'Entry Granted',
      sub: 'Ticket is valid — welcome!',
      colorClass: 'text-[var(--success)]',
      bgClass: 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.3)]',
    },
    INVALID: {
      icon: XCircle,
      label: 'Entry Denied',
      sub: 'This ticket has already been used.',
      colorClass: 'text-[var(--danger)]',
      bgClass: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)]',
    },
    EXPIRED: {
      icon: AlertTriangle,
      label: 'Ticket Expired',
      sub: 'This ticket is no longer valid.',
      colorClass: 'text-[var(--warning)]',
      bgClass: 'bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.3)]',
    },
  }

  const { icon: Icon, label, sub, colorClass, bgClass } = config[result.status]

  return (
    <div
      className={cn(
        'rounded-2xl border p-8 flex flex-col items-center gap-4 text-center',
        bgClass
      )}
    >
      <div
        className={cn(
          'h-20 w-20 rounded-full flex items-center justify-center',
          bgClass
        )}
      >
        <Icon className={cn('h-10 w-10', colorClass)} />
      </div>

      <div>
        <h2 className={cn('text-2xl font-bold', colorClass)}>{label}</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{sub}</p>
      </div>

      <div className="w-full max-w-xs py-3 border-t border-[var(--border)] mt-2">
        <p className="text-xs text-[var(--text-muted)] mb-1">Ticket ID</p>
        <p className="text-xs font-mono text-[var(--text-secondary)] break-all">
          {result.ticketId}
        </p>
      </div>

      <Button variant="secondary" onClick={onReset} className="gap-2 mt-2">
        <RotateCcw className="h-4 w-4" />
        Validate another ticket
      </Button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TicketValidationPage() {
  const toast = useToast()
  const validateMutation = useValidateTicket()
  const [result, setResult] = useState<TicketValidationResponse | null>(null)
  const [method, setMethod] = useState<ValidationMethod>('MANUAL')
  // Tracks whether a scan-triggered validation is already in flight
  // so we don't fire the same QR code twice while it stays in frame
  const [scanLocked, setScanLocked] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TicketValidationFormValues>({
    resolver: zodResolver(ticketValidationSchema),
    defaultValues: { method: 'MANUAL', id: '' },
  })

  function switchMethod(m: ValidationMethod) {
    setMethod(m)
    setValue('method', m)
    reset({ method: m, id: '' })
    setResult(null)
    setScanLocked(false)
  }

  async function validate(id: string, validationMethod: ValidationMethod) {
    try {
      const res = await validateMutation.mutateAsync({ id, method: validationMethod })
      setResult(res)
    } catch (err) {
      toast.error('Validation error', getErrorMessage(err))
    }
  }

  // Called by the camera scanner whenever it decodes a QR code
  const handleQrScan = useCallback(
    (scannedText: string) => {
      // Ignore if already processing or result shown
      if (scanLocked || result) return

      // Basic UUID format check
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(scannedText)) {
        toast.error('Invalid QR code', 'This QR code does not contain a valid ticket ID.')
        return
      }

      setScanLocked(true)
      validate(scannedText, 'QR_SCAN').finally(() => {
        // After a short delay let scanning resume (for "scan another" flow)
        setTimeout(() => setScanLocked(false), 2000)
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scanLocked, result]
  )

  // Manual form submit
  async function onSubmit(values: TicketValidationFormValues) {
    await validate(values.id, values.method)
  }

  function handleReset() {
    setResult(null)
    reset({ method, id: '' })
    setScanLocked(false)
  }

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="Ticket Validation"
        subtitle="Verify tickets at event entry"
      />

      {result ? (
        <ValidationResult result={result} onReset={handleReset} />
      ) : (
        <div className="flex flex-col gap-5">

          {/* ── Tab toggle ── */}
          <div className="card p-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => switchMethod('MANUAL')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                method === 'MANUAL'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              )}
            >
              <Keyboard className="h-4 w-4" />
              Manual ID
            </button>
            <button
              type="button"
              onClick={() => switchMethod('QR_SCAN')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                method === 'QR_SCAN'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              )}
            >
              <ScanLine className="h-4 w-4" />
              QR Camera Scan
            </button>
          </div>

          {/* ── QR SCAN tab — live camera ── */}
          {method === 'QR_SCAN' && (
            <div className="card p-5 flex flex-col gap-5">
              <div className="text-center">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Scan QR Code
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Open camera automatically detects and validates the QR code
                </p>
              </div>

              {/* Live camera feed */}
              <QrCameraScanner
                enabled={method === 'QR_SCAN' && !result}
                onScan={handleQrScan}
              />

              {/* Scanning status indicator */}
              <div className="flex items-center justify-center gap-2">
                {scanLocked ? (
                  <div className="flex items-center gap-2 text-xs text-[var(--accent)]">
                    <div
                      className="h-2 w-2 rounded-full bg-[var(--accent)]"
                      style={{ animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }}
                    />
                    Validating…
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <div
                      className="h-2 w-2 rounded-full bg-[var(--success)]"
                      style={{ animation: 'ping 2s ease-in-out infinite' }}
                    />
                    Ready to scan
                  </div>
                )}
              </div>

              <style>{`
                @keyframes ping {
                  75%, 100% { transform: scale(1.8); opacity: 0; }
                }
              `}</style>
            </div>
          )}

          {/* ── MANUAL tab — type/paste UUID ── */}
          {method === 'MANUAL' && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="card p-6 flex flex-col gap-6"
              noValidate
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center mb-1"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.3)',
                  }}
                >
                  <Keyboard className="h-7 w-7 text-[var(--accent)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Enter Ticket ID
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-xs">
                  Paste or type the ticket UUID from the attendee's confirmation.
                </p>
              </div>

              <FormField
                label="Ticket ID (UUID)"
                htmlFor="ticket-id"
                required
                error={errors.id?.message}
              >
                <Input
                  id="ticket-id"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="font-mono text-sm"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  {...register('id')}
                  error={errors.id?.message}
                />
              </FormField>

              <input type="hidden" {...register('method')} />

              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="w-full gap-2"
              >
                <Keyboard className="h-4 w-4" />
                Validate Ticket
              </Button>
            </form>
          )}

          {/* Tip */}
          <div className="card-surface p-4 rounded-xl">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              <span className="font-medium text-[var(--text-secondary)]">Tip: </span>
              {method === 'QR_SCAN'
                ? 'The camera validates automatically the moment it reads a valid QR code — no button needed. Works best in good lighting.'
                : 'You can also copy and paste ticket IDs directly from the attendee\'s confirmation email.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
