import { z } from 'zod'

// Zod v4 uses .error() instead of invalid_type_error / required_error

// ─── Ticket Type schema (shared) ──────────────────────────────────────────────

const ticketTypeBaseSchema = z.object({
  name: z.string().min(1, 'Ticket type name is required'),
  price: z.number({ error: 'Price must be a number' }).min(0, 'Price must be 0 or greater'),
  description: z.string().optional(),
  totalAvailable: z
    .number({ error: 'Must be a whole number' })
    .int('Must be a whole number')
    .min(1, 'Must have at least 1 ticket available')
    .optional(),
})

// ─── Create Event ─────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  venue: z.string().min(1, 'Venue is required'),
  start: z.string().optional(),
  end: z.string().optional(),
  salesStart: z.string().optional(),
  salesEnd: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
  ticketTypes: z.array(ticketTypeBaseSchema).min(1, 'At least one ticket type is required'),
})

export type CreateEventFormValues = z.infer<typeof createEventSchema>

// ─── Update Event ─────────────────────────────────────────────────────────────

const updateTicketTypeSchema = ticketTypeBaseSchema.extend({
  id: z.string().uuid().optional(),
})

export const updateEventSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
  name: z.string().min(1, 'Event name is required'),
  venue: z.string().min(1, 'Venue is required'),
  start: z.string().optional(),
  end: z.string().optional(),
  salesStart: z.string().optional(),
  salesEnd: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
  ticketTypes: z.array(updateTicketTypeSchema).min(1, 'At least one ticket type is required'),
})

export type UpdateEventFormValues = z.infer<typeof updateEventSchema>

// ─── Ticket Validation ────────────────────────────────────────────────────────

export const ticketValidationSchema = z.object({
  id: z.string().uuid('Must be a valid UUID'),
  method: z.enum(['QR_SCAN', 'MANUAL']),
})

export type TicketValidationFormValues = z.infer<typeof ticketValidationSchema>
