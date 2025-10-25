"use client"

import { SubcategoriesManagement } from "@/components/subcategories-management"
import { Button } from "@/components/ui/button"
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ChevronLeft, Package, Tags } from "lucide-react"
import Link from "next/link"

export default function SubcategoriesPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          {/* Creative Navigation Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/products" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Package className="h-4 w-4" />
                    Products
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2 font-semibold">
                  <Tags className="h-4 w-4" />
                  Subcategories
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-2">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>     
        </div>
      </div>

      <SubcategoriesManagement />
    </div>
  )
}