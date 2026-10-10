import apiClient from './client'
import type { Page, PageParams, ListTicketResponse, GetTicketResponse } from '@/types'

export const ticketsApi = {
  /**
   * POST /api/v1/events/:eventId/ticket-types/:ticketTypeId/tickets
   * Purchase a ticket (authenticated user)
   * Returns 204 No Content on success
   */
  purchase: async (eventId: string, ticketTypeId: string): Promise<void> => {
    await apiClient.post(`/events/${eventId}/ticket-types/${ticketTypeId}/tickets`)
  },

  /**
   * GET /api/v1/tickets
   * List all tickets purchased by the authenticated user
   */
  list: async (params?: PageParams): Promise<Page<ListTicketResponse>> => {
    const { data } = await apiClient.get<Page<ListTicketResponse>>('/tickets', { params })
    return data
  },

  /**
   * GET /api/v1/tickets/:id
   * Get full details of a ticket owned by the caller
   */
  getById: async (id: string): Promise<GetTicketResponse> => {
    const { data } = await apiClient.get<GetTicketResponse>(`/tickets/${id}`)
    return data
  },

  /**
   * GET /api/v1/tickets/:id/qr-codes
   * Returns raw PNG bytes (image/png)
   * Returns a Blob so we can create an object URL for display/download
   */
  getQrCode: async (ticketId: string): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`/tickets/${ticketId}/qr-codes`, {
      responseType: 'blob',
    })
    return data
  },
}
