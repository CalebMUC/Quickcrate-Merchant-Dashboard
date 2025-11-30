"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { CreditCard, Smartphone, Wallet, Building2, LucideIcon } from "lucide-react"
import { dashboardService } from "@/lib/api/dashboard"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const iconMap: Record<string, LucideIcon> = {
  "M-Pesa": Smartphone,
  "Card": CreditCard,
  "Credit Card": CreditCard,
  "Bank Transfer": Building2,
  "Digital Wallet": Wallet,
  "Mobile Payment": Smartphone,
};

const colorMap: Record<string, string> = {
  "M-Pesa": "#10b981", // green
  "Card": "#3b82f6", // blue
  "Credit Card": "#3b82f6", // blue
  "Bank Transfer": "#8b5cf6", // purple
  "Digital Wallet": "#f59e0b", // amber
  "Mobile Payment": "#06b6d4", // cyan
};

const defaultColors: string[] = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export function PaymentMethodsChart() {
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const merchantId = user?.merchantId || 'ea1989e3-f9c4-4ff5-86bf-a24148aa570e';

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getPaymentMethods(merchantId);
        const formattedData = response.data.map((item, index) => ({
          name: item.name,
          value: item.percentage,
          color: colorMap[item.name] || defaultColors[index % defaultColors.length],
          icon: iconMap[item.name] || CreditCard,
          transactionCount: item.transactionCount,
          totalAmount: item.totalAmount,
        }));
        setPaymentData(formattedData);
      } catch (error: any) {
        console.error('Failed to load payment methods:', error);
        toast.error('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [merchantId]);

  if (loading) {
    return <Skeleton className="w-full h-[250px]" />;
  }

  if (paymentData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No payment data available
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={paymentData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            animationDuration={1000}
          >
            {paymentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                const IconComponent = data.icon
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg animate-in fade-in-0 duration-150">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-4 h-4" style={{ color: data.color }} />
                      <span className="text-sm font-medium">{data.name}</span>
                    </div>
                    <div className="text-lg font-bold">{data.value.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mb-1">of total transactions</div>
                    <div className="text-xs text-muted-foreground">
                      {data.transactionCount} transactions
                    </div>
                    <div className="text-xs font-semibold text-primary">
                      KES {data.totalAmount?.toLocaleString()}
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
            formatter={(value, entry) => {
              const IconComponent = entry.payload.icon
              return (
                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: entry.color }}>
                  <IconComponent className="w-3 h-3" />
                  {value}
                </span>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
