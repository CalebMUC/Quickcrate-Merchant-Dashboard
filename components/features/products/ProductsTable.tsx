"use client"

import { useState, useEffect } from "react"
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
import { Product } from "@/types"
import { productsService } from "@/lib/api/products"

const statusColors = {
  approved: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsService.getProducts({
        page: 1,
        limit: 50,
      })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      // Use mock data as fallback
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = async (productId: string) => {
    try {
      await productsService.deleteProduct(productId)
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleStatusUpdate = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        await productsService.approveProduct(productId)
      } else {
        await productsService.rejectProduct(productId)
      }
      await fetchProducts()
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading products...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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

      {/* Products Table */}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
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
                    className={statusColors[product.status as keyof typeof statusColors]}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit product
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {product.status === 'pending' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(product.id, 'approved')}
                            className="text-green-600"
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(product.id, 'rejected')}
                            className="text-red-600"
                          >
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600"
                      >
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No products found matching your criteria
        </div>
      )}
    </div>
  )
}

// Mock data for fallback
const mockProducts: Product[] = [
  {
    id: "PRD-001",
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics",
    price: 129.99,
    stock: 45,
    status: "approved",
    image: "/diverse-people-listening-headphones.png",
    rating: 4.5,
    sales: 234,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "PRD-002", 
    name: "Cotton T-Shirt",
    description: "Comfortable cotton t-shirt",
    category: "Clothing",
    price: 24.99,
    stock: 120,
    status: "pending",
    image: "/plain-white-tshirt.png",
    rating: 4.2,
    sales: 156,
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
  },
  // Add more mock products as needed
]