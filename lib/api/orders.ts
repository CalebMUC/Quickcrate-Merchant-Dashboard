import { apiClient } from './client';
import { MerchantOrderResponse, Order, OrderStatuses, PaginatedResponse } from '@/types';

export const ordersService = {
  // Get all orders with pagination and filters
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<Order>>(`/orders${query}`);
  },

  // Get single order
  async getOrder(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async getMerchantOrders(merchantId:string) : Promise<MerchantOrderResponse>{
    return apiClient.get(`/Order/merchant/${merchantId}`);
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${id}/status`, { status, notes });
  },

  // Get order statuses
  async getOrderStatuses(): Promise<{data: OrderStatuses[]}> {
    return apiClient.get<{data: OrderStatuses[]}>('/Order/Statuses');
  },

  async getTracking(orderId? : string, productId?: string): Promise<any> {
    return apiClient.post(`/Order/tracking/product/${productId}`,{
      ProductID : productId,
      OrderID : orderId
    });
  },

  async updateTracking(updates: any): Promise<any> {
    return apiClient.post(`/Order/tracking/update/${updates.ProductId}`, updates);
  },

  // Get pending orders
  async getPendingOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders/pending');
  },

  // Process order
  async processOrder(id: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${id}/process`);
  },

  // Ship order
  async shipOrder(id: string, trackingNumber: string, carrier: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${id}/ship`, { trackingNumber, carrier });
  },

  // Cancel order
  async cancelOrder(id: string, reason: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${id}/cancel`, { reason });
  },

  // Get order statistics
  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    return apiClient.get('/orders/stats');
  },

  // Export orders
  async exportOrders(params?: {
    format: 'csv' | 'xlsx';
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): Promise<{ downloadUrl: string }> {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.append('format', params.format);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<{ downloadUrl: string }>(`/orders/export${query}`);
  },
};