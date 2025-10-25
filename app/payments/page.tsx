import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionHistory } from "@/components/transaction-history"
import { PayoutSchedule } from "@/components/payout-schedule"
import { PaymentMethods } from "@/components/payment-methods"
import { DollarSign, TrendingUp, Clock, AlertCircle, ArrowUpRight } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments & Transactions</h1>
        <p className="text-muted-foreground">
          Track your earnings, manage payouts, and view detailed transaction history.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-200 animate-in slide-in-from-left-5 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$45,231.89</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +20.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all duration-200 animate-in slide-in-from-left-5 hover:scale-105"
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">$2,847.50</div>
            <p className="text-xs text-muted-foreground">Next payout Jan 20</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all duration-200 animate-in slide-in-from-left-5 hover:scale-105"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,456.78</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +15.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all duration-200 animate-in slide-in-from-left-5 hover:scale-105"
          style={{ animationDelay: "300ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-red-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="transition-all">
            Transaction History
          </TabsTrigger>
          <TabsTrigger value="payouts" className="transition-all">
            Payouts
          </TabsTrigger>
          <TabsTrigger value="methods" className="transition-all">
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your transactions with detailed information about fees, payouts, and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4 animate-in fade-in-50 duration-300">
          <PayoutSchedule />
        </TabsContent>

        <TabsContent value="methods" className="space-y-4 animate-in fade-in-50 duration-300">
          <PaymentMethods />
        </TabsContent>
      </Tabs>
    </div>
  )
}
