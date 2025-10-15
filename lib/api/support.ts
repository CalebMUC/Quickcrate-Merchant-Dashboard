import { apiClient } from './client';
import { mockApiService } from './mock';
import { SupportTicket, SupportMessage, PaginatedResponse } from '@/types';

const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export const supportService = {
  // Get all support tickets
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<SupportTicket>> {
    if (USE_MOCK_API) {
      return await mockApiService.getSupportTickets();
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<SupportTicket>>(`/support/tickets${query}`);
  },

  // Get single support ticket
  async getTicket(id: string): Promise<SupportTicket> {
    if (USE_MOCK_API) {
      return await mockApiService.getSupportTicket(id);
    }

    return apiClient.get<SupportTicket>(`/support/tickets/${id}`);
  },

  // Create new support ticket
  async createTicket(data: {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }): Promise<SupportTicket> {
    if (USE_MOCK_API) {
      return await mockApiService.createSupportTicket(data);
    }

    return apiClient.post<SupportTicket>('/support/tickets', data);
  },

  // Add message to ticket
  async addMessage(ticketId: string, content: string): Promise<SupportMessage> {
    if (USE_MOCK_API) {
      return await mockApiService.addSupportMessage(ticketId, content);
    }

    return apiClient.post<SupportMessage>(`/support/tickets/${ticketId}/messages`, { content });
  },

  // Update ticket status
  async updateTicketStatus(id: string, status: 'open' | 'in-progress' | 'resolved' | 'closed'): Promise<SupportTicket> {
    if (USE_MOCK_API) {
      return await mockApiService.updateSupportTicketStatus(id, status);
    }

    return apiClient.patch<SupportTicket>(`/support/tickets/${id}/status`, { status });
  },
};