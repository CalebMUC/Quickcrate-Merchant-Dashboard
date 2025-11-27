import { apiClient } from './client';
import { 
  Transaction, 
  PaymentMethod, 
  PaginatedResponse,
  Payout,
  PayoutStats,
  MerchantTransaction,
  MerchantPaymentMethod,
  CreatePaymentMethodRequest
} from '@/types';

export const paymentsService = {
  // ==================== PAYOUT ENDPOINTS ====================
  
  /**
   * Get payout statistics for the authenticated merchant
   */
  async getPayoutStats(): Promise<PayoutStats> {
    return apiClient.get<PayoutStats>('/payouts/stats');
  },

  /**
   * Get all payouts for the authenticated merchant
   */
  async getMerchantPayouts(status?: string): Promise<Payout[]> {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<Payout[]>(`/payouts${query}`);
  },

  /**
   * Get a specific payout by ID with full details
   */
  async getPayoutById(payoutId: string): Promise<Payout> {
    return apiClient.get<Payout>(`/payouts/${payoutId}`);
  },

  /**
   * Get transaction history for the authenticated merchant
   */
  async getMerchantTransactions(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<MerchantTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<MerchantTransaction[]>(`/payouts/transactions${query}`);
  },

  // ==================== PAYMENT METHOD ENDPOINTS ====================
  
  /**
   * Get all payment methods for the authenticated merchant
   */
  async getMerchantPaymentMethods(): Promise<MerchantPaymentMethod[]> {
    return apiClient.get<MerchantPaymentMethod[]>('/payouts/payment-methods');
  },

  /**
   * Get a specific payment method by ID
   */
  async getPaymentMethodById(id: string): Promise<MerchantPaymentMethod> {
    return apiClient.get<MerchantPaymentMethod>(`/payouts/payment-methods/${id}`);
  },

  /**
   * Add a new payment method
   */
  async createPaymentMethod(methodData: CreatePaymentMethodRequest): Promise<MerchantPaymentMethod> {
    return apiClient.post<MerchantPaymentMethod>('/payouts/payment-methods', methodData);
  },

  /**
   * Update an existing payment method
   */
  async updatePaymentMethod(id: string, methodData: Partial<CreatePaymentMethodRequest>): Promise<MerchantPaymentMethod> {
    return apiClient.put<MerchantPaymentMethod>(`/payouts/payment-methods/${id}`, methodData);
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/payouts/payment-methods/${id}`);
  },

  /**
   * Set a payment method as primary
   */
  async setPrimaryPaymentMethod(id: string): Promise<MerchantPaymentMethod> {
    return apiClient.post<MerchantPaymentMethod>(`/payouts/payment-methods/${id}/set-primary`);
  },

  // ==================== LEGACY TRANSACTION ENDPOINTS ====================
  
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

  // Get payment methods (legacy)
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>('/payments/methods');
  },

  // Add payment method (legacy)
  async addPaymentMethod(methodData: {
    type: PaymentMethod['type'];
    name: string;
    accountDetails: any;
  }): Promise<PaymentMethod> {
    return apiClient.post<PaymentMethod>('/payments/methods', methodData);
  },

  // Get payment statistics (legacy)
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

  // Get payout schedule (legacy)
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