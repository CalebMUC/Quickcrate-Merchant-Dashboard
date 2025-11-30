"use client"
import Image from "next/image"
import { dashboardService } from "@/lib/api/dashboard"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function TopProductsChart() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const merchantId = user?.merchantId || 'ea1989e3-f9c4-4ff5-86bf-a24148aa570e';

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getTopProducts(merchantId, 5, '30days');
        setData(response.data);
      } catch (error: any) {
        console.error('Failed to load top products:', error);
        toast.error('Failed to load top products');
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [merchantId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No product data available
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.sales));

  return (
    <div className="animate-in slide-in-from-right-5 duration-700">
      <div className="space-y-4">
        {data.map((product, index) => (
          <div
            key={product.productId}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 animate-in fade-in-0 slide-in-from-left-5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 group">
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.productName}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">{product.productName}</h4>
                <span className="text-sm font-bold text-primary">KES {product.revenue.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(product.sales / maxSales) * 100}%`,
                      animationDelay: `${index * 200}ms`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium min-w-fit">{product.sales} sales</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
