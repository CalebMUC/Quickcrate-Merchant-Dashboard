"use client"

import { CategoriesManagement } from "@/components/categories-management"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function CategoriesPage() {
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
            <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
          </div>
          <p className="text-muted-foreground">
            Organize your products by creating and managing categories and subcategories.
          </p>
        </div>
      </div>

      <CategoriesManagement />
    </div>
  )
}