import apiClient from './client'
import type {
  Page,
  PageParams,
  ListPublishedEventResponse,
  GetPublishedEventDetailsResponse,
} from '@/types'

export const publishedEventsApi = {
  /**
   * GET /api/v1/published-events
   * List all published events, optionally with full-text search
   */
  list: async (
    params: PageParams & { q?: string }
  ): Promise<Page<ListPublishedEventResponse>> => {
    const { data } = await apiClient.get<Page<ListPublishedEventResponse>>(
      '/published-events',
      { params }
    )
    return data
  },

  /**
   * GET /api/v1/published-events/:id
   * Get full details of a published event (includes ticket types)
   */
  getById: async (id: string): Promise<GetPublishedEventDetailsResponse> => {
    const { data } = await apiClient.get<GetPublishedEventDetailsResponse>(
      `/published-events/${id}`
    )
    return data
  },
}
