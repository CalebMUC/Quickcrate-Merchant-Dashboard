// Enhanced Order Management Types
export interface OrderFilters {
  search: string;
  status: OrderStatus | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: 'date' | 'total' | 'items';
  sortOrder: 'asc' | 'desc';
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ProductTrackingUpdate {
  trackingID: string;
  orderID: string;
  productId: string;
  currentStatus: TrackingStatus;
  previousStatus: TrackingStatus;
  trackingNotes: string;
  carrier: string;
  expectedDeliveryDate: string;
  location?: string;
}

export type TrackingStatus = 'ordered' | 'processing' | 'confirmed' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

export interface TrackingEvent {
  trackingID: string;
  orderID: string;
  productId: string;
  currentStatus: TrackingStatus;
  previousStatus?: TrackingStatus;
  trackingNotes: string;
  trackingDate: string;
  location?: string;
  carrier?: string;
  expectedDeliveryDate?: string;
  updatedBy?: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayOrders: number;
  weeklyGrowth: number;
}

// Status metadata for UI
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: string;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-100 border-yellow-300',
    icon: 'Clock'
  },
  processing: { 
    label: 'Processing', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100 border-blue-300',
    icon: 'Package'
  },
  shipped: { 
    label: 'Shipped', 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100 border-purple-300',
    icon: 'Truck'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'text-green-700', 
    bgColor: 'bg-green-100 border-green-300',
    icon: 'CheckCircle'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100 border-red-300',
    icon: 'XCircle'
  },
};

export const TRACKING_STATUS_CONFIG: Record<TrackingStatus, {
  label: string;
  color: string;
  icon: string;
  description: string;
}> = {
  ordered: {
    label: 'Order Placed',
    color: 'text-gray-700',
    icon: 'ShoppingCart',
    description: 'Order has been placed'
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-600',
    icon: 'Clock',
    description: 'Order is being processed'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-600',
    icon: 'CheckCircle',
    description: 'Order confirmed by merchant'
  },
  packed: {
    label: 'Packed',
    color: 'text-indigo-600',
    icon: 'Package',
    description: 'Items have been packed'
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-600',
    icon: 'Truck',
    description: 'Package has been shipped'
  },
  in_transit: {
    label: 'In Transit',
    color: 'text-orange-600',
    icon: 'Navigation',
    description: 'Package is on its way'
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'text-yellow-600',
    icon: 'MapPin',
    description: 'Package is out for delivery'
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    icon: 'CheckCircle2',
    description: 'Successfully delivered'
  },
  failed: {
    label: 'Failed',
    color: 'text-red-600',
    icon: 'AlertCircle',
    description: 'Delivery failed'
  }
};
