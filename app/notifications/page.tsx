import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Package, CreditCard, AlertTriangle, CheckCircle } from "lucide-react"

const notifications = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-001 from John Smith for $299.00",
    time: "2 minutes ago",
    read: false,
    icon: Package,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Processed",
    message: "Payment of $159.00 has been successfully processed",
    time: "1 hour ago",
    read: false,
    icon: CreditCard,
  },
  {
    id: "3",
    type: "inventory",
    title: "Low Stock Alert",
    message: "Wireless Headphones are running low (5 items left)",
    time: "3 hours ago",
    read: true,
    icon: AlertTriangle,
  },
  {
    id: "4",
    type: "approval",
    title: "Product Approved",
    message: "Your product 'Smart Watch' has been approved and is now live",
    time: "1 day ago",
    read: true,
    icon: CheckCircle,
  },
]

const typeColors = {
  order: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  payment: "bg-green-500/10 text-green-500 border-green-500/20",
  inventory: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  approval: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your store activities and important alerts.</p>
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>Your latest store notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    !notification.read ? "bg-accent/50 border-primary/20" : "border-border hover:bg-accent/30"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-muted">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeColors[notification.type as keyof typeof typeColors]}>
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
