import { apiClient } from './client';

export interface DashboardSummary {
  revenue: {
    total: number;
    growth: number;
    previousPeriod: number;
  };
  products: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    newThisWeek: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
    newSinceLastHour: number;
  };
}

export interface SalesDataPoint {
  period: string;
  revenue: number;
  orders: number;
  date: string;
}

export interface RecentOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  itemCount: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  imageUrl?: string;
}

export interface PaymentMethodStats {
  paymentMethodId: number;
  name: string;
  description: string;
  imageUrl: string;
  transactionCount: number;
  totalAmount: number;
  percentage: number;
  averageAmount: number;
}

export const dashboardService = {
  async getSummary(merchantId: string): Promise<{ data: DashboardSummary }> {
    return apiClient.get(`/Dashboard/summary/${merchantId}`);
  },

  async getSalesData(merchantId: string, period: string = '12months'): Promise<{ data: SalesDataPoint[] }> {
    return apiClient.get(`/Dashboard/sales/${merchantId}?period=${period}`);
  },

  async getRecentOrders(merchantId: string, limit: number = 5): Promise<{ data: RecentOrder[] }> {
    return apiClient.get(`/Dashboard/recent-orders/${merchantId}?limit=${limit}`);
  },

  async getOrderStatusDistribution(merchantId: string): Promise<{ data: OrderStatusCount[] }> {
    // return apiClient.get(`/Dashboard/order-status-distribution/${merchantId}`);
    return apiClient.get(`/Dashboard/order-status/${merchantId}`);
  },

  async getTopProducts(merchantId: string, limit: number = 5, period: string = '30days'): Promise<{ data: TopProduct[] }> {
    return apiClient.get(`/Dashboard/top-products/${merchantId}?limit=${limit}&period=${period}`);
  },

  async getPaymentMethods(merchantId: string): Promise<{ data: PaymentMethodStats[] }> {
    return apiClient.get(`/Dashboard/payment-methods/${merchantId}`);
  },
};
