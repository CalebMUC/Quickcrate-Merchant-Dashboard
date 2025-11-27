import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '@/lib/api/orders';
import { MerchantOrder } from '@/types';
import { OrderFilters } from '../types';
import { toast } from 'sonner';

export function useOrders(merchantId: string) {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.getMerchantOrders(merchantId);
      setOrders(response.data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      // Status filter
      if (filters.status !== 'all' && order.status.toLowerCase() !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          order.orderId.toLowerCase().includes(searchLower) ||
          order.products.some((p) => 
            p.productName.toLowerCase().includes(searchLower)
          )
        );
      }

      return true;
    })
    .sort((a, b) => {
      const modifier = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'date':
          return modifier * (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
        case 'total':
          return modifier * (a.subTotal - b.subTotal);
        case 'items':
          return modifier * (a.products.length - b.products.length);
        default:
          return 0;
      }
    });

  const updateFilters = (newFilters: Partial<OrderFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status.toLowerCase() === 'pending').length,
    processing: orders.filter((o) => o.status.toLowerCase() === 'processing').length,
    shipped: orders.filter((o) => o.status.toLowerCase() === 'shipped').length,
    delivered: orders.filter((o) => o.status.toLowerCase() === 'delivered').length,
  };

  return {
    orders: filteredOrders,
    allOrders: orders,
    loading,
    error,
    filters,
    updateFilters,
    refreshOrders,
    stats,
  };
}
