import { apiClient } from './client';
import { Transaction, PaymentMethod, PaginatedResponse } from '@/types';

export const paymentsService = {
  // Get all transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.method) queryParams.append('method', params.method);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<Transaction>>(`/payments/transactions${query}`);
  },

  // Get single transaction
  async getTransaction(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/payments/transactions/${id}`);
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>('/payments/methods');
  },

  // Add payment method
  async addPaymentMethod(methodData: {
    type: PaymentMethod['type'];
    name: string;
    accountDetails: any;
  }): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>('/payments/methods', methodData);
  },

  // Update payment method
  async updatePaymentMethod(id: string, methodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return apiClient.put<PaymentMethod>(`/payments/methods/${id}`, methodData);
  },

  // Delete payment method
  async deletePaymentMethod(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/payments/methods/${id}`);
  },

  // Set primary payment method
  async setPrimaryPaymentMethod(id: string): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>(`/payments/methods/${id}/set-primary`);
  },

  // Get payment statistics
  async getPaymentStats(): Promise<{
    totalEarned: number;
    pendingPayouts: number;
    totalFees: number;
    netEarnings: number;
    completedTransactions: number;
    pendingTransactions: number;
  }> {
    return apiClient.get('/payments/stats');
  },

  // Get payout schedule
  async getPayouts(params?: {
    page?: number;
    limit?: number;
    status?: 'scheduled' | 'pending' | 'completed';
  }): Promise<PaginatedResponse<{
    id: string;
    amount: number;
    status: 'scheduled' | 'pending' | 'completed';
    scheduledDate: string;
    completedDate?: string;
    transactionCount: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get(`/payments/payouts${query}`);
  },

  // Process refund
  async processRefund(transactionId: string, amount: number, reason: string): Promise<{
    refundId: string;
    status: string;
    message: string;
  }> {
    return apiClient.post(`/payments/transactions/${transactionId}/refund`, {
      amount,
      reason,
    });
  },

  // Export transactions
  async exportTransactions(params?: {
    format: 'csv' | 'xlsx';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ downloadUrl: string }> {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.append('format', params.format);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<{ downloadUrl: string }>(`/payments/export${query}`);
  },
};