"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon, Download, ArrowUpDown, Package } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MerchantTransaction } from "@/types"
import { PayoutStatusBadge } from "./payout-status-badge"

interface MerchantTransactionsTableProps {
  transactions: MerchantTransaction[]
  className?: string
}

export function MerchantTransactionsTable({ transactions, className }: MerchantTransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortField, setSortField] = useState("orderDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.payoutStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

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
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer or order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] transition-all focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal transition-all hover:scale-105",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "MMM dd") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal transition-all hover:scale-105",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "MMM dd") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="outline" className="transition-all hover:scale-105 bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Order</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors font-semibold"
                onClick={() => handleSort("orderAmount")}
              >
                <div className="flex items-center">
                  Order Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">Commission</TableHead>
              <TableHead className="font-semibold">Net Amount</TableHead>
              <TableHead className="font-semibold">Payment Method</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors font-semibold"
                onClick={() => handleSort("orderDate")}
              >
                <div className="flex items-center">
                  Order Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">Payout Status</TableHead>
              <TableHead className="font-semibold">Payout Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <TableRow
                  key={transaction.transactionId}
                  className="hover:bg-muted/30 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium font-mono text-sm">{transaction.orderNumber}</span>
                      <span className="text-xs text-muted-foreground">{transaction.itemCount} items</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.customerName}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(transaction.orderAmount)}</TableCell>
                  <TableCell className="text-red-600 font-medium">
                    -{formatCurrency(transaction.commissionAmount)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(transaction.netAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      {transaction.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatDate(transaction.orderDate)}</TableCell>
                  <TableCell>
                    <PayoutStatusBadge status={transaction.payoutStatus} />
                  </TableCell>
                  <TableCell>
                    {transaction.payoutDate ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{formatDate(transaction.payoutDate)}</span>
                        {transaction.payoutReference && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {transaction.payoutReference}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Total Orders: </span>
              <span className="font-bold">{filteredTransactions.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Earned: </span>
              <span className="font-bold text-green-600">
                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Commission: </span>
              <span className="font-bold text-red-600">
                {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.commissionAmount, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
