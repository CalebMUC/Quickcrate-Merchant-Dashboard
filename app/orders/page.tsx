"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, RefreshCw, Download, TrendingUp, TrendingDown } from "lucide-react"

import { MerchantOrder, MerchantOrderProduct, OrderStatuses } from "@/types"
import { useOrders } from "@/features/orders/hooks/useOrders"
import { useOrderTracking } from "@/features/orders/hooks/useOrderTracking"
import { OrderFiltersBar } from "@/features/orders/components/OrderFiltersBar"
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge"
import { OrdersEmptyState, ErrorState } from "@/features/orders/components/EmptyState"
import { OrdersTableSkeleton } from "@/features/orders/components/LoadingStates"

import { OrderProductsModal } from "@/components/order-products-modal"
import { ProductTrackingModal } from "@/components/product-Tracking-modal"
import { OrderStatus } from "@/features/orders"

export default function OrdersPage() {
  const merchantId = "ea1989e3-f9c4-4ff5-86bf-a24148aa570e"
  
  // Use custom hooks for state management
  const { 
    orders, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    refreshOrders,
    stats 
  } = useOrders(merchantId)
  
  const { 
    tracking, 
    orderStatuses,
    fetchTracking, 
    updateTracking,
    fetchOrderStatuses,
    loading: trackingLoading 
  } = useOrderTracking()

  // Local UI state
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<MerchantOrderProduct | null>(null)
  const [trackModalOpen, setTrackModalOpen] = useState(false)

  // Fetch order statuses on mount
  useEffect(() => {
    fetchOrderStatuses()
  }, [])

  // Handle track product click
  const handleTrackProduct = async (product: MerchantOrderProduct) => {
    if (!selectedOrder?.orderId || !product?.productID) {
      console.error("Missing orderId or productId")
      return
    }

    setSelectedProduct(product)
    await fetchTracking(selectedOrder.orderId, product.productID)
    setTrackModalOpen(true)
  }

  const getOrderStatuses = async (orderStatus : OrderStatuses) => {
    // Placeholder for fetching order statuses
    // Implement API call when endpoint is available
    await fetchOrderStatuses();
  }

  // Handle tracking update
  const handleUpdateTracking = async (updateData: any) => {
    const success = await updateTracking(updateData)
    if (success) {
      // Close the modal and refresh orders
      setTrackModalOpen(false)
      refreshOrders()
    }
  }

  // Handle close tracking modal
  const handleCloseTrackingModal = () => {
    setTrackModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage customer orders in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing + stats.shipped}</div>
            <p className="text-xs text-muted-foreground">Processing & shipped</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Orders Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders with advanced filtering
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <OrderFiltersBar 
            filters={filters} 
            onFiltersChange={updateFilters}
            stats={stats}
          />

          {/* Loading State */}
          {loading && <OrdersTableSkeleton />}

          {/* Error State */}
          {error && !loading && (
            <ErrorState 
              description={error}
              retry={refreshOrders}
            />
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && <OrdersEmptyState />}

          {/* Orders Table */}
          {!loading && !error && orders.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.orderId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">
                        {order.orderId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.orderDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {order.products.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        KES {order.subTotal.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ORDER PRODUCTS MODAL */}
      <OrderProductsModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        products={selectedOrder?.products || []}
        onTrack={handleTrackProduct}
      />

      {/* PRODUCT TRACKING MODAL */}
      <ProductTrackingModal
        open={trackModalOpen}
        onClose={handleCloseTrackingModal}
        product={selectedProduct}
        tracking={tracking}
        orderStatuses={orderStatuses}
        orderId={selectedOrder?.orderId}
        productId={selectedProduct?.productID}
        onUpdateTracking={handleUpdateTracking}
      />
    </div>
  )
}
