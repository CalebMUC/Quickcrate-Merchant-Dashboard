import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    email: "john@example.com",
    amount: "$299.00",
    status: "delivered",
    initials: "JS",
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    amount: "$159.00",
    status: "shipped",
    initials: "SJ",
  },
  {
    id: "ORD-003",
    customer: "Mike Davis",
    email: "mike@example.com",
    amount: "$89.00",
    status: "pending",
    initials: "MD",
  },
  {
    id: "ORD-004",
    customer: "Emily Brown",
    email: "emily@example.com",
    amount: "$199.00",
    status: "delivered",
    initials: "EB",
  },
  {
    id: "ORD-005",
    customer: "Alex Wilson",
    email: "alex@example.com",
    amount: "$349.00",
    status: "shipped",
    initials: "AW",
  },
]

const statusColors = {
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
}

export function RecentOrders() {
  return (
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{order.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{order.customer}</p>
              <p className="text-xs text-muted-foreground">{order.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={statusColors[order.status as keyof typeof statusColors]}>
              {order.status}
            </Badge>
            <div className="text-sm font-medium">{order.amount}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
