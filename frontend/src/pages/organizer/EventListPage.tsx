import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, Eye, CalendarDays } from 'lucide-react'
import { useMyEvents, useDeleteEvent, usePagination } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import {
  PageHeader, EmptyState, ErrorMessage, Pagination, Skeleton,
} from '@/components/common'
import { useToast } from '@/components/ui/Toast'
import { ROUTES, EVENT_STATUS_LABELS } from '@/constants'
import { formatDateRange, formatCurrency, getErrorMessage } from '@/utils'
import type { EventStatus, ListEventResponse } from '@/types'

const statusVariant: Record<EventStatus, 'success' | 'danger' | 'muted' | 'accent'> = {
  DRAFT: 'muted',
  PUBLISHED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'accent',
}

export default function EventListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { page, size, goToPage } = usePagination(0, 10)
  const { data, isLoading, isError, refetch } = useMyEvents({ page, size })
  const deleteMutation = useDeleteEvent()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function handleDelete(event: ListEventResponse) {
    setDeletingId(event.id)
    try {
      await deleteMutation.mutateAsync(event.id)
      toast.success('Event deleted', `"${event.name}" has been removed.`)
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Events"
        subtitle="Manage all your events and ticket types"
        actions={
          <Button onClick={() => navigate(ROUTES.ORGANIZER_EVENT_CREATE)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Event
          </Button>
        }
      />

      {isLoading ? (
        <div className="card overflow-hidden">
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <ErrorMessage message="Failed to load events." onRetry={() => refetch()} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No events yet"
          description="Create your first event to start selling tickets."
          action={
            <Button onClick={() => navigate(ROUTES.ORGANIZER_EVENT_CREATE)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Event
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Event', 'Date', 'Venue', 'Ticket Types', 'Status', 'Actions'].map((h) => (
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
                {data.content.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--text-primary)] max-w-[200px] truncate">
                        {event.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap text-xs">
                      {formatDateRange(event.start, event.end)}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)] max-w-[150px] truncate text-xs">
                      {event.venue}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        {event.ticketTypes.slice(0, 2).map((tt) => (
                          <span key={tt.id} className="text-xs text-[var(--text-secondary)]">
                            {tt.name} — {tt.price === 0 ? 'Free' : formatCurrency(tt.price)}
                          </span>
                        ))}
                        {event.ticketTypes.length > 2 && (
                          <span className="text-xs text-[var(--text-muted)]">
                            +{event.ticketTypes.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant[event.status]}>
                        {EVENT_STATUS_LABELS[event.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(ROUTES.ORGANIZER_EVENT_DETAIL(event.id))}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(ROUTES.ORGANIZER_EVENT_EDIT(event.id))}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {confirmDeleteId === event.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="danger"
                              size="sm"
                              loading={deletingId === event.id}
                              onClick={() => handleDelete(event)}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmDeleteId(event.id)}
                            title="Delete"
                            className="text-[var(--danger)] hover:bg-[rgba(239,68,68,0.1)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {data.content.map((event) => (
              <div key={event.id} className="card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{event.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{event.venue}</p>
                  </div>
                  <Badge variant={statusVariant[event.status]}>
                    {EVENT_STATUS_LABELS[event.status]}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatDateRange(event.start, event.end)}
                </p>
                <div className="flex gap-2 pt-1 border-t border-[var(--border)]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(ROUTES.ORGANIZER_EVENT_DETAIL(event.id))}
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(ROUTES.ORGANIZER_EVENT_EDIT(event.id))}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDeleteId(event.id)}
                    className="text-[var(--danger)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {confirmDeleteId === event.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      loading={deletingId === event.id}
                      onClick={() => handleDelete(event)}
                    >
                      Delete permanently
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={data.number}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            pageSize={data.size}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  )
}
