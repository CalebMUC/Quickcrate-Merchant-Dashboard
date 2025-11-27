"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

interface PayoutStatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  Pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  Scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  Processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  Failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
  Cancelled: {
    label: "Cancelled",
    icon: Ban,
    className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
  },
}

export function PayoutStatusBadge({ status, className, showIcon = true }: PayoutStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium transition-colors",
        config.className,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn("mr-1.5 h-3 w-3", status === "Processing" && "animate-spin")} />
      )}
      {config.label}
    </Badge>
  )
}
