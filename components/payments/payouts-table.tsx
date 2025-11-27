"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Calendar, Package, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { PayoutStatusBadge } from "./payout-status-badge"
import { PaymentMethodIcon } from "./payment-method-icon"
import { Payout } from "@/types"
import { cn } from "@/lib/utils"

interface PayoutsTableProps {
  payouts: Payout[]
  onViewDetails?: (payout: Payout) => void
  className?: string
}

export function PayoutsTable({ payouts, onViewDetails, className }: PayoutsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Period</TableHead>
            <TableHead className="font-semibold">Gross Amount</TableHead>
            <TableHead className="font-semibold">Commission</TableHead>
            <TableHead className="font-semibold">Net Payout</TableHead>
            <TableHead className="font-semibold">Orders</TableHead>
            <TableHead className="font-semibold">Payment Method</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Scheduled Date</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No payouts found</p>
                  <p className="text-sm">Your payouts will appear here once orders are completed</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            payouts.map((payout, index) => (
              <TableRow
                key={payout.payoutId}
                className={cn(
                  "transition-all duration-200 hover:bg-accent/50",
                  hoveredRow === payout.payoutId && "bg-accent/30"
                )}
                onMouseEnter={() => setHoveredRow(payout.payoutId)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {formatDate(payout.periodStartDate)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        to {formatDate(payout.periodEndDate)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-medium">{formatCurrency(payout.grossAmount)}</span>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(payout.commissionAmount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({payout.commissionRate}%)
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-bold text-green-600">
                    {formatCurrency(payout.netAmount)}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{payout.orderCount}</span>
                      <span className="text-xs text-muted-foreground">
                        {payout.productCount} items
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {payout.paymentMethod ? (
                    <div className="flex items-center gap-2">
                      <PaymentMethodIcon type={payout.paymentMethod.type} className="p-2" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{payout.paymentMethod.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {payout.paymentMethod.maskedDetails}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No method</span>
                  )}
                </TableCell>

                <TableCell>
                  <PayoutStatusBadge status={payout.status} />
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm font-mono">
                      {formatDate(payout.scheduledDate)}
                    </span>
                    {payout.completedDate && (
                      <span className="text-xs text-green-600">
                        Paid {formatDate(payout.completedDate)}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-opacity",
                        hoveredRow === payout.payoutId ? "opacity-100" : "opacity-0"
                      )}
                      onClick={() => onViewDetails?.(payout)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {payout.status === "Completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "transition-opacity",
                          hoveredRow === payout.payoutId ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
