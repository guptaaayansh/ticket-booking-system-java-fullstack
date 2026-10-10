import { useNavigate } from 'react-router-dom'
import { Ticket, Tag, ArrowRight } from 'lucide-react'
import { useMyTickets, usePagination } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import { EmptyState, ErrorMessage, Pagination, PageHeader, Skeleton } from '@/components/common'
import { ROUTES, TICKET_STATUS_LABELS } from '@/constants'
import { formatCurrency } from '@/utils'

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const { page, size, goToPage } = usePagination(0, 12)
  const { data, isLoading, isError, refetch } = useMyTickets({ page, size })

  return (
    <div>
      <PageHeader
        title="My Tickets"
        subtitle="All tickets you've purchased"
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.HOME)}>
            Browse Events
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage message="Failed to load your tickets." onRetry={() => refetch()} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12" />}
          title="No tickets yet"
          description="Purchase a ticket to an event and it will appear here."
          action={
            <Button onClick={() => navigate(ROUTES.HOME)}>
              Browse Events
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {data.content.map((ticket) => (
              <article
                key={ticket.id}
                className="card p-5 flex items-center gap-4 hover:border-[rgba(124,58,237,0.3)] transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(ROUTES.TICKET_DETAIL(ticket.id))}
              >
                {/* Icon */}
                <div className="h-12 w-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-[rgba(124,58,237,0.4)] transition-colors">
                  <Ticket className="h-5 w-5 text-[var(--accent)]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium text-[var(--text-primary)] text-sm">
                      {ticket.ticketType.name}
                    </h3>
                    <Badge
                      variant={
                        ticket.status === 'PURCHASED'
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {TICKET_STATUS_LABELS[ticket.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatCurrency(ticket.ticketType.price)}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">·</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[200px]">
                      {ticket.id}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all shrink-0" />
              </article>
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
