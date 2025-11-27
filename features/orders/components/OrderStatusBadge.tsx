import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';
import { OrderStatus, ORDER_STATUS_CONFIG } from '../types';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
};

export function OrderStatusBadge({ status, showIcon = true, size = 'md' }: OrderStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as OrderStatus;
  const config = ORDER_STATUS_CONFIG[normalizedStatus] || ORDER_STATUS_CONFIG.pending;
  
  const IconComponent = iconMap[config.icon as keyof typeof iconMap];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        config.color,
        config.bgColor,
        sizeClasses[size],
        'flex items-center gap-1.5 w-fit'
      )}
    >
      {showIcon && IconComponent && (
        <IconComponent className={iconSizes[size]} />
      )}
      {config.label}
    </Badge>
  );
}
