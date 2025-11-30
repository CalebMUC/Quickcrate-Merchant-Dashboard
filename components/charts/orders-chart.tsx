"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { dashboardService } from "@/lib/api/dashboard"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function OrdersChart() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const merchantId = user?.merchantId || 'ea1989e3-f9c4-4ff5-86bf-a24148aa570e';

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getOrderStatusDistribution(merchantId);
        const formattedData = response.data.map(item => ({
          name: item.status,
          value: item.count,
          color: item.color,
          percentage: item.percentage,
        }));
        setData(formattedData);
      } catch (error: any) {
        console.error('Failed to load order status:', error);
        toast.error('Failed to load order status');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [merchantId]);

  if (loading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No order data available
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const statusData = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg animate-in fade-in-0 duration-150">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusData.color }} />
                        <span className="text-sm font-medium">{statusData.name}</span>
                      </div>
                      <span className="font-bold text-lg">{statusData.value} orders</span>
                      <span className="text-xs text-muted-foreground">
                        {statusData.percentage.toFixed(1)}% of total
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }} className="text-sm font-medium">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
