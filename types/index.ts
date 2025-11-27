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

// Enhanced Authentication Types
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
    expiresIn: number;
    requiresPasswordReset: boolean;
  };
  message: string;
  errors?: string[];
}

export interface PasswordResetRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresPasswordReset: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'merchant' | 'staff';
  avatar?: string;
  merchantId?: string;
  businessName?: string;
  isTemporaryPassword?: boolean;
  emailVerified?: boolean;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Product Types - Updated to match backend API response
export interface Product {
  productId: string;
  productName: string;
  description: string;
  productDescription?: string;
  price: number;
  discount: number;
  stockQuantity: number;
  sku: string;
  categoryId: string;
  categoryName: string;
  subCategoryId?: string | null;
  subCategoryName?: string | null;
  subSubCategoryId?: string | null;
  subSubCategoryName?: string | null;
  status: 'approved' | 'pending' | 'rejected' | string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrls: string[];
  merchantID: string;
  createdOn: string;
  updatedOn?: string | null;
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  category?: string;
  stock?: number;
  image?: string;
  images?: string[];
  rating?: number;
  sales?: number;
  createdAt?: string;
  updatedAt?: string;
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

export interface MerchantOrderProduct{
  productID: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface MerchantOrder{
  orderId: string;
  subTotal: number;
  status: string;
  orderDate: string;
  products: MerchantOrderProduct[];
}

export interface MerchantOrderResponse {
  success: boolean;
  message: string;
  data: MerchantOrder[];
  count: number;
} 

export interface OrderStatuses{
  statusID : number,
  status : string,
  description : string,
  createdOn : string,
  createdBy : string, 
  updatedOn?: string,
  updatedBy?: string
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

// Payout Types
export interface Payout {
  payoutId: string;
  merchantId: string;
  grossAmount: number;
  commissionAmount: number;
  commissionRate: number;
  netAmount: number;
  status: 'Pending' | 'Scheduled' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  periodStartDate: string;
  periodEndDate: string;
  scheduledDate: string;
  completedDate?: string;
  paymentReference?: string;
  failureReason?: string;
  orderCount: number;
  productCount: number;
  notes?: string;
  paymentMethod?: PaymentMethodSummary;
  transactions?: PayoutTransaction[];
  createdOn: string;
}

export interface PayoutTransaction {
  payoutTransactionId: string;
  orderId: string;
  orderNumber: string;
  orderAmount: number;
  commissionAmount: number;
  netAmount: number;
  orderCompletedDate: string;
  customerName: string;
  itemCount: number;
}

export interface PaymentMethodSummary {
  paymentMethodId: string;
  type: string;
  name: string;
  maskedDetails: string;
}

export interface MerchantPaymentMethod {
  paymentMethodId: string;
  type: 'BankTransfer' | 'MobileMoney' | 'PayPal' | 'DebitCard' | 'Cryptocurrency';
  name: string;
  isPrimary: boolean;
  isActive: boolean;
  isVerified: boolean;
  bankName?: string;
  maskedAccountNumber?: string;
  accountHolderName?: string;
  maskedMobileNumber?: string;
  mobileMoneyProvider?: string;
  payPalEmail?: string;
  cardLast4?: string;
  cardBrand?: string;
  createdOn: string;
  lastUsedOn?: string;
}

export interface CreatePaymentMethodRequest {
  type: 'BankTransfer' | 'MobileMoney' | 'PayPal' | 'DebitCard' | 'Cryptocurrency';
  name: string;
  isPrimary?: boolean;
  // Bank Transfer fields
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  swiftCode?: string;
  // Mobile Money fields
  mobileNumber?: string;
  mobileMoneyProvider?: string;
  // PayPal fields
  payPalEmail?: string;
  // Card fields
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
}

export interface PayoutStats {
  totalEarnings: number;
  pendingPayout: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  growthPercentage: number;
  completedPayouts: number;
  pendingPayouts: number;
  failedPayouts: number;
  nextPayoutDate?: string;
  nextPayoutAmount: number;
  lastPayoutDate?: string;
  lastPayoutAmount: number;
}

export interface MerchantTransaction {
  transactionId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  orderAmount: number;
  commissionAmount: number;
  netAmount: number;
  paymentMethod: string;
  payoutStatus: string;
  orderDate: string;
  payoutDate?: string;
  payoutReference?: string;
  itemCount: number;
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
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}