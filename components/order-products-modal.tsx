"use client"

import { 
  Dialog, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"

import { DialogMediumContent } from "@/components/ui/dialog"

import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, DollarSign, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Product {
  productID: string;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderProductsModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onTrack: (product: Product) => void;
}

export function OrderProductsModal({ open, onClose, products, onTrack }: OrderProductsModalProps) {
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogMediumContent>
        
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Order Products</DialogTitle>
              <DialogDescription>
                View and track individual products in this order
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-background">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-lg font-semibold">{totalItems}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-background">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-lg font-semibold">KES {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* TABLE WRAPPER */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[50vh] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[40%]">Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products?.map((p) => (
                  <TableRow 
                    key={p.productID}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.productName}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {p.productID.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-semibold">
                        {p.quantity}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right text-sm">
                      KES {p.price.toLocaleString()}
                    </TableCell>
                    
                    <TableCell className="text-right font-semibold">
                      KES {(p.quantity * p.price).toLocaleString()}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => onTrack(p)}
                        className="gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Track
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} in this order
          </p>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Order Total</p>
            <p className="text-xl font-bold">KES {totalValue.toLocaleString()}</p>
          </div>
        </div>

      </DialogMediumContent>
    </Dialog>
  )
}
