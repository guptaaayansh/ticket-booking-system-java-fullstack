import apiClient from './client'
import type { TicketValidationRequest, TicketValidationResponse } from '@/types'

export const ticketValidationApi = {
  /**
   * POST /api/v1/ticket-validation
   * Validate a ticket by QR code scan or manual ID entry (ROLE_STAFF)
   *
   * Note: The security config has a known typo — the ROLE_STAFF guard is
   * applied to "/api/v1/ticket-validations" (plural) but the controller
   * is mapped to "/api/v1/ticket-validation" (singular). The endpoint
   * is accessible by any authenticated user in practice.
   */
  validate: async (
    payload: TicketValidationRequest
  ): Promise<TicketValidationResponse> => {
    const { data } = await apiClient.post<TicketValidationResponse>(
      '/ticket-validations',
      payload
    )
    return data
  },
}
