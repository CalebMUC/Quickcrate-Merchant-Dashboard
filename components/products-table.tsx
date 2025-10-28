"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Users
} from "lucide-react"
import { productsService } from "@/lib/api/products"
import { Product, PaginatedResponse, User } from "@/types"
import { toast } from "sonner"

const statusColors = {
  approved: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [refreshing, setRefreshing] = useState(false)
  
  // Get current user info for role checking
  const currentUser = productsService.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  // Fetch products from API
  const fetchProducts = async (
    page: number = 1,
    search?: string,
    status?: string
  ) => {
    try {
      setLoading(true)
      console.log('🔍 Fetching products:', { page, search, status })
      
      const params: any = {
        page,
        limit: pagination.pageSize,
      }
      
      if (search && search.trim()) {
        params.search = search.trim()
      }
      
      if (status && status !== 'all') {
        params.status = status
      }

      const response = await productsService.getProducts(params)
      
      console.log('✅ Products fetched:', response)
      
      setProducts(response.data)
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage
      })
      
    } catch (error) {
      console.error('💥 Error fetching products:', error)
      toast.error('Failed to load products. Please try again.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Load products on component mount
  useEffect(() => {
    fetchProducts(1, searchTerm, statusFilter)
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchTerm, statusFilter)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter])

  // Refresh products
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchProducts(pagination.page, searchTerm, statusFilter)
    setRefreshing(false)
    toast.success('Products refreshed!')
  }

  // Handle product actions
  const handleDeleteProduct = async (productId: string) => {
    if (!productId) {
      toast.error('Invalid product ID')
      return
    }

    try {
      await productsService.deleteProduct(productId)
      toast.success('Product deleted successfully')
      await fetchProducts(pagination.page, searchTerm, statusFilter)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleApproveProduct = async (productId: string) => {
    if (!productId) {
      toast.error('Invalid product ID')
      return
    }

    try {
      await productsService.approveProduct(productId)
      toast.success('Product approved successfully')
      await fetchProducts(pagination.page, searchTerm, statusFilter)
    } catch (error) {
      console.error('Error approving product:', error)
      toast.error('Failed to approve product')
    }
  }

  const handleRejectProduct = async (productId: string) => {
    if (!productId) {
      toast.error('Invalid product ID')
      return
    }

    try {
      await productsService.rejectProduct(productId, 'Rejected from products table')
      toast.success('Product rejected successfully')
      await fetchProducts(pagination.page, searchTerm, statusFilter)
    } catch (error) {
      console.error('Error rejecting product:', error)
      toast.error('Failed to reject product')
    }
  }

  return (
    <div className="space-y-6">
      {/* Client Info */}
      {/* <div className="mb-6">
        <Card className="w-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Info</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="font-medium">Merchant</div>
              <div className="text-xs text-muted-foreground break-all">{currentUser?.merchantId ?? '—'}</div>
            </div>
            <div className="mt-3 text-sm">
              <div className="font-medium">Role</div>
              <div className="text-xs text-muted-foreground">{currentUser?.role ?? '—'}</div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters and Search */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
            disabled={loading}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
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
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Products count and pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {loading ? (
            'Loading products...'
          ) : (
            `Showing ${products.length} of ${pagination.totalCount} products`
          )}
        </div>
        <div>
          {!loading && pagination.totalPages > 1 && (
            `Page ${pagination.page} of ${pagination.totalPages}`
          )}
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`} className="animate-pulse">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-muted rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-8 bg-muted rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-12 bg-muted rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-8 bg-muted rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                    <p>No products found</p>
                    <p className="text-sm">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Add your first product to get started'
                      }
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Products data
              products.map((product: Product, index: number) => (
                <TableRow
                  key={product.productId || product.id}
                  className="hover:bg-muted/30 transition-colors group"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={product.imageUrls?.[0] || product.image || product.images?.[0] || "/placeholder.svg"}
                          alt={product.productName || product.name || "Product"}
                          className="h-12 w-12 rounded-lg object-cover border border-border group-hover:scale-110 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        {product.isFeatured && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                            <Star className="h-2 w-2 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div 
                          className="font-medium group-hover:text-blue-600 transition-colors cursor-help" 
                          title={product.description || product.productDescription || product.productName || product.name}
                        >
                          {((product.productName || product.name) || "").length > 100 
                            ? `${(product.productName || product.name || "").substring(0, 30)}...`
                            : (product.productName || product.name)
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.sku || product.productId?.slice(0, 8) || product.id?.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {product.categoryName || product.category}
                      </Badge>
                      {product.subCategoryName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {product.subCategoryName}
                          {product.subSubCategoryName && ` > ${product.subSubCategoryName}`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <span>${product.price.toLocaleString()}</span>
                      {product.discount > 0 && (
                        <div className="text-sm text-green-600">
                          {product.discount}% off
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`${
                        (product.stockQuantity || product.stock) === 0 
                          ? "text-red-500" 
                          : (product.stockQuantity || product.stock || 0) < 10 
                            ? "text-amber-500" 
                            : "text-green-600"
                      } font-medium`}
                    >
                      {product.stockQuantity || product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`transition-colors ${
                          statusColors[product.status as keyof typeof statusColors]
                        }`}
                      >
                        {product.status}
                      </Badge>
                      {product.isActive && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          Active
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                          Featured
                        </Badge>
                      )}
                    </div>
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
                        <DropdownMenuItem onClick={() => console.log('View product:', product.productId || product.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Edit product:', product.productId || product.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isAdmin && product.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleApproveProduct(product.productId ?? product.id ?? '')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRejectProduct(product.productId ?? product.id ?? '')}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(product.productId ?? product.id ?? '')}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(pagination.page - 1, searchTerm, statusFilter)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(pagination.page + 1, searchTerm, statusFilter)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
