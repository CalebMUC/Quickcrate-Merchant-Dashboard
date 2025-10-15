import { apiClient } from './client';
import { mockApiService } from './mock';
import { 
  AnalyticsData, 
  SalesMetric, 
  TopProduct, 
  PaymentMethod,
  OrderStatusCount,
  RevenueTrend,
  CustomerMetric,
  ProductPerformance
} from '@/types';

const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export const analyticsService = {
  // Get dashboard analytics summary
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    if (USE_MOCK_API) {
      return await mockApiService.getDashboardAnalytics();
    }

    return apiClient.get<AnalyticsData>('/analytics/dashboard');
  },

  // Get dashboard metrics (legacy method)
  async getDashboardMetrics() {
    if (USE_MOCK_API) {
      const analytics = await mockApiService.getDashboardAnalytics();
      return analytics.metrics;
    }

    return apiClient.get('/analytics/metrics');
  },

  // Get sales metrics
  async getSalesMetrics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<SalesMetric> {
    if (USE_MOCK_API) {
      return await mockApiService.getSalesMetrics();
    }

    return apiClient.get<SalesMetric>(`/analytics/sales?period=${period}`);
  },

  // Get top products
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    if (USE_MOCK_API) {
      return await mockApiService.getTopProducts();
    }

    return apiClient.get<TopProduct[]>(`/analytics/top-products?limit=${limit}`);
  },

  // Get payment methods distribution
  async getPaymentMethodsDistribution(): Promise<PaymentMethod[]> {
    if (USE_MOCK_API) {
      return await mockApiService.getPaymentMethodsDistribution();
    }

    return apiClient.get<PaymentMethod[]>('/analytics/payment-methods');
  },

  // Get order status counts
  async getOrderStatusCounts(): Promise<OrderStatusCount[]> {
    if (USE_MOCK_API) {
      return await mockApiService.getOrderStatusCounts();
    }

    return apiClient.get<OrderStatusCount[]>('/analytics/orders/status');
  },

  // Get revenue trends
  async getRevenueTrends(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<RevenueTrend[]> {
    if (USE_MOCK_API) {
      return await mockApiService.getRevenueTrends();
    }

    return apiClient.get<RevenueTrend[]>(`/analytics/revenue-trends?period=${period}`);
  },

  // Get customer metrics
  async getCustomerMetrics(): Promise<CustomerMetric> {
    if (USE_MOCK_API) {
      return await mockApiService.getCustomerMetrics();
    }

    return apiClient.get<CustomerMetric>('/analytics/customers');
  },

  // Get product performance
  async getProductPerformance(productId?: string): Promise<ProductPerformance[]> {
    if (USE_MOCK_API) {
      return await mockApiService.getProductPerformance();
    }

    const query = productId ? `?productId=${productId}` : '';
    return apiClient.get<ProductPerformance[]>(`/analytics/products/performance${query}`);
  },
};