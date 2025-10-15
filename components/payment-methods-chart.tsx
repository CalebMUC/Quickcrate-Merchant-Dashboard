"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { CreditCard, Smartphone, Wallet, Building2 } from "lucide-react"

const paymentData = [
  { name: "Credit Card", value: 45, color: "#3b82f6", icon: CreditCard },
  { name: "Digital Wallet", value: 30, color: "#10b981", icon: Wallet },
  { name: "Mobile Payment", value: 20, color: "#f59e0b", icon: Smartphone },
  { name: "Bank Transfer", value: 5, color: "#8b5cf6", icon: Building2 },
]

export function PaymentMethodsChart() {
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
                    <div className="text-lg font-bold">{data.value}%</div>
                    <div className="text-xs text-muted-foreground">of total transactions</div>
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
