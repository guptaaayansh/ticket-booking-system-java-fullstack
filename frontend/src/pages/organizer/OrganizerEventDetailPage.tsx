import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, MapPin, Tag, Pencil, Trash2, ExternalLink, DollarSign, Users } from 'lucide-react'
import { useMyEventDetail, useDeleteEvent } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import { PageHeader, PageLoadingState, ErrorMessage, StatCard } from '@/components/common'
import { useToast } from '@/components/ui/Toast'
import {
  ROUTES, EVENT_STATUS_LABELS,
} from '@/constants'
import { formatDateRange, formatDateTime, formatCurrency, getErrorMessage } from '@/utils'
import type { EventStatus } from '@/types'

const statusVariant: Record<EventStatus, 'success' | 'danger' | 'muted' | 'accent'> = {
  DRAFT: 'muted',
  PUBLISHED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'accent',
}

export default function OrganizerEventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: event, isLoading, isError } = useMyEventDetail(eventId ?? '')
  const deleteMutation = useDeleteEvent()

  async function handleDelete() {
    if (!eventId || !event) return
    try {
      await deleteMutation.mutateAsync(eventId)
      toast.success('Event deleted', `"${event.name}" has been removed.`)
      navigate(ROUTES.ORGANIZER_EVENTS)
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err))
    }
  }

  if (isLoading) return <PageLoadingState />
  if (isError || !event) {
    return <ErrorMessage message="Event not found or you don't have access." />
  }

  const totalCapacity = event.ticketTypes.reduce(
    (sum, tt) => sum + (tt.totalAvailable ?? 0),
    0
  )
  const minPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map((tt) => tt.price))
    : null
  const maxPrice = event.ticketTypes.length
    ? Math.max(...event.ticketTypes.map((tt) => tt.price))
    : null

  return (
    <div className="max-w-4xl">
      <PageHeader
        back={{ label: 'All Events', onClick: () => navigate(ROUTES.ORGANIZER_EVENTS) }}
        title={event.name}
        actions={
          <div className="flex gap-2">
            {event.status === 'PUBLISHED' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(ROUTES.EVENT_DETAIL(event.id))}
                className="gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Public page
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.ORGANIZER_EVENT_EDIT(event.id))}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            {confirmDelete ? (
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleteMutation.isPending}
                  onClick={handleDelete}
                >
                  Confirm delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)] gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Status + meta */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[event.status]}>
                {EVENT_STATUS_LABELS[event.status]}
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              {(event.start || event.end) && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Event dates</p>
                    <p className="text-sm text-[var(--text-primary)]">
                      {formatDateRange(event.start, event.end)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Venue</p>
                  <p className="text-sm text-[var(--text-primary)]">{event.venue}</p>
                </div>
              </div>
              {(event.salesStart || event.salesEnd) && (
                <div className="flex items-start gap-2.5">
                  <Tag className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Sales window</p>
                    <p className="text-sm text-[var(--text-primary)]">
                      {formatDateTime(event.salesStart)} → {formatDateTime(event.salesEnd)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Ticket Types"
          value={event.ticketTypes.length}
          icon={<Tag className="h-5 w-5" />}
        />
        <StatCard
          label="Total Capacity"
          value={totalCapacity > 0 ? totalCapacity.toLocaleString() : '∞'}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Price Range"
          value={
            minPrice === null
              ? '—'
              : minPrice === maxPrice
              ? formatCurrency(minPrice!)
              : `${formatCurrency(minPrice!)} – ${formatCurrency(maxPrice!)}`
          }
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Ticket types table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">Ticket Types</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.ORGANIZER_EVENT_EDIT(event.id))}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        {event.ticketTypes.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">No ticket types configured.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Name', 'Price', 'Capacity', 'Description'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {event.ticketTypes.map((tt) => (
                <tr
                  key={tt.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">
                    {tt.name}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-primary)] font-mono">
                    {tt.price === 0 ? (
                      <span className="text-[var(--success)]">Free</span>
                    ) : (
                      formatCurrency(tt.price)
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                    {tt.totalAvailable != null ? tt.totalAvailable.toLocaleString() : '∞'}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-muted)] max-w-xs truncate">
                    {tt.description ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Timestamps */}
      <div className="mt-5 flex gap-4 text-xs text-[var(--text-muted)]">
        <span>Created {formatDateTime(event.createdAt)}</span>
        <span>·</span>
        <span>Updated {formatDateTime(event.updatedAt)}</span>
      </div>
    </div>
  )
}
