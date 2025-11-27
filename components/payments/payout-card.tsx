"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PayoutCardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  colorScheme?: "green" | "yellow" | "blue" | "red" | "purple"
  className?: string
}

const colorSchemes = {
  green: {
    icon: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    value: "text-green-600",
    trend: "text-green-600",
  },
  yellow: {
    icon: "bg-yellow-100 dark:bg-yellow-900/20",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    value: "text-yellow-600",
    trend: "text-yellow-600",
  },
  blue: {
    icon: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    value: "text-foreground",
    trend: "text-blue-600",
  },
  red: {
    icon: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    value: "text-red-600",
    trend: "text-red-600",
  },
  purple: {
    icon: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    value: "text-foreground",
    trend: "text-purple-600",
  },
}

export function PayoutCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme = "blue",
  className,
}: PayoutCardProps) {
  const scheme = colorSchemes[colorScheme]

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 hover:scale-105",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", scheme.icon)}>
          <Icon className={cn("h-4 w-4", scheme.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", scheme.value)}>{value}</div>
        {trend && (
          <div
            className={cn(
              "flex items-center text-xs mt-1",
              trend.isPositive ? scheme.trend : "text-red-600"
            )}
          >
            <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
            {trend.value}
          </div>
        )}
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
