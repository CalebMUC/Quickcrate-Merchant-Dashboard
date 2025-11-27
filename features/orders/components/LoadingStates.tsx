import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function OrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrderModalSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrackingTimelineSkeleton() {
  return (
    <div className="flex items-center justify-between gap-6 py-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col items-center min-w-[200px]">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            {i < 3 && <Skeleton className="h-1 w-24" />}
          </div>
          <Skeleton className="h-6 w-24 mt-4" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      ))}
    </div>
  );
}
