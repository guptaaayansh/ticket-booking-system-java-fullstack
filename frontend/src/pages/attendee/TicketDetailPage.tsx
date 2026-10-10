import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Tag, Download, QrCode, DollarSign } from 'lucide-react'
import { useMyTicketDetail, useTicketQrCode } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import { PageLoadingState, ErrorMessage, PageHeader, Skeleton } from '@/components/common'
import { ROUTES, TICKET_STATUS_LABELS } from '@/constants'
import { formatCurrency, formatDateRange } from '@/utils'
import { useToast } from '@/components/ui/Toast'

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [qrObjectUrl, setQrObjectUrl] = useState<string | null>(null)

  const { data: ticket, isLoading, isError } = useMyTicketDetail(ticketId ?? '')
  const {
    data: qrBlob,
    isLoading: qrLoading,
    isError: qrError,
  } = useTicketQrCode(ticketId ?? '', !!ticket && ticket.status === 'PURCHASED')

  // Convert blob → object URL
  useEffect(() => {
    if (!qrBlob) return
    const url = URL.createObjectURL(qrBlob)
    setQrObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [qrBlob])

  function handleDownload() {
    if (!qrObjectUrl || !ticketId) return
    const a = document.createElement('a')
    a.href = qrObjectUrl
    a.download = `ticket-qr-${ticketId.slice(0, 8)}.png`
    a.click()
    toast.success('QR code downloaded')
  }

  if (isLoading) return <PageLoadingState />
  if (isError || !ticket) {
    return (
      <ErrorMessage message="This ticket could not be found." />
    )
  }

  const isActive = ticket.status === 'PURCHASED'

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader
        back={{ label: 'My Tickets', onClick: () => navigate(ROUTES.MY_TICKETS) }}
        title="Ticket Details"
      />

      {/* Ticket card */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          borderColor: isActive ? 'rgba(124,58,237,0.4)' : 'var(--border)',
          boxShadow: isActive ? '0 0 40px rgba(124,58,237,0.1)' : 'none',
        }}
      >
        {/* Top strip */}
        <div
          className="px-6 py-5"
          style={{
            background: isActive
              ? 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.05) 100%)'
              : 'var(--bg-surface)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">Event</p>
              <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                {ticket.eventName}
              </h2>
            </div>
            <Badge variant={isActive ? 'success' : 'danger'}>
              {TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative h-0 border-t border-dashed border-[var(--border)]">
          <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[var(--bg-primary)]" />
          <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[var(--bg-primary)]" />
        </div>

        {/* Event details */}
        <div className="bg-[var(--bg-card)] px-6 py-5 flex flex-col gap-3">
          {(ticket.eventStart || ticket.eventEnd) && (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Date &amp; Time</p>
                <p className="text-sm text-[var(--text-primary)]">
                  {formatDateRange(ticket.eventStart, ticket.eventEnd)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Venue</p>
              <p className="text-sm text-[var(--text-primary)]">{ticket.eventVenue}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Ticket Type</p>
              <p className="text-sm text-[var(--text-primary)]">
                {ticket.description ?? 'Standard admission'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Price Paid</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative h-0 border-t border-dashed border-[var(--border)]">
          <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[var(--bg-primary)]" />
          <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[var(--bg-primary)]" />
        </div>

        {/* QR Code section */}
        <div className="bg-[var(--bg-card)] px-6 py-6 flex flex-col items-center gap-4">
          {isActive ? (
            <>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                Scan at entry
              </p>

              {qrLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-52 w-52 rounded-xl" />
                  <p className="text-xs text-[var(--text-muted)]">Generating QR code…</p>
                </div>
              ) : qrError || !qrObjectUrl ? (
                <div className="h-52 w-52 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col items-center justify-center gap-2">
                  <QrCode className="h-8 w-8 text-[var(--text-muted)]" />
                  <p className="text-xs text-[var(--text-muted)]">QR code unavailable</p>
                </div>
              ) : (
                <div
                  className="p-3 rounded-xl bg-white"
                  style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
                >
                  <img
                    src={qrObjectUrl}
                    alt="Ticket QR code — present at event entry"
                    className="h-52 w-52 object-contain block"
                  />
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                disabled={!qrObjectUrl}
                className="gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                Download QR Code
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <QrCode className="h-10 w-10 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">
                QR code not available for cancelled tickets.
              </p>
            </div>
          )}

          {/* Ticket ID */}
          <div className="w-full pt-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] text-center mb-1">Ticket ID</p>
            <p className="text-xs font-mono text-[var(--text-secondary)] text-center break-all">
              {ticket.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
