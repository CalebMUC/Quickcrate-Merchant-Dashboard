"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import TrackingForm from "@/components/Forms/tracking-form"
import { OrderStatuses } from "@/types"
import { 
  CheckCircle, 
  Truck, 
  Clock, 
  Package, 
  ShoppingCart,
  Navigation,
  MapPin,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

interface TrackingEvent {
  trackingID?: string;
  orderID?: string;
  productId?: string;
  currentStatus: string;
  trackingNotes: string;
  trackingDate: string;
  location?: string;
  carrier?: string;
  expectedDeliveryDate?: string;
}

interface Product {
  productName?: string;
  productID?: string;
}

interface ProductTrackingModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  tracking: TrackingEvent[];
  orderStatuses: OrderStatuses[];
  orderId?: string;
  productId?: string;
  onUpdateTracking?: (data: any) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  ordered: <ShoppingCart className="h-5 w-5" />,
  processing: <Clock className="h-5 w-5" />,
  confirmed: <CheckCircle className="h-5 w-5" />,
  packed: <Package className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  in_transit: <Navigation className="h-5 w-5" />,
  out_for_delivery: <MapPin className="h-5 w-5" />,
  delivered: <CheckCircle2 className="h-5 w-5" />,
  failed: <AlertCircle className="h-5 w-5" />,
}

const statusColors: Record<string, string> = {
  ordered: "text-gray-600 bg-gray-100",
  processing: "text-blue-600 bg-blue-100",
  confirmed: "text-green-600 bg-green-100",
  packed: "text-indigo-600 bg-indigo-100",
  shipped: "text-purple-600 bg-purple-100",
  in_transit: "text-orange-600 bg-orange-100",
  out_for_delivery: "text-yellow-600 bg-yellow-100",
  delivered: "text-green-700 bg-green-100",
  failed: "text-red-600 bg-red-100",
}

export function ProductTrackingModal({ 
  open, 
  onClose, 
  product, 
  tracking, 
  orderStatuses,
  orderId,
  productId,
  onUpdateTracking 
}: ProductTrackingModalProps) {

  const latest = tracking.length > 0 ? tracking[tracking.length - 1] : null

  // Enrich latest with orderId and productId if they're not in the tracking data
  const enrichedLatest = latest ? {
    ...latest,
    orderID: latest.orderID || orderId,
    productId: latest.productId || productId
  } : null

  const getStatusInfo = (status: string) => {
    const normalized = status.toLowerCase().replace(/\s+/g, '_')
    return {
      icon: statusIcons[normalized] || <Clock className="h-5 w-5" />,
      color: statusColors[normalized] || "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">

        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">Product Tracking</DialogTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{product?.productName}</span>
                <span className="hidden sm:inline">•</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  ID: {product?.productID}
                </span>
              </div>
            </div>

            {latest && (
              <Badge 
                variant="outline" 
                className={`${getStatusInfo(latest.currentStatus).color} font-semibold px-3 py-1 flex-shrink-0`}
              >
                {latest.currentStatus}
              </Badge>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="px-4 sm:px-6 py-6">
            <div className="space-y-6">
              
              <Separator />

              {/* Update Tracking Form */}
              {enrichedLatest && onUpdateTracking && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Update Tracking Status</h3>
                  <TrackingForm
                    orderStatuses={orderStatuses}
                    latest={enrichedLatest}
                    onSubmit={onUpdateTracking}
                  />
                </div>
              )}
              
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
