import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, Users, ShoppingCart, TrendingUp } from "lucide-react"
import { SalesChart } from "@/components/charts/sales-chart"
import { OrdersChart } from "@/components/charts/orders-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"
import { PaymentMethodsChart } from "@/components/payment-methods-chart"
import { RecentOrders } from "@/components/recent-orders"
import { AnalyticsSummary } from "@/components/analytics-summary"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in-50 duration-500">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+20.1%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+12</span>
              <span className="text-muted-foreground">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+180.1%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-left-5 duration-500 hover:shadow-lg transition-shadow"
          style={{ animationDelay: "300ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+201</span>
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
