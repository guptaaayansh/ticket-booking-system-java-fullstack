import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { publishedEventsApi } from '@/api/publishedEvents.api'
import { eventsApi } from '@/api/events.api'
import { ticketsApi } from '@/api/tickets.api'
import { ticketValidationApi } from '@/api/ticketValidation.api'
import { QUERY_KEYS } from '@/constants'
import type {
  Page,
  PageParams,
  ListPublishedEventResponse,
  GetPublishedEventDetailsResponse,
  CreateEventRequest,
  UpdateEventRequest,
  ListEventResponse,
  GetEventDetailsResponse,
  ListTicketResponse,
  GetTicketResponse,
  TicketValidationRequest,
} from '@/types'

// ─── Published Events ─────────────────────────────────────────────────────────

export function usePublishedEvents(params: PageParams & { q?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.PUBLISHED_EVENTS, params],
    queryFn: () => publishedEventsApi.list(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function usePublishedEventDetail(
  id: string,
  options?: Partial<UseQueryOptions<GetPublishedEventDetailsResponse>>
) {
  return useQuery({
    queryKey: [QUERY_KEYS.PUBLISHED_EVENT_DETAIL, id],
    queryFn: () => publishedEventsApi.getById(id),
    enabled: !!id,
    staleTime: 60_000,
    ...options,
  })
}

// ─── Organizer Events ─────────────────────────────────────────────────────────

export function useMyEvents(params?: PageParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_EVENTS, params],
    queryFn: () => eventsApi.list(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useMyEventDetail(
  id: string,
  options?: Partial<UseQueryOptions<GetEventDetailsResponse>>
) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_EVENT_DETAIL, id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventRequest) => eventsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_EVENTS] })
    },
  })
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateEventRequest) => eventsApi.update(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_EVENTS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_EVENT_DETAIL, eventId] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_EVENTS] })
    },
  })
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export function usePurchaseTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, ticketTypeId }: { eventId: string; ticketTypeId: string }) =>
      ticketsApi.purchase(eventId, ticketTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_TICKETS] })
    },
  })
}

export function useMyTickets(params?: PageParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_TICKETS, params],
    queryFn: () => ticketsApi.list(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useMyTicketDetail(
  id: string,
  options?: Partial<UseQueryOptions<GetTicketResponse>>
) {
  return useQuery({
    queryKey: [QUERY_KEYS.MY_TICKET_DETAIL, id],
    queryFn: () => ticketsApi.getById(id),
    enabled: !!id,
    staleTime: 60_000,
    ...options,
  })
}

export function useTicketQrCode(ticketId: string, enabled: boolean) {
  return useQuery({
    queryKey: [QUERY_KEYS.TICKET_QR_CODE, ticketId],
    queryFn: () => ticketsApi.getQrCode(ticketId),
    enabled: !!ticketId && enabled,
    staleTime: Infinity,  // QR codes don't change
    gcTime: 5 * 60 * 1000,
  })
}

// ─── Ticket Validation ────────────────────────────────────────────────────────

export function useValidateTicket() {
  return useMutation({
    mutationFn: (payload: TicketValidationRequest) =>
      ticketValidationApi.validate(payload),
  })
}

// ─── Pagination helper ────────────────────────────────────────────────────────

export function usePagination(initialPage = 0, initialSize = 12) {
  const [page, setPage] = useState(initialPage)
  const [size] = useState(initialSize)

  function goToPage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { page, size, goToPage }
}

// useState must be imported — add it here
import { useState } from 'react'

// ─── Search with debounce ─────────────────────────────────────────────────────

export function useSearch(initialValue = '', delay = 350) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  const timeoutRef = { current: 0 as ReturnType<typeof setTimeout> }

  function handleChange(value: string) {
    setInputValue(value)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
  }

  return { inputValue, debouncedValue, handleChange }
}

// Re-export page data type for convenience
export type { Page, ListPublishedEventResponse, ListEventResponse, ListTicketResponse }
