"use client"

import { Building2, Smartphone, Mail, CreditCard, Bitcoin } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentMethodIconProps {
  type: string
  className?: string
}

const methodIcons = {
  BankTransfer: Building2,
  MobileMoney: Smartphone,
  PayPal: Mail,
  DebitCard: CreditCard,
  Cryptocurrency: Bitcoin,
}

const methodColors = {
  BankTransfer: "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
  MobileMoney: "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400",
  PayPal: "text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400",
  DebitCard: "text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400",
  Cryptocurrency: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400",
}

export function PaymentMethodIcon({ type, className }: PaymentMethodIconProps) {
  const Icon = methodIcons[type as keyof typeof methodIcons] || Building2
  const colorClass = methodColors[type as keyof typeof methodColors] || methodColors.BankTransfer

  return (
    <div className={cn("p-3 rounded-lg transition-colors", colorClass, className)}>
      <Icon className="h-5 w-5" />
    </div>
  )
}
