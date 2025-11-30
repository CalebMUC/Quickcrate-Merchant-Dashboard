import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardSummary } from '@/lib/api/dashboard';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';

export function useDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const merchantId = user?.merchantId || 'ea1989e3-f9c4-4ff5-86bf-a24148aa570e';

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getSummary(merchantId);
      setSummary(response.data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
    merchantId,
  };
}
