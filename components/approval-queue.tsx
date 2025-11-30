"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, Eye, RefreshCw } from "lucide-react"
import { Product } from "@/types"
import { productsService } from "@/lib/api/products"
import { toast } from "sonner"
import { ApprovalDialog } from "@/components/approval-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export function ApprovalQueue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getPendingProducts();
      setProducts(response.data);
    } catch (error: any) {
      console.error('Failed to load pending products:', error);
      toast.error('Failed to load pending products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleApprove = async (productId: string) => {
    try {
      setProcessing(productId);
      await productsService.approveProduct(productId);
      toast.success('Product approved successfully');
      setProducts(products.filter(p => p.productId !== productId));
      if (selectedProduct?.productId === productId) {
        setDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to approve product:', error);
      toast.error('Failed to approve product');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      setProcessing(productId);
      await productsService.rejectProduct(productId);
      toast.success('Product rejected');
      setProducts(products.filter(p => p.productId !== productId));
      if (selectedProduct?.productId === productId) {
        setDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to reject product:', error);
      toast.error('Failed to reject product');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Approval Queue
          </CardTitle>
          <CardDescription>Products waiting for approval before going live</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Approval Queue
                <Badge variant="secondary" className="ml-2">
                  {products.length}
                </Badge>
              </CardTitle>
              <CardDescription>Products waiting for approval before going live</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPendingProducts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No pending approvals</p>
              <p className="text-sm">All products have been reviewed</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                          <Image
                            src={product.imageUrls?.[0] || "/placeholder.svg"}
                            alt={product.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[250px] truncate">
                          {product.productName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.sku || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        KES {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.stockQuantity}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(product.createdOn)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <ApprovalDialog
          product={selectedProduct}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}
    </>
  )
}
