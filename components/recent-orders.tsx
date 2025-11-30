"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { dashboardService } from "@/lib/api/dashboard"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const statusColors = {
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function RecentOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const merchantId = user?.merchantId || 'ea1989e3-f9c4-4ff5-86bf-a24148aa570e';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRecentOrders(merchantId, 5);
        setOrders(response.data);
      } catch (error: any) {
        console.error('Failed to load recent orders:', error);
        toast.error('Failed to load recent orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [merchantId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent orders found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.orderId}
          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{getInitials(order.customerName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{order.customerName}</p>
              <p className="text-xs text-muted-foreground">{order.orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={statusColors[order.status.toLowerCase() as keyof typeof statusColors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
              {order.status}
            </Badge>
            <div className="text-sm font-medium">KES {order.totalAmount.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
