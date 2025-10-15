// API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'merchant' | 'staff';
  avatar?: string;
  merchantId?: string;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: 'approved' | 'pending' | 'rejected';
  image?: string;
  images?: string[];
  rating: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images?: string[];
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Payment Types
export interface Transaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  fee: number;
  net: number;
  status: 'completed' | 'pending' | 'failed';
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  date: string;
  payoutDate?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'paypal';
  name: string;
  last4?: string;
  isPrimary: boolean;
  isActive: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'approval' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Support Types
export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  content: string;
  sender: 'user' | 'support';
  createdAt: string;
}

// Analytics Types
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface AnalyticsData {
  metrics: DashboardMetrics;
  salesData: SalesData[];
  topProducts: TopProduct[];
  recentOrders: Order[];
}

export interface SalesMetric {
  revenue: number;
  orders: number;
  growth: number;
  period: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  orders: number;
  growth: number;
}

export interface CustomerMetric {
  total: number;
  new: number;
  returning: number;
  growth: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  views: number;
  sales: number;
  conversionRate: number;
  revenue: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}