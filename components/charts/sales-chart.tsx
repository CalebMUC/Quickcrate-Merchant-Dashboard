"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const data = [
  { name: "Jan", total: 15000 },
  { name: "Feb", total: 18000 },
  { name: "Mar", total: 22000 },
  { name: "Apr", total: 19000 },
  { name: "May", total: 25000 },
  { name: "Jun", total: 28000 },
  { name: "Jul", total: 32000 },
  { name: "Aug", total: 29000 },
  { name: "Sep", total: 35000 },
  { name: "Oct", total: 38000 },
  { name: "Nov", total: 42000 },
  { name: "Dec", total: 45000 },
]

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                      <span className="font-bold text-muted-foreground">${payload[0].value?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--chart-1))"
          fillOpacity={1}
          fill="url(#salesGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
