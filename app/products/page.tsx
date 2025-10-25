"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsTable } from "@/components/products-table"
import { ApprovalQueue } from "@/components/approval-queue"
import { AddProductModal } from "@/components/add-product-modal"
import { CategoriesManagement } from "@/components/categories-management"
import { Package, Clock, CheckCircle, TrendingUp } from "lucide-react"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("all")

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['all', 'categories', 'pending', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, upload new items, and track approval status.
          </p>
        </div>
        <AddProductModal />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12 from last week
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">3 submitted today</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Products</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,156</div>
            <p className="text-xs text-muted-foreground">94% approval rate</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 subcategories</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="all" className="transition-all">
            All Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="transition-all">
            Categories
          </TabsTrigger>
          <TabsTrigger value="pending" className="transition-all">
            Approval Queue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="transition-all">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                View and manage all your products across different categories and statuses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 animate-in fade-in-50 duration-300">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 animate-in fade-in-50 duration-300">
          <ApprovalQueue />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Product Analytics</CardTitle>
              <CardDescription>Detailed insights about your product performance and trends.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4" />
                <p>Product analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
