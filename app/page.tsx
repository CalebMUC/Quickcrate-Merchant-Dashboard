"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { SalesChart } from "@/components/charts/sales-chart"
import { OrdersChart } from "@/components/charts/orders-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"
import { PaymentMethodsChart } from "@/components/payment-methods-chart"
import { RecentOrders } from "@/components/recent-orders"
import { AnalyticsSummary } from "@/components/analytics-summary"
import { useDashboard } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { summary, loading, error, refresh } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">Error loading dashboard</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in-50 duration-500 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Card */}
        <Card className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow">
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
                {(summary?.revenue.growth || 0) >= 0 ? '+' : ''}{summary?.revenue.growth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card
          className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.products.total || 0}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+{summary?.products.newThisWeek || 0}</span>
              <span className="text-muted-foreground">new this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card
          className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.orders.total || 0}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+{summary?.orders.newSinceLastHour || 0}</span>
              <span className="text-muted-foreground">since last hour</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Summary */}
      <div className="animate-in slide-in-from-bottom-5 duration-700">
        <AnalyticsSummary />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 animate-in slide-in-from-left-5 duration-700">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Your sales performance over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="col-span-3 animate-in slide-in-from-right-5 duration-700">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-in slide-in-from-left-5 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Order Status
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
            </CardTitle>
            <CardDescription>Breakdown of current order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersChart />
          </CardContent>
        </Card>

        <Card className="animate-in slide-in-from-bottom-5 duration-700">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>How customers prefer to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodsChart />
          </CardContent>
        </Card>

        <Card className="animate-in slide-in-from-right-5 duration-700">
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
            <CardDescription>Top performers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-96" />
        <Skeleton className="col-span-3 h-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
