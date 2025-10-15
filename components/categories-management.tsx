"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Tag, Folder } from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Electronics",
    subcategories: ["Smartphones", "Laptops", "Headphones", "Accessories"],
    productCount: 45,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Clothing",
    subcategories: ["T-Shirts", "Jeans", "Dresses", "Shoes"],
    productCount: 78,
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Home & Garden",
    subcategories: ["Furniture", "Decor", "Kitchen", "Garden Tools"],
    productCount: 32,
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "Sports & Outdoors",
    subcategories: ["Fitness", "Outdoor Gear", "Sports Equipment"],
    productCount: 23,
    color: "bg-orange-500",
  },
]

export function CategoriesManagement() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories & Subcategories</h2>
          <p className="text-muted-foreground">Organize your products with categories and subcategories</p>
        </div>
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 transition-colors">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new category to organize your products</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input id="category-name" placeholder="Enter category name" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsAddingCategory(false)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">Add Category</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                {category.productCount} products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((sub, index) => (
                  <Badge key={index} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors">
                    <Tag className="mr-1 h-3 w-3" />
                    {sub}
                  </Badge>
                ))}
              </div>
              <Dialog
                open={isAddingSubcategory && selectedCategory === category.id}
                onOpenChange={(open) => {
                  setIsAddingSubcategory(open)
                  if (open) setSelectedCategory(category.id)
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 hover:bg-blue-50 hover:border-blue-300 transition-colors bg-transparent"
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Subcategory
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Subcategory to {category.name}</DialogTitle>
                    <DialogDescription>Create a new subcategory under {category.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subcategory-name">Subcategory Name</Label>
                      <Input id="subcategory-name" placeholder="Enter subcategory name" />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setIsAddingSubcategory(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Add Subcategory</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
