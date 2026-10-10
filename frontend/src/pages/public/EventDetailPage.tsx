import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Ticket, Tag, ShoppingCart, ArrowRight } from 'lucide-react'
import { usePublishedEventDetail, usePurchaseTicket } from '@/hooks'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { PageLoadingState, ErrorMessage, PageHeader } from '@/components/common'
import { useToast } from '@/components/ui/Toast'
import { ROUTES } from '@/constants'
import { formatCurrency, formatDateRange, formatDateTime, getErrorMessage } from '@/utils'
import type { PublishedEventTicketType } from '@/types'

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const toast = useToast()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const { data: event, isLoading, isError, refetch } = usePublishedEventDetail(eventId ?? '')
  const purchaseMutation = usePurchaseTicket()

  async function handlePurchase(ticketType: PublishedEventTicketType) {
    if (!isAuthenticated) {
      login()
      return
    }

    if (!eventId) return
    setPurchasingId(ticketType.id)
    try {
      await purchaseMutation.mutateAsync({ eventId, ticketTypeId: ticketType.id })
      toast.success('Ticket purchased!', `Your ${ticketType.name} ticket is ready in My Tickets.`)
    } catch (err) {
      toast.error('Purchase failed', getErrorMessage(err))
    } finally {
      setPurchasingId(null)
    }
  }

  if (isLoading) return <PageLoadingState />
  if (isError || !event) {
    return (
      <ErrorMessage
        message="This event could not be found or is no longer available."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        back={{ label: 'Back to Events', onClick: () => navigate(ROUTES.HOME) }}
        title={event.name}
      />

      {/* Event meta */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Visual accent */}
          <div
            className="hidden sm:flex flex-col items-center justify-center w-24 h-24 rounded-xl shrink-0"
            style={{ background: 'var(--accent-glow)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <Ticket className="h-8 w-8 text-[var(--accent)]" />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{event.name}</h2>

            <div className="flex flex-col gap-2">
              {(event.start || event.end) && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      {formatDateRange(event.start, event.end)}
                    </p>
                    {event.start && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Doors open {formatDateTime(event.start)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--text-primary)]">{event.venue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket types */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-[var(--text-muted)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Available Tickets</h3>
        </div>

        {event.ticketTypes.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[var(--text-muted)] text-sm">
              No tickets are available for this event yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {event.ticketTypes.map((tt) => (
              <div
                key={tt.id}
                className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[rgba(124,58,237,0.3)] transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[var(--text-primary)]">{tt.name}</h4>
                  </div>
                  {tt.description && (
                    <p className="text-sm text-[var(--text-secondary)]">{tt.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">
                      {tt.price === 0 ? (
                        <span className="text-[var(--success)]">Free</span>
                      ) : (
                        formatCurrency(tt.price)
                      )}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] text-right">per ticket</p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(tt)}
                    loading={purchasingId === tt.id}
                    disabled={purchasingId !== null && purchasingId !== tt.id}
                    className="shrink-0 gap-2"
                  >
                    {!isAuthenticated ? (
                      <>Sign in to buy <ArrowRight className="h-3.5 w-3.5" /></>
                    ) : (
                      <><ShoppingCart className="h-3.5 w-3.5" /> Get Ticket</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Post-purchase CTA */}
      {isAuthenticated && (
        <div className="mt-8 card-surface p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Already purchased? View your tickets and QR codes.
          </p>
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.MY_TICKETS)}>
            My Tickets <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
