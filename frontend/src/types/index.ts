// ─── Enums (match backend exactly) ───────────────────────────────────────────

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
export type TicketStatus = 'PURCHASED' | 'CANCELLED'
export type QrCodeStatus = 'ACTIVE' | 'EXPIRED'
export type ValidationMethod = 'QR_SCAN' | 'MANUAL'
export type ValidationStatus = 'VALID' | 'INVALID' | 'EXPIRED'

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: { sorted: boolean; unsorted: boolean }
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  size: number
  number: number
  numberOfElements: number
  empty: boolean
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}

// ─── Error ────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
}

// ─── Ticket Types ─────────────────────────────────────────────────────────────

export interface CreateTicketTypeRequest {
  name: string
  price: number
  description?: string
  totalAvailable?: number
}

export interface UpdateTicketTypeRequest {
  id?: string          // null = create new, existing = update, omit = delete
  name: string
  price: number
  description?: string
  totalAvailable?: number
}

export interface TicketTypeResponse {
  id: string
  name: string
  price: number
  description?: string
  totalAvailable?: number
  createdAt: string
  updatedAt: string
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface CreateEventRequest {
  name: string
  start?: string          // ISO LocalDateTime
  end?: string
  venue: string
  salesStart?: string
  salesEnd?: string
  status: EventStatus
  ticketTypes: CreateTicketTypeRequest[]
}

export interface CreateEventResponse {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
  salesStart?: string
  salesEnd?: string
  status: EventStatus
  ticketTypes: TicketTypeResponse[]
  createdAt: string
  updatedAt: string
}

export interface UpdateEventRequest {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
  salesStart?: string
  salesEnd?: string
  status: EventStatus
  ticketTypes: UpdateTicketTypeRequest[]
}

export interface UpdateEventResponse {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
  salesStart?: string
  salesEnd?: string
  status: EventStatus
  ticketTypes: TicketTypeResponse[]
  createdAt: string
  updatedAt: string
}

export interface EventDetailsTicketType {
  id: string
  name: string
  price: number
  description?: string
  totalAvailable?: number
  createdAt: string
  updatedAt: string
}

export interface GetEventDetailsResponse {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
  salesStart?: string
  salesEnd?: string
  status: EventStatus
  ticketTypes: EventDetailsTicketType[]
  createdAt: string
  updatedAt: string
}

export interface ListEventTicketType {
  id: string
  name: string
  price: number
  description?: string
  totalAvailable?: number
}

export interface ListEventResponse {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
  salesStart?: string
  salesEnd?: string
  status: EventStatus
  ticketTypes: ListEventTicketType[]
}

// ─── Published Events ─────────────────────────────────────────────────────────

export interface ListPublishedEventResponse {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
}

export interface PublishedEventTicketType {
  id: string
  name: string
  price: number
  description?: string
}

export interface GetPublishedEventDetailsResponse {
  id: string
  name: string
  start?: string
  end?: string
  venue: string
  ticketTypes: PublishedEventTicketType[]
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export interface ListTicketTicketType {
  id: string
  name: string
  price: number
}

export interface ListTicketResponse {
  id: string
  status: TicketStatus
  ticketType: ListTicketTicketType
}

export interface GetTicketResponse {
  id: string
  status: TicketStatus
  price: number
  description?: string
  eventName: string
  eventVenue: string
  eventStart?: string
  eventEnd?: string
}

// ─── Ticket Validation ────────────────────────────────────────────────────────

export interface TicketValidationRequest {
  id: string
  method: ValidationMethod
}

export interface TicketValidationResponse {
  ticketId: string
  status: ValidationStatus
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
}
