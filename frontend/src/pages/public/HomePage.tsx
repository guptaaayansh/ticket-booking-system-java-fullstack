import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Ticket, ArrowRight, Search } from 'lucide-react'
import { usePublishedEvents, usePagination } from '@/hooks'
import { Button } from '@/components/ui/Button'
import {
  EmptyState,
  ErrorMessage,
  EventCardSkeleton,
  Pagination,
} from '@/components/common'
import { ROUTES, DEFAULT_PAGE_SIZE } from '@/constants'
import { formatDateRange } from '@/utils'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { page, size, goToPage } = usePagination(0, DEFAULT_PAGE_SIZE)
  const navigate = useNavigate()

  // Debounce search input
  let debounceTimer: ReturnType<typeof setTimeout>
  function handleSearchChange(value: string) {
    setSearch(value)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      setDebouncedSearch(value)
      goToPage(0)
    }, 350)
  }

  const { data, isLoading, isError, refetch } = usePublishedEvents({
    q: debouncedSearch || undefined,
    page,
    size,
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative py-16 mb-10 text-center overflow-hidden rounded-2xl" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(10,10,15,0) 60%)',
        border: '1px solid var(--border)',
      }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.1)] mb-5">
            <Ticket className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)]">Live events near you</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] mb-4" style={{ letterSpacing: '-0.03em' }}>
            Your next great<br />
            <span style={{ color: 'var(--accent)' }}>experience</span> starts here
          </h1>
          <p className="text-[var(--text-secondary)] mb-8 text-lg">
            Discover concerts, conferences, festivals, and more — all in one place.
          </p>

          {/* Hero Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search events by name or venue…"
              className="w-full h-12 pl-12 pr-4 rounded-xl text-sm
                bg-[var(--bg-card)] text-[var(--text-primary)]
                border border-[var(--border)]
                placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--border-focus)]
                transition-colors duration-150 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Results header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : 'Upcoming Events'}
          </h2>
          {data && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {data.totalElements} {data.totalElements === 1 ? 'event' : 'events'} found
            </p>
          )}
        </div>
        {debouncedSearch && (
          <Button variant="ghost" size="sm" onClick={() => handleSearchChange('')}>
            Clear search
          </Button>
        )}
      </div>

      {/* Event grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage
          message="Failed to load events. Please try again."
          onRetry={() => refetch()}
        />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12" />}
          title={debouncedSearch ? 'No events match your search' : 'No events yet'}
          description={
            debouncedSearch
              ? 'Try a different name or venue.'
              : 'Check back soon for upcoming events.'
          }
          action={
            debouncedSearch ? (
              <Button variant="secondary" onClick={() => handleSearchChange('')}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.content.map((event) => (
              <article
                key={event.id}
                className="card p-5 flex flex-col gap-4 group hover:border-[rgba(124,58,237,0.35)] transition-all duration-200 cursor-pointer"
                onClick={() => navigate(ROUTES.EVENT_DETAIL(event.id))}
              >
                {/* Event color band */}
                <div
                  className="h-1.5 w-12 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />

                <div className="flex-1 flex flex-col gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)] text-base leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {event.name}
                  </h3>

                  <div className="flex flex-col gap-1.5 mt-1">
                    {(event.start || event.end) && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)] mt-0.5 shrink-0" />
                        <span className="text-xs text-[var(--text-secondary)]">
                          {formatDateRange(event.start, event.end)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[var(--text-muted)] mt-0.5 shrink-0" />
                      <span className="text-xs text-[var(--text-secondary)] line-clamp-1">
                        {event.venue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">View tickets</span>
                  <ArrowRight className="h-4 w-4 text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
                </div>
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
