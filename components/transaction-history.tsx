"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon, Download, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: "TXN-001",
    orderId: "ORD-001",
    customer: "John Smith",
    amount: 299.0,
    fee: 8.97,
    net: 290.03,
    status: "completed",
    method: "Credit Card",
    date: "2024-01-15",
    payoutDate: "2024-01-17",
  },
  {
    id: "TXN-002",
    orderId: "ORD-002",
    customer: "Sarah Johnson",
    amount: 159.0,
    fee: 4.77,
    net: 154.23,
    status: "completed",
    method: "PayPal",
    date: "2024-01-14",
    payoutDate: "2024-01-16",
  },
  {
    id: "TXN-003",
    orderId: "ORD-003",
    customer: "Mike Davis",
    amount: 89.0,
    fee: 2.67,
    net: 86.33,
    status: "pending",
    method: "Credit Card",
    date: "2024-01-13",
    payoutDate: null,
  },
  {
    id: "TXN-004",
    orderId: "ORD-004",
    customer: "Emily Brown",
    amount: 199.0,
    fee: 5.97,
    net: 193.03,
    status: "processing",
    method: "Bank Transfer",
    date: "2024-01-12",
    payoutDate: null,
  },
  {
    id: "TXN-005",
    orderId: "ORD-005",
    customer: "Alex Wilson",
    amount: 349.0,
    fee: 10.47,
    net: 338.53,
    status: "failed",
    method: "Credit Card",
    date: "2024-01-11",
    payoutDate: null,
  },
]

const statusColors = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
}

const paymentMethodColors = {
  "Credit Card": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  PayPal: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  "Bank Transfer": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
  "Apple Pay": "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300",
}

export function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal transition-all hover:scale-105",
                  !dateFrom && "text-muted-foreground",
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
                  !dateTo && "text-muted-foreground",
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

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payout Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction, index) => (
              <TableRow
                key={transaction.id}
                className="hover:bg-muted/30 transition-all duration-200 animate-in slide-in-from-left-5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium font-mono text-sm">{transaction.id}</TableCell>
                <TableCell className="font-medium">{transaction.orderId}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell className="font-medium">${transaction.amount.toFixed(2)}</TableCell>
                <TableCell className="text-red-600 font-medium">-${transaction.fee.toFixed(2)}</TableCell>
                <TableCell className="font-medium text-green-600">${transaction.net.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${paymentMethodColors[transaction.method as keyof typeof paymentMethodColors] || "bg-muted"} transition-colors`}
                  >
                    {transaction.method}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{transaction.date}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${statusColors[transaction.status as keyof typeof statusColors]} transition-colors`}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {transaction.payoutDate ? (
                    <span className="font-mono text-sm">{transaction.payoutDate}</span>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
