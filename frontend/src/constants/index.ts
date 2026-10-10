// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public
  HOME: '/',
  EVENT_DETAIL: (id: string) => `/events/${id}`,

  // Attendee
  MY_TICKETS: '/my-tickets',
  TICKET_DETAIL: (id: string) => `/my-tickets/${id}`,

  // Organizer
  ORGANIZER_DASHBOARD: '/organizer/dashboard',
  ORGANIZER_EVENTS: '/organizer/events',
  ORGANIZER_EVENT_CREATE: '/organizer/events/new',
  ORGANIZER_EVENT_EDIT: (id: string) => `/organizer/events/${id}/edit`,
  ORGANIZER_EVENT_DETAIL: (id: string) => `/organizer/events/${id}`,

  // Staff
  STAFF_VALIDATE: '/staff/validate',

  // Errors
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/403',
} as const

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  PUBLISHED_EVENTS: 'publishedEvents',
  PUBLISHED_EVENT_DETAIL: 'publishedEventDetail',
  MY_EVENTS: 'myEvents',
  MY_EVENT_DETAIL: 'myEventDetail',
  MY_TICKETS: 'myTickets',
  MY_TICKET_DETAIL: 'myTicketDetail',
  TICKET_QR_CODE: 'ticketQrCode',
} as const

// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLES = {
  ORGANIZER: 'ROLE_ORGANIZER',
  STAFF: 'ROLE_STAFF',
} as const

// ─── Event Status Display ─────────────────────────────────────────────────────

export const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

export const EVENT_STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge-muted',
  PUBLISHED: 'badge-success',
  CANCELLED: 'badge-danger',
  COMPLETED: 'badge-accent',
}

// ─── Ticket Status Display ────────────────────────────────────────────────────

export const TICKET_STATUS_LABELS: Record<string, string> = {
  PURCHASED: 'Active',
  CANCELLED: 'Cancelled',
}

export const TICKET_STATUS_BADGE: Record<string, string> = {
  PURCHASED: 'badge-success',
  CANCELLED: 'badge-danger',
}

// ─── Validation Status Display ────────────────────────────────────────────────

export const VALIDATION_STATUS_LABELS: Record<string, string> = {
  VALID: 'Valid — Entry granted',
  INVALID: 'Invalid — Already used',
  EXPIRED: 'Expired',
}

export const VALIDATION_STATUS_BADGE: Record<string, string> = {
  VALID: 'badge-success',
  INVALID: 'badge-danger',
  EXPIRED: 'badge-warning',
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const API_BASE = '/api/v1'

export const DEFAULT_PAGE_SIZE = 12
