# Dynamic Dashboard Implementation Guide

## Overview
This document outlines the implementation of a dynamic merchant dashboard that fetches real-time data from the database instead of using hardcoded values.

---

## Backend API Endpoints (.NET)

### 1. Dashboard Summary Statistics
**Endpoint:** `GET /api/Dashboard/merchant/{merchantId}/summary`

**Purpose:** Get overall dashboard statistics for a merchant

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 45231.89,
      "growth": 20.1,
      "previousPeriod": 37692.41
    },
    "products": {
      "total": 1234,
      "active": 1180,
      "pending": 32,
      "rejected": 22,
      "newThisWeek": 12
    },
    "orders": {
      "total": 573,
      "pending": 45,
      "processing": 120,
      "shipped": 230,
      "delivered": 168,
      "cancelled": 10,
      "todayOrders": 23,
      "newSinceLastHour": 5
    }
  }
}
```

**C# Implementation:**
```csharp
[HttpGet("merchant/{merchantId}/summary")]
public async Task<IActionResult> GetMerchantDashboardSummary(string merchantId)
{
    try
    {
        var summary = await _dashboardService.GetMerchantSummaryAsync(merchantId);
        return Ok(new { success = true, data = summary });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching dashboard summary for merchant {MerchantId}", merchantId);
        return StatusCode(500, new { success = false, message = "Failed to fetch dashboard summary" });
    }
}
```

---

### 2. Sales Chart Data
**Endpoint:** `GET /api/Dashboard/merchant/{merchantId}/sales?period={period}`

**Query Parameters:**
- `period`: "7days" | "30days" | "90days" | "12months" (default: "12months")

**Purpose:** Get sales data for chart visualization

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "Jan",
      "revenue": 12500.00,
      "orders": 45,
      "date": "2025-01-01"
    },
    {
      "period": "Feb",
      "revenue": 15200.00,
      "orders": 52,
      "date": "2025-02-01"
    }
  ]
}
```

**C# Implementation:**
```csharp
[HttpGet("merchant/{merchantId}/sales")]
public async Task<IActionResult> GetSalesData(string merchantId, [FromQuery] string period = "12months")
{
    try
    {
        var salesData = await _dashboardService.GetSalesDataAsync(merchantId, period);
        return Ok(new { success = true, data = salesData });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching sales data for merchant {MerchantId}", merchantId);
        return StatusCode(500, new { success = false, message = "Failed to fetch sales data" });
    }
}
```

---

### 3. Recent Orders
**Endpoint:** `GET /api/Dashboard/merchant/{merchantId}/recent-orders?limit={limit}`

**Query Parameters:**
- `limit`: number (default: 5)

**Purpose:** Get recent orders for the merchant

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "ORD-123456",
      "orderDate": "2025-11-27T10:30:00Z",
      "customerName": "John Doe",
      "status": "Processing",
      "total": 2500.00,
      "itemCount": 3
    }
  ]
}
```

**C# Implementation:**
```csharp
[HttpGet("merchant/{merchantId}/recent-orders")]
public async Task<IActionResult> GetRecentOrders(string merchantId, [FromQuery] int limit = 5)
{
    try
    {
        var orders = await _dashboardService.GetRecentOrdersAsync(merchantId, limit);
        return Ok(new { success = true, data = orders });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching recent orders for merchant {MerchantId}", merchantId);
        return StatusCode(500, new { success = false, message = "Failed to fetch recent orders" });
    }
}
```

---

### 4. Order Status Distribution
**Endpoint:** `GET /api/Dashboard/merchant/{merchantId}/order-status-distribution`

**Purpose:** Get order count by status for pie chart

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "status": "Delivered",
      "count": 168,
      "percentage": 29.3
    },
    {
      "status": "Shipped",
      "count": 230,
      "percentage": 40.1
    },
    {
      "status": "Processing",
      "count": 120,
      "percentage": 20.9
    },
    {
      "status": "Pending",
      "count": 45,
      "percentage": 7.9
    },
    {
      "status": "Cancelled",
      "count": 10,
      "percentage": 1.8
    }
  ]
}
```

**C# Implementation:**
```csharp
[HttpGet("merchant/{merchantId}/order-status-distribution")]
public async Task<IActionResult> GetOrderStatusDistribution(string merchantId)
{
    try
    {
        var distribution = await _dashboardService.GetOrderStatusDistributionAsync(merchantId);
        return Ok(new { success = true, data = distribution });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching order status distribution for merchant {MerchantId}", merchantId);
        return StatusCode(500, new { success = false, message = "Failed to fetch order status distribution" });
    }
}
```

---

### 5. Top Selling Products
**Endpoint:** `GET /api/Dashboard/merchant/{merchantId}/top-products?limit={limit}&period={period}`

**Query Parameters:**
- `limit`: number (default: 5)
- `period`: "7days" | "30days" | "90days" (default: "30days")

**Purpose:** Get best-selling products

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "PRD-123",
      "productName": "Wireless Headphones",
      "sales": 234,
      "revenue": 46800.00,
      "imageUrl": "https://..."
    }
  ]
}
```

**C# Implementation:**
```csharp
[HttpGet("merchant/{merchantId}/top-products")]
public async Task<IActionResult> GetTopProducts(
    string merchantId, 
    [FromQuery] int limit = 5,
    [FromQuery] string period = "30days")
{
    try
    {
        var products = await _dashboardService.GetTopProductsAsync(merchantId, limit, period);
        return Ok(new { success = true, data = products });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching top products for merchant {MerchantId}", merchantId);
        return StatusCode(500, new { success = false, message = "Failed to fetch top products" });
    }
}
```

---

### 6. Payment Methods Distribution
**Endpoint:** `GET /api/Dashboard/merchant/{merchantId}/payment-methods`

**Purpose:** Get payment method usage statistics

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "method": "M-Pesa",
      "count": 340,
      "percentage": 59.3,
      "totalAmount": 850000.00
    },
    {
      "method": "Card",
      "count": 150,
      "percentage": 26.2,
      "totalAmount": 375000.00
    },
    {
      "method": "Bank Transfer",
      "count": 83,
      "percentage": 14.5,
      "totalAmount": 207500.00
    }
  ]
}
```

**C# Implementation:**
```csharp
[HttpGet("merchant/{merchantId}/payment-methods")]
public async Task<IActionResult> GetPaymentMethodsDistribution(string merchantId)
{
    try
    {
        var distribution = await _dashboardService.GetPaymentMethodsDistributionAsync(merchantId);
        return Ok(new { success = true, data = distribution });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching payment methods for merchant {MerchantId}", merchantId);
        return StatusCode(500, new { success = false, message = "Failed to fetch payment methods" });
    }
}
```

---

## Backend Service Layer

Create a `DashboardService.cs`:

```csharp
public interface IDashboardService
{
    Task<MerchantDashboardSummary> GetMerchantSummaryAsync(string merchantId);
    Task<List<SalesDataPoint>> GetSalesDataAsync(string merchantId, string period);
    Task<List<RecentOrderDto>> GetRecentOrdersAsync(string merchantId, int limit);
    Task<List<OrderStatusCount>> GetOrderStatusDistributionAsync(string merchantId);
    Task<List<TopProductDto>> GetTopProductsAsync(string merchantId, int limit, string period);
    Task<List<PaymentMethodStats>> GetPaymentMethodsDistributionAsync(string merchantId);
}

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(ApplicationDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<MerchantDashboardSummary> GetMerchantSummaryAsync(string merchantId)
    {
        // Get date ranges
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var startOfLastMonth = startOfMonth.AddMonths(-1);
        var endOfLastMonth = startOfMonth.AddDays(-1);

        // Revenue calculation
        var currentMonthRevenue = await _context.Orders
            .Where(o => o.MerchantId == merchantId && o.OrderDate >= startOfMonth)
            .SumAsync(o => o.SubTotal);

        var lastMonthRevenue = await _context.Orders
            .Where(o => o.MerchantId == merchantId && 
                   o.OrderDate >= startOfLastMonth && 
                   o.OrderDate <= endOfLastMonth)
            .SumAsync(o => o.SubTotal);

        var revenueGrowth = lastMonthRevenue > 0 
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
            : 0;

        // Products stats
        var productStats = await _context.Products
            .Where(p => p.MerchantID == merchantId)
            .GroupBy(p => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Active = g.Count(p => p.IsActive && p.Status == "approved"),
                Pending = g.Count(p => p.Status == "pending"),
                Rejected = g.Count(p => p.Status == "rejected"),
                NewThisWeek = g.Count(p => p.CreatedOn >= now.AddDays(-7))
            })
            .FirstOrDefaultAsync();

        // Orders stats
        var orderStats = await _context.Orders
            .Where(o => o.MerchantId == merchantId)
            .GroupBy(o => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Pending = g.Count(o => o.Status == "pending"),
                Processing = g.Count(o => o.Status == "processing"),
                Shipped = g.Count(o => o.Status == "shipped"),
                Delivered = g.Count(o => o.Status == "delivered"),
                Cancelled = g.Count(o => o.Status == "cancelled"),
                TodayOrders = g.Count(o => o.OrderDate.Date == now.Date),
                NewSinceLastHour = g.Count(o => o.OrderDate >= now.AddHours(-1))
            })
            .FirstOrDefaultAsync();

        return new MerchantDashboardSummary
        {
            Revenue = new RevenueStats
            {
                Total = currentMonthRevenue,
                Growth = revenueGrowth,
                PreviousPeriod = lastMonthRevenue
            },
            Products = new ProductStats
            {
                Total = productStats?.Total ?? 0,
                Active = productStats?.Active ?? 0,
                Pending = productStats?.Pending ?? 0,
                Rejected = productStats?.Rejected ?? 0,
                NewThisWeek = productStats?.NewThisWeek ?? 0
            },
            Orders = new OrderStats
            {
                Total = orderStats?.Total ?? 0,
                Pending = orderStats?.Pending ?? 0,
                Processing = orderStats?.Processing ?? 0,
                Shipped = orderStats?.Shipped ?? 0,
                Delivered = orderStats?.Delivered ?? 0,
                Cancelled = orderStats?.Cancelled ?? 0,
                TodayOrders = orderStats?.TodayOrders ?? 0,
                NewSinceLastHour = orderStats?.NewSinceLastHour ?? 0
            }
        };
    }

    // Implement other methods similarly...
}
```

---

## Frontend Implementation

### 1. Create Dashboard API Service

**File:** `lib/api/dashboard.ts`

```typescript
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
  orderDate: string;
  customerName: string;
  status: string;
  total: number;
  itemCount: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  imageUrl?: string;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export const dashboardService = {
  async getSummary(merchantId: string): Promise<{ data: DashboardSummary }> {
    return apiClient.get(`/Dashboard/merchant/${merchantId}/summary`);
  },

  async getSalesData(merchantId: string, period: string = '12months'): Promise<{ data: SalesDataPoint[] }> {
    return apiClient.get(`/Dashboard/merchant/${merchantId}/sales?period=${period}`);
  },

  async getRecentOrders(merchantId: string, limit: number = 5): Promise<{ data: RecentOrder[] }> {
    return apiClient.get(`/Dashboard/merchant/${merchantId}/recent-orders?limit=${limit}`);
  },

  async getOrderStatusDistribution(merchantId: string): Promise<{ data: OrderStatusCount[] }> {
    return apiClient.get(`/Dashboard/merchant/${merchantId}/order-status-distribution`);
  },

  async getTopProducts(merchantId: string, limit: number = 5, period: string = '30days'): Promise<{ data: TopProduct[] }> {
    return apiClient.get(`/Dashboard/merchant/${merchantId}/top-products?limit=${limit}&period=${period}`);
  },

  async getPaymentMethods(merchantId: string): Promise<{ data: PaymentMethodStats[] }> {
    return apiClient.get(`/Dashboard/merchant/${merchantId}/payment-methods`);
  },
};
```

---

### 2. Create Dashboard Hook

**File:** `hooks/useDashboard.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardSummary } from '@/lib/api/dashboard';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';

export function useDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const merchantId = user?.merchantId || 'ea1989e3-f9c4-4ff5-86bf-a24148aa570e';

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getSummary(merchantId);
      setSummary(response.data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
  };
}
```

---

### 3. Update Dashboard Page

**File:** `app/page.tsx`

```typescript
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react"
import { useDashboard } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { summary, loading, error } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in-50 duration-500">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {summary?.revenue.total.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(summary?.revenue.growth || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`font-medium ${
                (summary?.revenue.growth || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {summary?.revenue.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.products.total || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">
                +{summary?.products.newThisWeek || 0}
              </span>
              <span className="text-muted-foreground">new this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.orders.total || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">
                +{summary?.orders.newSinceLastHour || 0}
              </span>
              <span className="text-muted-foreground">since last hour</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add other dashboard sections with dynamic data */}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <p className="text-red-500 text-lg font-semibold">Error loading dashboard</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );
}
```

---

## Implementation Checklist

### Backend
- [ ] Create `DashboardController.cs`
- [ ] Create `IDashboardService` interface
- [ ] Implement `DashboardService.cs`
- [ ] Add DTOs for all response types
- [ ] Register service in `Program.cs`
- [ ] Test all endpoints with Swagger
- [ ] Add appropriate authorization

### Frontend
- [ ] Create `lib/api/dashboard.ts`
- [ ] Create `hooks/useDashboard.ts`
- [ ] Update `app/page.tsx`
- [ ] Update chart components to use real data
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real API

---

## Notes

1. **Customers Section Removed**: As requested, customer-related metrics have been excluded for now
2. **Real-Time Updates**: Consider implementing SignalR for real-time dashboard updates
3. **Caching**: Implement Redis caching for dashboard data to improve performance
4. **Date Ranges**: All date comparisons should use UTC to avoid timezone issues
5. **Performance**: Use indexed database queries for better performance with large datasets
