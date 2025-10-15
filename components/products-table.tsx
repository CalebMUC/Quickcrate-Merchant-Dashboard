"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Edit, Trash2, Eye, Star } from "lucide-react"

const products = [
  {
    id: "PRD-001",
    name: "Wireless Bluetooth Headphones",
    category: "Electronics",
    price: 129.99,
    stock: 45,
    status: "approved",
    image: "/diverse-people-listening-headphones.png",
    rating: 4.5,
    sales: 234,
  },
  {
    id: "PRD-002",
    name: "Cotton T-Shirt",
    category: "Clothing",
    price: 24.99,
    stock: 120,
    status: "pending",
    image: "/plain-white-tshirt.png",
    rating: 4.2,
    sales: 156,
  },
  {
    id: "PRD-003",
    name: "Smart Watch",
    category: "Electronics",
    price: 299.99,
    stock: 8,
    status: "approved",
    image: "/modern-smartwatch.png",
    rating: 4.8,
    sales: 89,
  },
  {
    id: "PRD-004",
    name: "Yoga Mat",
    category: "Sports",
    price: 39.99,
    stock: 0,
    status: "rejected",
    image: "/rolled-yoga-mat.png",
    rating: 4.1,
    sales: 67,
  },
  {
    id: "PRD-005",
    name: "Coffee Mug",
    category: "Home",
    price: 12.99,
    stock: 67,
    status: "approved",
    image: "/ceramic-coffee-mug.jpg",
    rating: 4.3,
    sales: 198,
  },
]

const statusColors = {
  approved: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
}

export function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product, index) => (
              <TableRow
                key={product.id}
                className="hover:bg-muted/30 transition-colors group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover border border-border group-hover:scale-110 transition-transform duration-200"
                      />
                      {product.sales > 150 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                          <Star className="h-2 w-2 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-blue-600 transition-colors">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">${product.price}</TableCell>
                <TableCell>
                  <span
                    className={`${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-500" : "text-green-600"} font-medium`}
                  >
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-green-600">{product.sales}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`transition-colors ${statusColors[product.status as keyof typeof statusColors]}`}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
