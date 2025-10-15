import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Clock } from "lucide-react"

const upcomingPayouts = [
  {
    id: "PAYOUT-001",
    amount: 2847.5,
    date: "2024-01-20",
    status: "scheduled",
    transactions: 12,
  },
  {
    id: "PAYOUT-002",
    amount: 1923.75,
    date: "2024-01-27",
    status: "scheduled",
    transactions: 8,
  },
  {
    id: "PAYOUT-003",
    amount: 3456.2,
    date: "2024-02-03",
    status: "pending",
    transactions: 15,
  },
]

const recentPayouts = [
  {
    id: "PAYOUT-004",
    amount: 4521.3,
    date: "2024-01-13",
    status: "completed",
    transactions: 18,
  },
  {
    id: "PAYOUT-005",
    amount: 2198.45,
    date: "2024-01-06",
    status: "completed",
    transactions: 9,
  },
]

const statusColors = {
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
}

export function PayoutSchedule() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Payouts
          </CardTitle>
          <CardDescription>Scheduled payments to your bank account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingPayouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-lg">${payout.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{payout.date}</span>
                    <span>•</span>
                    <span>{payout.transactions} transactions</span>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[payout.status as keyof typeof statusColors]}>
                  {payout.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Payouts
          </CardTitle>
          <CardDescription>Your latest completed payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-lg">${payout.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{payout.date}</span>
                    <span>•</span>
                    <span>{payout.transactions} transactions</span>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[payout.status as keyof typeof statusColors]}>
                  {payout.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Payouts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
