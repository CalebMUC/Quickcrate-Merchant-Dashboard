import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { OrderFilters } from '../types';

interface OrderFiltersBarProps {
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
  stats?: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
}

export function OrderFiltersBar({ filters, onFiltersChange, stats }: OrderFiltersBarProps) {
  const hasActiveFilters = filters.search || filters.status !== 'all';

  const clearFilters = () => {
    onFiltersChange({ search: '', status: 'all' });
  };

  return (
    <div className="space-y-4">
      {/* Main Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or product name..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ status: value as any })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Orders {stats && `(${stats.total})`}
            </SelectItem>
            <SelectItem value="pending">
              Pending {stats && `(${stats.pending})`}
            </SelectItem>
            <SelectItem value="processing">
              Processing {stats && `(${stats.processing})`}
            </SelectItem>
            <SelectItem value="shipped">
              Shipped {stats && `(${stats.shipped})`}
            </SelectItem>
            <SelectItem value="delivered">
              Delivered {stats && `(${stats.delivered})`}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ sortBy: value as any })}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="total">Sort by Total</SelectItem>
            <SelectItem value="items">Sort by Items</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onFiltersChange({ 
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
          })}
          title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          <ArrowUpDown className={`h-4 w-4 transition-transform ${
            filters.sortOrder === 'asc' ? 'rotate-180' : ''
          }`} />
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button
                onClick={() => onFiltersChange({ search: '' })}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => onFiltersChange({ status: 'all' })}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
