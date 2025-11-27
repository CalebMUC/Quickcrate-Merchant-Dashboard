"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Clock, AlertCircle, Calendar, ArrowUpRight, RefreshCw } from "lucide-react"
import { PayoutCard } from "@/components/payments/payout-card"
import { PayoutsTable } from "@/components/payments/payouts-table"
import { MerchantTransactionsTable } from "@/components/payments/merchant-transactions-table"
import { PayoutDetailModal } from "@/components/payments/payout-detail-modal"
import { MerchantPaymentMethods } from "@/components/payments/merchant-payment-methods"
import { paymentsService } from "@/lib/api/payments"
import { PayoutStats, Payout, MerchantTransaction } from "@/types"
import { format } from "date-fns"

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PayoutStats | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([])
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    setLoading(true)
    try {
      // Load data in parallel
      const [statsData, payoutsData, transactionsData] = await Promise.all([
        paymentsService.getPayoutStats(),
        paymentsService.getMerchantPayouts(),
        paymentsService.getMerchantTransactions(),
      ])

      setStats(statsData)
      setPayouts(payoutsData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error("Error loading payment data:", error)
      // Use mock data for development
      setStats({
        totalEarnings: 45231.89,
        pendingPayout: 2847.5,
        thisMonthEarnings: 12456.78,
        lastMonthEarnings: 10820.45,
        growthPercentage: 15.1,
        completedPayouts: 18,
        pendingPayouts: 2,
        failedPayouts: 1,
        nextPayoutDate: "2024-01-20",
        nextPayoutAmount: 2847.5,
        lastPayoutDate: "2024-01-13",
        lastPayoutAmount: 4521.3,
      })
      setPayouts([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments & Payouts</h1>
          <p className="text-muted-foreground">
            Track your earnings, manage payouts, and view detailed transaction history.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadPaymentData}
          disabled={loading}
          className="transition-all hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PayoutCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            icon={DollarSign}
            trend={{
              value: `${stats.growthPercentage > 0 ? "+" : ""}${stats.growthPercentage}% from last month`,
              isPositive: stats.growthPercentage >= 0,
            }}
            colorScheme="green"
            className="animate-in slide-in-from-left-5"
          />

          <PayoutCard
            title="Pending Payout"
            value={formatCurrency(stats.pendingPayout)}
            icon={Clock}
            description={stats.nextPayoutDate ? `Next payout ${formatDate(stats.nextPayoutDate)}` : "No pending payout"}
            colorScheme="yellow"
            className="animate-in slide-in-from-left-5"
            style={{ animationDelay: "100ms" } as any}
          />

          <PayoutCard
            title="This Month"
            value={formatCurrency(stats.thisMonthEarnings)}
            icon={TrendingUp}
            trend={{
              value: `${stats.growthPercentage > 0 ? "+" : ""}${stats.growthPercentage}%`,
              isPositive: stats.growthPercentage >= 0,
            }}
            colorScheme="blue"
            className="animate-in slide-in-from-left-5"
            style={{ animationDelay: "200ms" } as any}
          />

          <PayoutCard
            title="Last Payout"
            value={formatCurrency(stats.lastPayoutAmount)}
            icon={Calendar}
            description={stats.lastPayoutDate ? `Paid ${formatDate(stats.lastPayoutDate)}` : "No recent payout"}
            colorScheme="purple"
            className="animate-in slide-in-from-left-5"
            style={{ animationDelay: "300ms" } as any}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payouts" className="transition-all">
            <DollarSign className="h-4 w-4 mr-2" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="transactions" className="transition-all">
            <TrendingUp className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="methods" className="transition-all">
            <AlertCircle className="h-4 w-4 mr-2" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>
                    View all your payouts with breakdown of commission and net amounts.
                  </CardDescription>
                </div>
                {stats && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Payouts</p>
                    <p className="text-2xl font-bold">{stats.completedPayouts}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PayoutsTable
                payouts={payouts}
                onViewDetails={(payout) => {
                  setSelectedPayout(payout)
                  setShowPayoutModal(true)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your order transactions with commission breakdown and payout status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MerchantTransactionsTable transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4 animate-in fade-in-50 duration-300">
          <MerchantPaymentMethods />
        </TabsContent>
      </Tabs>

      {/* Payout Detail Modal */}
      <PayoutDetailModal
        payout={selectedPayout}
        open={showPayoutModal}
        onOpenChange={setShowPayoutModal}
      />
    </div>
  )
}
