"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
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
  Tags,
  Boxes,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Receipt,
  Wallet,
  TrendingUp,
  Calendar,
  Download,
  User,
  Shield,
  Palette,
  MessageSquare,
  Phone,
  FileQuestion,
  AlertCircle,
  Folder
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    submenu: [
      {
        name: "Overview",
        href: "/",
        icon: BarChart3,
      },
      {
        name: "Analytics",
        href: "/analytics",
        icon: TrendingUp,
      }
    ]
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
    submenu: [
      {
        name: "All Products",
        href: "/products",
        icon: Package,
      },
      {
        name: "Categories",
        href: "/products/categories",
        icon: Tags,
      },
      {
        name: "Subcategories",
        href: "/products/subcategories",
        icon: Folder,
      },
      {
        name: "Approval Queue", 
        href: "/products?tab=pending",
        icon: Clock,
      },
      {
        name: "Inventory",
        href: "/products/inventory",
        icon: Boxes,
      }
    ]
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    submenu: [
      {
        name: "All Orders",
        href: "/orders",
        icon: ShoppingCart,
      },
      {
        name: "Pending Orders",
        href: "/orders/pending",
        icon: Clock,
      },
      {
        name: "Completed Orders",
        href: "/orders/completed",
        icon: CheckCircle,
      },
      {
        name: "Cancelled Orders",
        href: "/orders/cancelled",
        icon: XCircle,
      },
      {
        name: "Shipping",
        href: "/orders/shipping",
        icon: Truck,
      },
      {
        name: "Tracking",
        href: "/orders/tracking",
        icon: MapPin,
      }
    ]
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
    submenu: [
      {
        name: "Transactions",
        href: "/payments",
        icon: Receipt,
      },
      {
        name: "Payment Methods",
        href: "/payments/methods",
        icon: CreditCard,
      },
      {
        name: "Payouts",
        href: "/payments/payouts",
        icon: Wallet,
      },
      {
        name: "Refunds",
        href: "/payments/refunds",
        icon: XCircle,
      }
    ]
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    submenu: [
      {
        name: "Sales Reports",
        href: "/reports",
        icon: TrendingUp,
      },
      {
        name: "Financial Reports",
        href: "/reports/financial",
        icon: Receipt,
      },
      {
        name: "Product Reports",
        href: "/reports/products",
        icon: Package,
      },
      {
        name: "Custom Reports",
        href: "/reports/custom",
        icon: FileText,
      },
      {
        name: "Schedule Reports",
        href: "/reports/schedule",
        icon: Calendar,
      },
      {
        name: "Export Data",
        href: "/reports/export",
        icon: Download,
      }
    ]
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    submenu: [
      {
        name: "General",
        href: "/settings",
        icon: Settings,
      },
      {
        name: "Profile",
        href: "/settings/profile",
        icon: User,
      },
      {
        name: "Security",
        href: "/settings/security",
        icon: Shield,
      },
      {
        name: "Appearance",
        href: "/settings/appearance",
        icon: Palette,
      },
      {
        name: "Notifications",
        href: "/settings/notifications",
        icon: Bell,
      }
    ]
  },
]

const secondaryNavigation = [
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Support",
    href: "/support",
    icon: HelpCircle,
    submenu: [
      {
        name: "Help Center",
        href: "/support",
        icon: HelpCircle,
      },
      {
        name: "Contact Support",
        href: "/support/contact",
        icon: MessageSquare,
      },
      {
        name: "Phone Support",
        href: "/support/phone",
        icon: Phone,
      },
      {
        name: "Documentation",
        href: "/support/docs",
        icon: FileQuestion,
      },
      {
        name: "System Status",
        href: "/support/status",
        icon: AlertCircle,
      }
    ]
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]) // Start with all collapsed for cleaner look

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isActiveSubmenu = (submenuHref: string) => {
    if (submenuHref.includes('?tab=')) {
      const [basePath, tabParam] = submenuHref.split('?tab=')
      return pathname === basePath && 
             (typeof window !== 'undefined' && window.location.search.includes(`tab=${tabParam}`))
    }
    return pathname === submenuHref || pathname.startsWith(submenuHref + '/')
  }

  const renderNavigationItem = (item: any, isSecondary = false) => {
    const isActive = pathname === item.href || (item.submenu && item.submenu.some((sub: any) => isActiveSubmenu(sub.href)))
    const isExpanded = expandedMenus.includes(item.name)
    
    return (
      <div key={item.name}>
        {/* Main menu item */}
        <div className="flex items-center">
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-1",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
          
          {/* Expand/Collapse button for items with submenu */}
          {item.submenu && (
            <button
              onClick={() => toggleMenu(item.name)}
              className={cn(
                "p-1 rounded hover:bg-accent transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Submenu items */}
        {item.submenu && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.submenu.map((subItem: any) => {
              const isSubActive = isActiveSubmenu(subItem.href)
              return (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors border-l-2 ml-2",
                    isSubActive
                      ? "bg-primary/10 text-primary border-l-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border-l-transparent hover:border-l-accent-foreground/20",
                  )}
                >
                  <subItem.icon className="h-3 w-3" />
                  {subItem.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">MerchantHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </div>

        <div className="pt-4 mt-4 border-t border-border">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => renderNavigationItem(item, true))}
          </div>
        </div>
      </nav>
    </div>
  )
}
