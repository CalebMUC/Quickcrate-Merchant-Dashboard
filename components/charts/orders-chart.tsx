"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Delivered", value: 342, color: "#22c55e" }, // Green for delivered
  { name: "Shipped", value: 156, color: "#3b82f6" }, // Blue for shipped
  { name: "Pending", value: 75, color: "#f59e0b" }, // Amber for pending
  { name: "Cancelled", value: 23, color: "#ef4444" }, // Red for cancelled
]

export function OrdersChart() {
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
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg animate-in fade-in-0 duration-150">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                        <span className="text-sm font-medium">{payload[0].name}</span>
                      </div>
                      <span className="font-bold text-lg">{payload[0].value} orders</span>
                      <span className="text-xs text-muted-foreground">
                        {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% of
                        total
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
