import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, CheckCircle2, Clock, XCircle, PlusCircle, ArrowRight, BarChart3,
} from 'lucide-react'
import { useMyEvents } from '@/hooks'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import { StatCard, PageLoadingState, EmptyState, ErrorMessage } from '@/components/common'
import { ROUTES, EVENT_STATUS_LABELS } from '@/constants'
import { formatDateRange } from '@/utils'
import type { EventStatus } from '@/types'

const statusBadgeVariant: Record<EventStatus, 'success' | 'danger' | 'warning' | 'muted' | 'accent'> = {
  DRAFT: 'muted',
  PUBLISHED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'accent',
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Load first page — enough for stats
  const { data, isLoading, isError, refetch } = useMyEvents({ page: 0, size: 100 })

  if (isLoading) return <PageLoadingState />
  if (isError) return <ErrorMessage message="Failed to load your events." onRetry={() => refetch()} />

  const events = data?.content ?? []
  const totalEvents = data?.totalElements ?? 0
  const published = events.filter((e) => e.status === 'PUBLISHED').length
  const drafts = events.filter((e) => e.status === 'DRAFT').length
  const cancelled = events.filter((e) => e.status === 'CANCELLED').length

  // Recent 5 events
  const recentEvents = events.slice(0, 5)

  const firstName = user?.name?.split(' ')[0] ?? 'Organizer'

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-[var(--text-primary)]">Welcome back, {firstName}</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Here's a snapshot of your events.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Events"
          value={totalEvents}
          icon={<CalendarDays className="h-5 w-5" />}
          accent
        />
        <StatCard
          label="Published"
          value={published}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Drafts"
          value={drafts}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Cancelled"
          value={cancelled}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Recent events table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--text-muted)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Recent Events</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.ORGANIZER_EVENTS)}
            >
              View all
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(ROUTES.ORGANIZER_EVENT_CREATE)}
              className="gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Event
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="No events yet"
            description="Create your first event to get started."
            action={
              <Button onClick={() => navigate(ROUTES.ORGANIZER_EVENT_CREATE)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Event
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Event', 'Date', 'Venue', 'Tickets', 'Status', ''].map((h) => (
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
                {recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                    onClick={() => navigate(ROUTES.ORGANIZER_EVENT_DETAIL(event.id))}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[var(--text-primary)] line-clamp-1">
                        {event.name}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDateRange(event.start, event.end)}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] max-w-[160px] truncate">
                      {event.venue}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                      {event.ticketTypes.length}{' '}
                      {event.ticketTypes.length === 1 ? 'type' : 'types'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusBadgeVariant[event.status]}>
                        {EVENT_STATUS_LABELS[event.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
