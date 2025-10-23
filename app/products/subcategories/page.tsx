"use client"

import { SubcategoriesManagement } from "@/components/subcategories-management"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SubcategoriesPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Subcategories Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage subcategories within your product categories.
          </p>
        </div>
      </div>

      <SubcategoriesManagement />
    </div>
  )
}