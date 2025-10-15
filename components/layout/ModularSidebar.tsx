'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Package,
  CreditCard,
  FileText,
  Settings,
  ShoppingCart,
  Bell,
  HelpCircle,
  Store,
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  DollarSign,
  Truck,
  Star,
  MessageSquare,
  Shield,
  Globe,
  LogOut,
  User,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
  },
  {
    name: 'Products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/products', icon: Package },
      { name: 'Add Product', href: '/products/add', icon: Package },
      { name: 'Categories', href: '/products/categories', icon: Package },
      { name: 'Approval Queue', href: '/products/approval', icon: Package, badge: '3' },
    ],
  },
  {
    name: 'Orders',
    icon: ShoppingCart,
    children: [
      { name: 'All Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Pending Orders', href: '/orders/pending', icon: ShoppingCart, badge: '5' },
      { name: 'Shipping', href: '/orders/shipping', icon: Truck },
      { name: 'Returns', href: '/orders/returns', icon: ShoppingCart },
    ],
  },
  {
    name: 'Payments',
    icon: CreditCard,
    children: [
      { name: 'Transactions', href: '/payments', icon: CreditCard },
      { name: 'Payouts', href: '/payments/payouts', icon: DollarSign },
      { name: 'Payment Methods', href: '/payments/methods', icon: CreditCard },
      { name: 'Billing', href: '/payments/billing', icon: FileText },
    ],
  },
  {
    name: 'Analytics',
    icon: TrendingUp,
    children: [
      { name: 'Overview', href: '/analytics', icon: BarChart3 },
      { name: 'Sales Reports', href: '/analytics/sales', icon: TrendingUp },
      { name: 'Customer Insights', href: '/analytics/customers', icon: Users },
      { name: 'Performance', href: '/analytics/performance', icon: BarChart3 },
    ],
  },
  {
    name: 'Customers',
    icon: Users,
    children: [
      { name: 'All Customers', href: '/customers', icon: Users },
      { name: 'Reviews', href: '/customers/reviews', icon: Star },
      { name: 'Support Tickets', href: '/customers/support', icon: MessageSquare },
    ],
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: '3',
  },
  {
    name: 'Support',
    href: '/support',
    icon: HelpCircle,
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'Profile', href: '/settings/profile', icon: User },
      { name: 'Business', href: '/settings/business', icon: Store },
      { name: 'Security', href: '/settings/security', icon: Shield },
      { name: 'Integrations', href: '/settings/integrations', icon: Globe },
    ],
  },
];

export function ModularSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products', 'Orders']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href === pathname;

    if (hasChildren) {
      return (
        <div key={item.name} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-between text-left font-normal h-10',
              level > 0 && 'pl-8',
              'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
            onClick={() => toggleExpanded(item.name)}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && (
            <div className="space-y-1 ml-4">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.name} href={item.href!}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start font-normal h-10',
            level > 0 && 'pl-8',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <item.icon className="h-4 w-4 shrink-0 mr-3" />
          <span className="truncate">{item.name}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <Store className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-semibold text-lg">QuickCrate</h1>
          <p className="text-xs text-muted-foreground">Merchant Dashboard</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          {/* Primary Navigation */}
          <div className="space-y-1">
            {navigation.map(item => renderNavigationItem(item))}
          </div>

          {/* Secondary Navigation */}
          <div className="border-t border-border pt-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-2">
              Support
            </p>
            {secondaryNavigation.map(item => renderNavigationItem(item))}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start font-normal text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign out
        </Button>
      </div>
    </div>
  );
}