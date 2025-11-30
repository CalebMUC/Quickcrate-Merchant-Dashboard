"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Package, Tag, Barcode, Calendar, DollarSign, Box } from "lucide-react"
import { Product } from "@/types"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ApprovalDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (productId: string) => Promise<void>;
  onReject: (productId: string) => Promise<void>;
  processing: string | null;
}

export function ApprovalDialog({
  product,
  open,
  onOpenChange,
  onApprove,
  onReject,
  processing,
}: ApprovalDialogProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isProcessing = processing === product.productId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Approval Review
          </DialogTitle>
          <DialogDescription>
            Review product details before approving or rejecting
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Product Images */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Product Images</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Main Image */}
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <Image
                      src={product.imageUrls[selectedImage] || "/placeholder.svg"}
                      alt={product.productName}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.imageUrls && product.imageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`${product.productName} - ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Product Name</label>
                  <p className="text-base font-medium mt-1">{product.productName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Category
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline">{product.categoryName}</Badge>
                      {product.subCategoryName && (
                        <Badge variant="outline" className="ml-2">
                          {product.subCategoryName}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Barcode className="h-3 w-3" />
                      SKU
                    </label>
                    <p className="text-base font-mono mt-1">{product.sku || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Price
                    </label>
                    <p className="text-lg font-bold mt-1">KES {product.price.toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Discount</label>
                    <p className="text-lg font-bold mt-1 text-orange-500">{product.discount}%</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Box className="h-3 w-3" />
                      Stock
                    </label>
                    <p className="text-lg font-bold mt-1">{product.stockQuantity}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Submitted On
                  </label>
                  <p className="text-sm mt-1">{formatDate(product.createdOn)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Description</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {product.description || product.productDescription || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Product Specification */}
            {product.productDescription && product.productDescription !== product.description && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Product Specification</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{product.productDescription}</p>
                  </div>
                </div>
              </>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Status</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {product.isFeatured && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Product ID</h3>
                <p className="text-sm font-mono text-muted-foreground">{product.productId}</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onReject(product.productId)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onApprove(product.productId)}
              disabled={isProcessing}
            >
              <Check className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
