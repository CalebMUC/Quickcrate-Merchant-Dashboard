"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Folder, 
  Search, 
  MoreHorizontal,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  categoriesService, 
  type Category, 
  type SubCategory,
  type CreateSubCategoryDto,
  type UpdateSubCategoryDto
} from "@/lib/api/categories"

export function SubcategoriesManagement() {
  // State Management
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  
  // Dialog States
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false)
  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false)
  
  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  
  // Form States
  const [subCategoryForm, setSubCategoryForm] = useState<CreateSubCategoryDto | UpdateSubCategoryDto>({
    name: "",
    description: "",
    categoryId: "",
    isActive: true,
    sortOrder: 0
  })
  
  // Currently editing item
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // =====================================
  // API OPERATIONS
  // =====================================

  const loadData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

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
          // Add category name to each subcategory for display
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
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${allSubcategories.length} subcategories.`,
      })
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      
      toast({
        title: "Error Loading Data",
        description: "Failed to load subcategories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Search subcategories
  const handleSearch = async () => {
    await loadData()
  }

  // Refresh data
  const handleRefresh = async () => {
    await loadData(true)
  }

  // =====================================
  // SUBCATEGORY CRUD OPERATIONS
  // =====================================

  const handleCreateSubCategory = async () => {
    try {
      const newSubCategory = await categoriesService.createSubCategory(subCategoryForm as CreateSubCategoryDto)
      
      toast({
        title: "Subcategory Created",
        description: `Successfully created subcategory "${newSubCategory.name}".`,
      })
      
      resetSubCategoryForm()
      setIsAddSubCategoryOpen(false)
      await loadData()
    } catch (error) {
      console.error('Error creating subcategory:', error)
      toast({
        title: "Error Creating Subcategory",
        description: error instanceof Error ? error.message : "Failed to create subcategory.",
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
        title: "Subcategory Updated",
        description: `Successfully updated subcategory "${updatedSubCategory.name}".`,
      })
      
      resetSubCategoryForm()
      setIsEditSubCategoryOpen(false)
      setEditingSubCategory(null)
      await loadData()
    } catch (error) {
      console.error('Error updating subcategory:', error)
      toast({
        title: "Error Updating Subcategory", 
        description: error instanceof Error ? error.message : "Failed to update subcategory.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubCategory = async (id: string) => {
    try {
      await categoriesService.deleteSubCategory(id)
      
      toast({
        title: "Subcategory Deleted",
        description: "Subcategory has been successfully deleted.",
      })
      
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      toast({
        title: "Error Deleting Subcategory",
        description: error instanceof Error ? error.message : "Failed to delete subcategory.",
        variant: "destructive",
      })
    }
  }

  // =====================================
  // FORM HELPER FUNCTIONS
  // =====================================

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: "",
      description: "",
      categoryId: "",
      isActive: true,
      sortOrder: 0
    })
  }

  // =====================================
  // EVENT HANDLERS
  // =====================================

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

  // Filter subcategories based on search term
  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subcategory as any).categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Subcategories Management</h2>
          <p className="text-muted-foreground">
            Manage subcategories within your product categories.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button onClick={() => setIsAddSubCategoryOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subcategories Table */}
      {!loading && filteredSubcategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>
              Manage your product subcategories and their parent categories
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {filteredSubcategories.map((subcategory) => (
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
                        <Tag className="h-3 w-3" />
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
                            Edit Subcategory
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(subcategory.id, subcategory.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Subcategory
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredSubcategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subcategories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No subcategories match your search criteria.' : 'Create your first subcategory to get started.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddSubCategoryOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Subcategory
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
            <DialogDescription>
              Create a new subcategory under a parent category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subcategory-name">Subcategory Name *</Label>
                <Input
                  id="subcategory-name"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  placeholder="Enter subcategory name"
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
                placeholder="Enter subcategory description"
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
                <Label htmlFor="subcategory-active">Active Subcategory</Label>
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
              Create Subcategory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubCategoryOpen} onOpenChange={setIsEditSubCategoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update the subcategory details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategory-name">Subcategory Name *</Label>
                <Input
                  id="edit-subcategory-name"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  placeholder="Enter subcategory name"
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
                placeholder="Enter subcategory description"
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
                <Label htmlFor="edit-subcategory-active">Active Subcategory</Label>
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
              Update Subcategory
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
              This will permanently delete the subcategory "{deleteTarget?.name}" and all its associated data.
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