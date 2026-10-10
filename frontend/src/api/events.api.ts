import apiClient from './client'
import type {
  Page,
  PageParams,
  CreateEventRequest,
  CreateEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  ListEventResponse,
  GetEventDetailsResponse,
} from '@/types'

export const eventsApi = {
  /**
   * POST /api/v1/events
   * Create a new event (ROLE_ORGANIZER)
   */
  create: async (payload: CreateEventRequest): Promise<CreateEventResponse> => {
    const { data } = await apiClient.post<CreateEventResponse>('/events', payload)
    return data
  },

  /**
   * GET /api/v1/events
   * List all events owned by the authenticated organizer
   */
  list: async (params?: PageParams): Promise<Page<ListEventResponse>> => {
    const { data } = await apiClient.get<Page<ListEventResponse>>('/events', { params })
    return data
  },

  /**
   * GET /api/v1/events/:id
   * Get a single event (must be owned by caller)
   */
  getById: async (id: string): Promise<GetEventDetailsResponse> => {
    const { data } = await apiClient.get<GetEventDetailsResponse>(`/events/${id}`)
    return data
  },

  /**
   * PUT /api/v1/events/:id
   * Full update with ticket type merge (create/update/delete in one call)
   * Note: body must include id matching the path param
   */
  update: async (id: string, payload: UpdateEventRequest): Promise<UpdateEventResponse> => {
    const { data } = await apiClient.put<UpdateEventResponse>(`/events/${id}`, payload)
    return data
  },

  /**
   * DELETE /api/v1/events/:id
   * Delete an event owned by caller (silent if not found)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`)
  },
}
