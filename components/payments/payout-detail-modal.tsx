"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingDown, 
  Download, 
  CreditCard,
  Receipt,
  AlertCircle
} from "lucide-react"
import { Payout } from "@/types"
import { PayoutStatusBadge } from "./payout-status-badge"
import { PaymentMethodIcon } from "./payment-method-icon"
import { format } from "date-fns"

interface PayoutDetailModalProps {
  payout: Payout | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayoutDetailModal({ payout, open, onOpenChange }: PayoutDetailModalProps) {
  if (!payout) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Payout Details</DialogTitle>
              <DialogDescription>
                Complete breakdown of payout calculation and included orders
              </DialogDescription>
            </div>
            <PayoutStatusBadge status={payout.status} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Period Information */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Payout Period</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDateShort(payout.periodStartDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDateShort(payout.periodEndDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Date</p>
                  <p className="font-medium">{formatDateShort(payout.scheduledDate)}</p>
                </div>
                {payout.completedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Date</p>
                    <p className="font-medium text-green-600">
                      {formatDateShort(payout.completedDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Amount Breakdown</h3>
              </div>
              <div className="space-y-3 bg-gradient-to-br from-muted/30 to-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gross Amount</span>
                  <span className="font-semibold text-lg">{formatCurrency(payout.grossAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-muted-foreground">
                      Platform Commission ({payout.commissionRate}%)
                    </span>
                  </div>
                  <span className="font-semibold text-lg text-red-600">
                    -{formatCurrency(payout.commissionAmount)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Net Payout</span>
                  <span className="font-bold text-2xl text-green-600">
                    {formatCurrency(payout.netAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Order Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{payout.orderCount}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Products Sold</p>
                  <p className="text-3xl font-bold text-purple-600">{payout.productCount}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {payout.paymentMethod && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">Payment Method</h3>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg">
                  <PaymentMethodIcon type={payout.paymentMethod.type} />
                  <div className="flex-1">
                    <p className="font-semibold">{payout.paymentMethod.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {payout.paymentMethod.maskedDetails}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {payout.paymentMethod.type}
                  </Badge>
                </div>
              </div>
            )}

            {/* Payment Reference */}
            {payout.paymentReference && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">Payment Reference</h3>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-mono text-sm">{payout.paymentReference}</p>
                </div>
              </div>
            )}

            {/* Failure Reason */}
            {payout.failureReason && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-lg text-red-600">Failure Reason</h3>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">{payout.failureReason}</p>
                </div>
              </div>
            )}

            {/* Transactions List */}
            {payout.transactions && payout.transactions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">Included Orders</h3>
                </div>
                <div className="space-y-2">
                  {payout.transactions.map((transaction) => (
                    <div
                      key={transaction.payoutTransactionId}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">{transaction.orderNumber}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{transaction.customerName}</span>
                          <span>•</span>
                          <span>{transaction.itemCount} items</span>
                          <span>•</span>
                          <span>{formatDateShort(transaction.orderCompletedDate)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transaction.orderAmount)}</p>
                        <p className="text-xs text-red-600">
                          -{formatCurrency(transaction.commissionAmount)}
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(transaction.netAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {payout.notes && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{payout.notes}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            {payout.status === "Completed" && (
              <>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button>
                  <Receipt className="h-4 w-4 mr-2" />
                  View Invoice
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
