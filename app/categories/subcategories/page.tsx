"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Plus, Folder, RefreshCw, Loader2, Eye, EyeOff, TrendingUp, Tags, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { categoriesService, type Category, type SubCategory, type CreateSubCategoryDto, type UpdateSubCategoryDto } from "@/lib/api/categories"

export default function SubCategoriesPage() {
  // State Management
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false)
  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  
  // Form States
  const [subCategoryForm, setSubCategoryForm] = useState<CreateSubCategoryDto | UpdateSubCategoryDto>({
    name: "",
    description: "",
    categoryId: "",
    isActive: true,
    sortOrder: 0
  })
  
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)

  // Stats
  const totalSubcategories = subcategories.length
  const activeSubcategories = subcategories.filter(s => s.isActive).length
  const inactiveSubcategories = subcategories.filter(s => !s.isActive).length
  const subcategoriesWithProducts = subcategories.filter(s => (s.productCount || 0) > 0).length

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Load categories for parent selection
      const categoriesResponse = await categoriesService.getCategories({
        search: "",
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      })
      setCategories(categoriesResponse.categories)

      // Load all subcategories
      const allSubcategories: SubCategory[] = []
      for (const category of categoriesResponse.categories) {
        try {
          const subcats = await categoriesService.getSubCategories(category.id)
          const enrichedSubcats = subcats.map(sub => ({
            ...sub,
            categoryName: category.name
          }))
          allSubcategories.push(...enrichedSubcats)
        } catch (error) {
          console.error(`Error loading subcategories for category ${category.id}:`, error)
        }
      }

      setSubcategories(allSubcategories)
      
      if (showRefreshIndicator) {
        toast({
          title: "Sub-Categories Refreshed",
          description: `Successfully refreshed ${allSubcategories.length} sub-categories.`,
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load sub-categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleCreateSubCategory = async () => {
    try {
      const newSubCategory = await categoriesService.createSubCategory(subCategoryForm as CreateSubCategoryDto)
      
      toast({
        title: "Sub-Category Created",
        description: `Successfully created sub-category "${newSubCategory.name}".`,
      })
      
      resetSubCategoryForm()
      setIsAddSubCategoryOpen(false)
      await loadData()
    } catch (error) {
      console.error('Error creating sub-category:', error)
      toast({
        title: "Error Creating Sub-Category",
        description: error instanceof Error ? error.message : "Failed to create sub-category.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubCategory = async () => {
    if (!editingSubCategory) return
    
    try {
      const updatedSubCategory = await categoriesService.updateSubCategory(
        editingSubCategory.id,
        subCategoryForm as UpdateSubCategoryDto
      )
      
      toast({
        title: "Sub-Category Updated",
        description: `Successfully updated sub-category "${updatedSubCategory.name}".`,
      })
      
      resetSubCategoryForm()
      setIsEditSubCategoryOpen(false)
      setEditingSubCategory(null)
      await loadData()
    } catch (error) {
      console.error('Error updating sub-category:', error)
      toast({
        title: "Error Updating Sub-Category", 
        description: error instanceof Error ? error.message : "Failed to update sub-category.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubCategory = async (id: string) => {
    try {
      await categoriesService.deleteSubCategory(id)
      
      toast({
        title: "Sub-Category Deleted",
        description: "Sub-category has been successfully deleted.",
      })
      
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting sub-category:', error)
      toast({
        title: "Error Deleting Sub-Category",
        description: error instanceof Error ? error.message : "Failed to delete sub-category.",
        variant: "destructive",
      })
    }
  }

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: "",
      description: "",
      categoryId: "",
      isActive: true,
      sortOrder: 0
    })
  }

  const openEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory)
    setSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description || "",
      categoryId: subCategory.categoryId,
      isActive: subCategory.isActive,
      sortOrder: subCategory.sortOrder
    })
    setIsEditSubCategoryOpen(true)
  }

  const confirmDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name })
    setDeleteConfirmOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return
    await handleDeleteSubCategory(deleteTarget.id)
  }

  const handleRefresh = async () => {
    await loadData(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sub-Categories</h1>
          <p className="text-muted-foreground">
            Manage sub-categories within your product categories
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
            onClick={() => setIsAddSubCategoryOpen(true)}
            className="shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-Category
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalSubcategories}
            </div>
            <p className="text-xs text-muted-foreground">
              All sub-categories in system
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sub-Categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : activeSubcategories}
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
              {loading ? "..." : subcategoriesWithProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Sub-categories in use
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
              {loading ? "..." : inactiveSubcategories}
            </div>
            <p className="text-xs text-muted-foreground">
              Hidden from public
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Categories Table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>All Sub-Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading sub-categories...</p>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sub-categories found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first sub-category to get started.
              </p>
              <Button onClick={() => setIsAddSubCategoryOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Sub-Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-blue-500" />
                        {subcategory.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {subcategory.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(subcategory as any).categoryName || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subcategory.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{subcategory.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Tags className="h-3 w-3" />
                        {subcategory.productCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditSubCategory(subcategory)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Sub-Category
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(subcategory.id, subcategory.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Sub-Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Sub-Category Dialog */}
      <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Sub-Category</DialogTitle>
            <DialogDescription>
              Create a new sub-category under a parent category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategory-name">Sub-Category Name *</Label>
                <Input
                  id="subcategory-name"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  placeholder="Enter sub-category name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subcategory-parent">Parent Category *</Label>
                <Select
                  value={subCategoryForm.categoryId}
                  onValueChange={(value) => setSubCategoryForm({ ...subCategoryForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subcategory-description">Description</Label>
              <Textarea
                id="subcategory-description"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                placeholder="Enter sub-category description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategory-sort-order">Sort Order</Label>
                <Input
                  id="subcategory-sort-order"
                  type="number"
                  value={subCategoryForm.sortOrder}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="subcategory-active"
                  checked={subCategoryForm.isActive}
                  onCheckedChange={(checked) => setSubCategoryForm({ ...subCategoryForm, isActive: checked })}
                />
                <Label htmlFor="subcategory-active">Active Sub-Category</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsAddSubCategoryOpen(false)
              resetSubCategoryForm()
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSubCategory} 
              disabled={!subCategoryForm.name?.trim() || !subCategoryForm.categoryId}
            >
              Create Sub-Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-Category Dialog */}
      <Dialog open={isEditSubCategoryOpen} onOpenChange={setIsEditSubCategoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sub-Category</DialogTitle>
            <DialogDescription>
              Update the sub-category details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategory-name">Sub-Category Name *</Label>
                <Input
                  id="edit-subcategory-name"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  placeholder="Enter sub-category name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategory-parent">Parent Category *</Label>
                <Select
                  value={subCategoryForm.categoryId}
                  onValueChange={(value) => setSubCategoryForm({ ...subCategoryForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-subcategory-description">Description</Label>
              <Textarea
                id="edit-subcategory-description"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                placeholder="Enter sub-category description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategory-sort-order">Sort Order</Label>
                <Input
                  id="edit-subcategory-sort-order"
                  type="number"
                  value={subCategoryForm.sortOrder}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit-subcategory-active"
                  checked={subCategoryForm.isActive}
                  onCheckedChange={(checked) => setSubCategoryForm({ ...subCategoryForm, isActive: checked })}
                />
                <Label htmlFor="edit-subcategory-active">Active Sub-Category</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditSubCategoryOpen(false)
              setEditingSubCategory(null)
              resetSubCategoryForm()
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubCategory} 
              disabled={!subCategoryForm.name?.trim() || !subCategoryForm.categoryId}
            >
              Update Sub-Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sub-category "{deleteTarget?.name}" and all its associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
