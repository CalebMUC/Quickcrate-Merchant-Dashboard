import { useState, useCallback } from 'react';
import { ordersService } from '@/lib/api/orders';
import { TrackingEvent, ProductTrackingUpdate, OrderStatus } from '../types';
import { toast } from 'sonner';
import { set } from 'date-fns';
import { OrderStatuses } from '@/types';

interface UseOrderTrackingProps {
  orderId?: string;
  productId?: string;
}

export function useOrderTracking({ orderId, productId }: UseOrderTrackingProps = {}) {
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatuses[]>([]);

  const fetchOrderStatuses = useCallback(async () => {
    try{
      setLoading(true);
      setError(null);
      const response = await ordersService.getOrderStatuses();
      setOrderStatuses(response.data);

    }catch(err : any){
      const errorMessage = err?.message || 'Failed to load order statuses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }

  }, []);

  const fetchTracking = useCallback(async (orderIdParam?: string, productIdParam?: string) => {
    const finalOrderId = orderIdParam || orderId;
    const finalProductId = productIdParam || productId;

    if (!finalOrderId || !finalProductId) {
      console.error('Missing orderId or productId');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.getTracking(finalOrderId, finalProductId);
      setTracking(response.data || []);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load tracking information';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [orderId, productId]);

  const updateTracking = useCallback(async (updateData: ProductTrackingUpdate) => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await ordersService.updateTracking(updateData);
      
      toast.success('Tracking updated successfully');
      
      // Refresh tracking data using correct property names
      await fetchTracking(updateData.orderID || (updateData as any).OrderId, updateData.productId || (updateData as any).ProductId);
      
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update tracking';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [fetchTracking]);

  const latestTracking = tracking.length > 0 ? tracking[tracking.length - 1] : null;

  return {
    tracking,
    latestTracking,
    orderStatuses,
    loading,
    updating,
    error,
    fetchTracking,
    fetchOrderStatuses,
    updateTracking,
  };
}
