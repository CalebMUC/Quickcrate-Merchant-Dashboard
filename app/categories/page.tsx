"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoriesTable } from "@/components/categories-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus, Tags, Folder, RefreshCw, Loader2, Eye, EyeOff, TrendingUp } from "lucide-react"
import { categoriesService, type Category, type CreateCategoryDto, type UpdateCategoryDto } from "@/lib/api/categories"

export default function CategoriesPage() {
  // State Management
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  
  // Form States
  const [categoryForm, setCategoryForm] = useState<CreateCategoryDto | UpdateCategoryDto>({
    name: "",
    description: "",
    slug: "",
    parentId: "",
    imageUrl: "",
    metaTitle: "",
    metaDescription: "",
    sortOrder: 0,
    isActive: true
  })
  
  const [editMode, setEditMode] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Stats
  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const inactiveCategories = categories.filter(c => !c.isActive).length
  const categoriesWithProducts = categories.filter(c => (c.productCount || 0) > 0).length

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await categoriesService.getCategories({
        search: "",
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      })

      // Load subcategories for each category
      const categoriesWithHierarchy = await Promise.all(
        response.categories.map(async (category: Category) => {
          try {
            const subcategories = await categoriesService.getSubCategories(category.categoryId || category.id)
            return { ...category, subcategories }
          } catch (error) {
            console.error(`Error loading subcategories for category ${category.id}:`, error)
            return { ...category, subcategories: [] }
          }
        })
      )

      setCategories(categoriesWithHierarchy)
      
      if (showRefreshIndicator) {
        toast({
          title: "Categories Refreshed",
          description: `Successfully refreshed ${response.totalCount} categories.`,
        })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "Error Loading Categories",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const newCategory = await categoriesService.createCategory(categoryForm as CreateCategoryDto)
      
      toast({
        title: "Category Created",
        description: `Successfully created category "${newCategory.name}".`,
      })
      
      resetCategoryForm()
      setIsAddCategoryOpen(false)
      await loadCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Error Creating Category",
        description: error instanceof Error ? error.message : "Failed to create category.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
    
    try {
      const updatedCategory = await categoriesService.updateCategory(
        editingCategory.categoryId, 
        categoryForm as UpdateCategoryDto
      )
      
      toast({
        title: "Category Updated", 
        description: `Successfully updated category "${updatedCategory.name}".`,
      })
      
      resetCategoryForm()
      setIsAddCategoryOpen(false)
      setEditMode(false)
      setEditingCategory(null)
      await loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Error Updating Category",
        description: error instanceof Error ? error.message : "Failed to update category.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoriesService.deleteCategory(id)
      
      toast({
        title: "Category Deleted",
        description: "Category has been successfully deleted.",
      })
      
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
      await loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error Deleting Category",
        description: error instanceof Error ? error.message : "Failed to delete category.",
        variant: "destructive",
      })
    }
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      slug: "",
      parentId: "",
      imageUrl: "",
      metaTitle: "",
      metaDescription: "",
      sortOrder: 0,
      isActive: true
    })
  }

  const openEditCategory = (category: Category) => {
    setEditMode(true)
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      slug: category.slug || "",
      parentId: category.parentId || "",
      imageUrl: category.imageUrl || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive
    })
    setIsAddCategoryOpen(true)
  }

  const confirmDelete = (type: string, id: string, name: string) => {
    setCategoryToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleRefresh = async () => {
    await loadCategories(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products with a comprehensive category hierarchy
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="default" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="shadow-sm hover:shadow transition-shadow"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button 
            onClick={() => setIsAddCategoryOpen(true)}
            className="shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalCategories}
            </div>
            <p className="text-xs text-muted-foreground">
              All categories in system
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : activeCategories}
            </div>
            <p className="text-xs text-muted-foreground">
              Published & visible
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : categoriesWithProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Categories in use
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : inactiveCategories}
            </div>
            <p className="text-xs text-muted-foreground">
              Hidden from public
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriesTable
            categories={categories}
            openEditCategory={openEditCategory}
            openEditSubCategory={() => {}}
            openEditSubSubCategory={() => {}}
            openAddSubCategory={() => {}}
            openAddSubSubCategory={() => {}}
            confirmDelete={confirmDelete}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
        setIsAddCategoryOpen(open)
        if (!open) {
          resetCategoryForm()
          setEditMode(false)
          setEditingCategory(null)
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">
              {editMode ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {editMode 
                ? "Update the category details and settings."
                : "Create a new category to organize your products."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name" className="text-sm font-medium">Category Name *</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Enter category name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-slug" className="text-sm font-medium">Slug</Label>
                  <Input
                    id="category-slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-description" className="text-sm font-medium">Description *</Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Hierarchy & Order */}
            <div className="space-y-6">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Hierarchy & Order
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Parent Category */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="category-parent" className="text-sm font-medium">
                    Parent Category
                  </Label>
                  <div className="relative z-10">
                    <Select
                      value={categoryForm.parentId || undefined}
                      onValueChange={(value) =>
                        setCategoryForm({ ...categoryForm, parentId: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Select parent category" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="none">No Parent (Root Category)</SelectItem>
                        {categories
                          .filter(cat => !editMode || (cat.categoryId || cat.id) !== (editingCategory?.categoryId || editingCategory?.id))
                          .map((cat) => (
                            <SelectItem key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sort Order */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="category-sort-order" className="text-sm font-medium">
                    Sort Order
                  </Label>
                  <Input
                    id="category-sort-order"
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="h-10 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Media & SEO */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Media & SEO</h4>
              <div className="space-y-2">
                <Label htmlFor="category-image" className="text-sm font-medium">Image URL</Label>
                <Input
                  id="category-image"
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-meta-title" className="text-sm font-medium">Meta Title</Label>
                  <Input
                    id="category-meta-title"
                    value={categoryForm.metaTitle}
                    onChange={(e) => setCategoryForm({ ...categoryForm, metaTitle: e.target.value })}
                    placeholder="SEO meta title"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-meta-description" className="text-sm font-medium">Meta Description</Label>
              <Textarea
                id="category-meta-description"
                value={categoryForm.metaDescription}
                onChange={(e) => setCategoryForm({ ...categoryForm, metaDescription: e.target.value })}
                placeholder="SEO meta description"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Settings</h4>
              <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg">
                <Switch
                  id="category-active"
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="category-active" className="text-sm font-medium">Active Category</Label>
                  <p className="text-xs text-muted-foreground">Enable this category for public use</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsAddCategoryOpen(false)
              resetCategoryForm()
              setEditMode(false)
              setEditingCategory(null)
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editMode ? handleUpdateCategory : handleCreateCategory} 
              disabled={!categoryForm.name?.trim() || !categoryForm.description?.trim()}
              className="min-w-[120px]"
            >
              {editMode ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{categoryToDelete?.name}" and all its associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
