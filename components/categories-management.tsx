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
  type SubSubCategory,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type CreateSubCategoryDto,
  type UpdateSubCategoryDto,
  type CreateSubSubCategoryDto,
  type UpdateSubSubCategoryDto
} from "@/lib/api/categories"

export function CategoriesManagement() {
  // State Management
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  
  // Dialog States
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false)
  const [isAddSubSubCategoryOpen, setIsAddSubSubCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isEditSubCategoryOpen, setIsEditSubCategoryOpen] = useState(false)
  const [isEditSubSubCategoryOpen, setIsEditSubSubCategoryOpen] = useState(false)
  
  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'subcategory' | 'subsubcategory'
    id: string
    name: string
  } | null>(null)
  
  // Success Dialog States
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<{
    title: string
    description: string
  } | null>(null)
  
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
  const [subCategoryForm, setSubCategoryForm] = useState<CreateSubCategoryDto | UpdateSubCategoryDto>({
    name: "",
    description: "",
    slug: "",
    categoryId: "",
    imageUrl: "",
    isActive: true,
    sortOrder: 0
  })
  const [subSubCategoryForm, setSubSubCategoryForm] = useState<CreateSubSubCategoryDto | UpdateSubSubCategoryDto>({
    name: "",
    description: "",
    subCategoryId: "",
    isActive: true,
    sortOrder: 0
  })
  
  // Currently editing items
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
  const [editingSubSubCategory, setEditingSubSubCategory] = useState<SubSubCategory | null>(null)
  
  // Selected parent for adding subcategories
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string | null>(null)
  const [selectedSubCategoryForSubSub, setSelectedSubCategoryForSubSub] = useState<string | null>(null)

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  // =====================================
  // API OPERATIONS
  // =====================================

  const loadCategories = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await categoriesService.getCategories({
        search: searchTerm,
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      })

      // Load subcategories and sub-subcategories for each category
        const categoriesWithHierarchy = await Promise.all(
        response.categories.map(async (category: Category) => {
          try {
            const subcategories = await categoriesService.getSubCategories(category.categoryId || category.id)
            
            // Load sub-subcategories for each subcategory
            const subcategoriesWithSubSub = await Promise.all(
              subcategories.map(async (subcategory: SubCategory) => {
                try {
                  const subSubCategories = await categoriesService.getSubSubCategories(subcategory.id)
                  return { ...subcategory, subSubCategories }
                } catch (error) {
                  console.error(`Error loading sub-subcategories for subcategory ${subcategory.id}:`, error)
                  return { ...subcategory, subSubCategories: [] }
                }
              })
            )
            
            return { ...category, subcategories: subcategoriesWithSubSub }
          } catch (error) {
            console.error(`Error loading subcategories for category ${category.id}:`, error)
            return { ...category, subcategories: [] }
          }
        })
      )

      setCategories(categoriesWithHierarchy)
      
      toast({
        title: "Categories Loaded",
        description: `Successfully loaded ${response.totalCount} categories.`,
      })
    } catch (error) {
      console.error('Error loading categories:', error)
      setError(error instanceof Error ? error.message : 'Failed to load categories')
      
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

  // Search categories
  const handleSearch = async () => {
    await loadCategories()
  }

  // Refresh categories
  const handleRefresh = async () => {
    await loadCategories(true)
  }

  // =====================================
  // CATEGORY CRUD OPERATIONS
  // =====================================

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
        editingCategory.id, 
        categoryForm as UpdateCategoryDto
      )
      
      toast({
        title: "Category Updated", 
        description: `Successfully updated category "${updatedCategory.name}".`,
      })
      
      resetCategoryForm()
      setIsEditCategoryOpen(false)
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
      
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
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

  // =====================================
  // SUBCATEGORY CRUD OPERATIONS
  // =====================================

  const handleCreateSubCategory = async () => {
    try {
      // Validate required fields
      if (!subCategoryForm.name?.trim()) {
        toast({
          title: "Validation Error",
          description: "Subcategory name is required.",
          variant: "destructive",
        })
        return
      }

      if (!subCategoryForm.categoryId) {
        toast({
          title: "Validation Error", 
          description: "Please select a parent category.",
          variant: "destructive",
        })
        return
      }

      const newSubCategory = await categoriesService.createSubCategory(subCategoryForm as CreateSubCategoryDto)
      
      // Show success dialog
      setSuccessMessage({
        title: "Subcategory Created Successfully!",
        description: `The subcategory "${newSubCategory.name}" has been created successfully and is now available in your category hierarchy.`
      })
      setSuccessDialogOpen(true)
      
      // Also show toast notification
      toast({
        title: "Subcategory Created",
        description: `Successfully created subcategory "${newSubCategory.name}".`,
      })
      
      resetSubCategoryForm()
      setIsAddSubCategoryOpen(false)
      setSelectedCategoryForSub(null)
      await loadCategories()
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
      await loadCategories()
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
      await loadCategories()
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
  // SUB-SUBCATEGORY CRUD OPERATIONS
  // =====================================

  const handleCreateSubSubCategory = async () => {
    try {
      const newSubSubCategory = await categoriesService.createSubSubCategory(subSubCategoryForm as CreateSubSubCategoryDto)
      
      toast({
        title: "Sub-Subcategory Created",
        description: `Successfully created sub-subcategory "${newSubSubCategory.name}".`,
      })
      
      resetSubSubCategoryForm()
      setIsAddSubSubCategoryOpen(false)
      setSelectedSubCategoryForSubSub(null)
      await loadCategories()
    } catch (error) {
      console.error('Error creating sub-subcategory:', error)
      toast({
        title: "Error Creating Sub-Subcategory",
        description: error instanceof Error ? error.message : "Failed to create sub-subcategory.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubSubCategory = async () => {
    if (!editingSubSubCategory) return
    
    try {
      const updatedSubSubCategory = await categoriesService.updateSubSubCategory(
        editingSubSubCategory.id,
        subSubCategoryForm as UpdateSubSubCategoryDto
      )
      
      toast({
        title: "Sub-Subcategory Updated",
        description: `Successfully updated sub-subcategory "${updatedSubSubCategory.name}".`,
      })
      
      resetSubSubCategoryForm()
      setIsEditSubSubCategoryOpen(false)
      setEditingSubSubCategory(null)
      await loadCategories()
    } catch (error) {
      console.error('Error updating sub-subcategory:', error)
      toast({
        title: "Error Updating Sub-Subcategory",
        description: error instanceof Error ? error.message : "Failed to update sub-subcategory.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubSubCategory = async (id: string) => {
    try {
      await categoriesService.deleteSubSubCategory(id)
      
      toast({
        title: "Sub-Subcategory Deleted",
        description: "Sub-subcategory has been successfully deleted.",
      })
      
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
      await loadCategories()
    } catch (error) {
      console.error('Error deleting sub-subcategory:', error)
      toast({
        title: "Error Deleting Sub-Subcategory",
        description: error instanceof Error ? error.message : "Failed to delete sub-subcategory.",
        variant: "destructive",
      })
    }
  }

  // =====================================
  // FORM HELPER FUNCTIONS
  // =====================================

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

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: "",
      description: "",
      slug: "",
      categoryId: "",
      imageUrl: "",
      isActive: true,
      sortOrder: 0
    })
  }

  const resetSubSubCategoryForm = () => {
    setSubSubCategoryForm({
      name: "",
      description: "",
      subCategoryId: "",
      isActive: true,
      sortOrder: 0
    })
  }

  // =====================================
  // EVENT HANDLERS
  // =====================================

  const openEditCategory = (category: Category) => {
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
    setIsEditCategoryOpen(true)
  }

  const openEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory)
    setSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description || "",
      slug: subCategory.slug || "",
      categoryId: subCategory.categoryId,
      imageUrl: subCategory.imageUrl || "",
      isActive: subCategory.isActive,
      sortOrder: subCategory.sortOrder
    })
    setIsEditSubCategoryOpen(true)
  }

  const openEditSubSubCategory = (subSubCategory: SubSubCategory) => {
    setEditingSubSubCategory(subSubCategory)
    setSubSubCategoryForm({
      name: subSubCategory.name,
      description: subSubCategory.description || "",
      subCategoryId: subSubCategory.subCategoryId,
      isActive: subSubCategory.isActive,
      sortOrder: subSubCategory.sortOrder
    })
    setIsEditSubSubCategoryOpen(true)
  }

  const openAddSubCategory = (categoryId: string) => {
    setSelectedCategoryForSub(categoryId)
    // Set the form with the selected category ID pre-populated
    setSubCategoryForm({
      name: "",
      description: "",
      slug: "",
      categoryId: categoryId, // This will auto-populate the Parent Category field
      imageUrl: "",
      isActive: true,
      sortOrder: 0
    })
    setIsAddSubCategoryOpen(true)
  }

  const openAddSubSubCategory = (subCategoryId: string) => {
    setSelectedSubCategoryForSubSub(subCategoryId)
    setSubSubCategoryForm({
      ...subSubCategoryForm,
      subCategoryId
    })
    setIsAddSubSubCategoryOpen(true)
  }

  const confirmDelete = (type: 'category' | 'subcategory' | 'subsubcategory', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return
    
    switch (deleteTarget.type) {
      case 'category':
        await handleDeleteCategory(deleteTarget.id)
        break
      case 'subcategory':
        await handleDeleteSubCategory(deleteTarget.id)
        break
      case 'subsubcategory':
        await handleDeleteSubSubCategory(deleteTarget.id)
        break
    }
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categories Management</h2>
          <p className="text-muted-foreground">
            Organize your products with a comprehensive category hierarchy.
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
          
          <Button onClick={() => setIsAddCategoryOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
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
      )}

      {/* Categories Table */}
      {!loading && filteredCategories.length > 0 && (
        <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Slug</TableHead>
                    <TableHead className="font-semibold">Parent</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Sort Order</TableHead>
                    <TableHead className="font-semibold text-center">Products</TableHead>
                    <TableHead className="font-semibold text-center">Subcategories</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.categoryId} className="group hover:bg-muted/30 transition-colors border-b border-border/40">
                      <TableCell className="font-medium py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0 shadow-sm" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-pulse opacity-0 group-hover:opacity-30 transition-opacity" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{category.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="max-w-xs">
                          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                            {category.description || <span className="italic">No description</span>}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <code className="text-xs bg-muted/60 group-hover:bg-muted px-2 py-1 rounded font-mono transition-colors">
                          {category.slug || <span className="italic text-muted-foreground">No slug</span>}
                        </code>
                      </TableCell>
                      <TableCell className="py-3">
                        {category.parentId ? (
                          <Badge variant="outline" className="text-xs hover:bg-muted transition-colors">
                            <Folder className="h-3 w-3 mr-1" />
                            Has Parent
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            Root Category
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {category.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs border-emerald-200 transition-colors">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 hover:bg-red-50 text-xs transition-colors">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/40 group-hover:bg-muted transition-colors">
                          <span className="text-sm font-mono text-muted-foreground group-hover:text-foreground">{category.sortOrder}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge variant="secondary" className="text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-default">
                          <Tag className="h-3 w-3 mr-1" />
                          {category.productCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge variant="outline" className="text-xs hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors cursor-default">
                          <Folder className="h-3 w-3 mr-1" />
                          {category.subcategories?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Edit Button */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => openEditCategory(category)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {/* Quick Add Subcategory Button */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-100 hover:text-green-600"
                            onClick={() => openAddSubCategory(category.categoryId)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          {/* More Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0 hover:bg-muted-foreground/10"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-lg border-border/50">
                              <DropdownMenuItem 
                                onClick={() => openEditCategory(category)}
                                className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                              >
                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                <span>Edit Category</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openAddSubCategory(category.categoryId)}
                                className="cursor-pointer hover:bg-green-50 focus:bg-green-50"
                              >
                                <Plus className="h-4 w-4 mr-2 text-green-600" />
                                <span>Add Subcategory</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDelete('category', category.categoryId, category.name)}
                                className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete Category</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No categories match your search criteria.' : 'Create your first category to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsAddCategoryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Category
            </Button>
          )}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Add New Category</DialogTitle>
            <DialogDescription className="text-base">
              Create a new category to organize your products. Fill in the required fields and additional details.
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
<div className="space-y-6"> {/* increased spacing slightly */}
  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
    Hierarchy & Order
  </h4>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
    {/* Parent Category */}
    <div className="flex flex-col space-y-2">
      <Label htmlFor="category-parent" className="text-sm font-medium">
        Parent Category
      </Label>
      <div className="relative z-10"> {/* prevents overlap from Select dropdown */}
        <Select
          value={categoryForm.parentId || undefined}
          onValueChange={(value) =>
            setCategoryForm({ ...categoryForm, parentId: value === "none" ? "" : value })
          }
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent className="z-50"> {/* make dropdown appear on top */}
            <SelectItem value="none">No Parent (Root Category)</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </SelectItem>
            ))}
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
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCategory} 
              disabled={!categoryForm.name?.trim() || !categoryForm.description?.trim()}
              className="min-w-[120px]"
            >
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Edit Category</DialogTitle>
            <DialogDescription className="text-base">
              Update the category details and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-name" className="text-sm font-medium">Category Name *</Label>
                  <Input
                    id="edit-category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Enter category name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-slug" className="text-sm font-medium">Slug</Label>
                  <Input
                    id="edit-category-slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category-description" className="text-sm font-medium">Description *</Label>
                <Textarea
                  id="edit-category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Hierarchy & Order */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Hierarchy & Order</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-parent" className="text-sm font-medium">Parent Category</Label>
                  <Select
                    value={categoryForm.parentId || undefined}
                    onValueChange={(value) => setCategoryForm({ ...categoryForm, parentId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent (Root Category)</SelectItem>
                      {categories.filter(cat => cat.categoryId !== editingCategory?.categoryId).map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-sort-order" className="text-sm font-medium">Sort Order</Label>
                  <Input
                    id="edit-category-sort-order"
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Media & SEO */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Media & SEO</h4>
              <div className="space-y-2">
                <Label htmlFor="edit-category-image" className="text-sm font-medium">Image URL</Label>
                <Input
                  id="edit-category-image"
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-meta-title" className="text-sm font-medium">Meta Title</Label>
                  <Input
                    id="edit-category-meta-title"
                    value={categoryForm.metaTitle}
                    onChange={(e) => setCategoryForm({ ...categoryForm, metaTitle: e.target.value })}
                    placeholder="SEO meta title"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category-meta-description" className="text-sm font-medium">Meta Description</Label>
                  <Input
                    id="edit-category-meta-description"
                    value={categoryForm.metaDescription}
                    onChange={(e) => setCategoryForm({ ...categoryForm, metaDescription: e.target.value })}
                    placeholder="SEO meta description"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Settings</h4>
              <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg">
                <Switch
                  id="edit-category-active"
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="edit-category-active" className="text-sm font-medium">Active Category</Label>
                  <p className="text-xs text-muted-foreground">Enable this category for public use</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditCategoryOpen(false)
              setEditingCategory(null)
              resetCategoryForm()
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCategory} 
              disabled={!categoryForm.name?.trim() || !categoryForm.description?.trim()}
              className="min-w-[120px]"
            >
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Add New Subcategory</DialogTitle>
            <DialogDescription className="text-base">
              Create a new subcategory under the selected category. Fill in the required fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subcategory-name" className="text-sm font-medium">
                    Subcategory Name *
                  </Label>
                  <Input
                    id="subcategory-name"
                    value={subCategoryForm.name}
                    onChange={(e) =>
                      setSubCategoryForm({ ...subCategoryForm, name: e.target.value })
                    }
                    placeholder="Enter subcategory name"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory-slug" className="text-sm font-medium">
                    Slug
                  </Label>
                  <Input
                    id="subcategory-slug"
                    value={subCategoryForm.slug || ""}
                    onChange={(e) =>
                      setSubCategoryForm({ ...subCategoryForm, slug: e.target.value })
                    }
                    placeholder="Auto-generated if empty"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subcategory-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="subcategory-description"
                  value={subCategoryForm.description || ""}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter subcategory description"
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

              <div className="grid grid-cols-1 gap-6">
                {/* Parent Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Parent Category *</Label>
                  {selectedCategoryForSub ? (
                    // Auto-filled when opened from specific category
                    <div className="p-3 rounded-md bg-muted/30 text-sm font-medium flex items-center justify-between">
                      <span>
                        {categories.find((cat) => cat.categoryId === selectedCategoryForSub)
                          ?.name || "Unknown Category"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Auto-assigned
                      </Badge>
                    </div>
                  ) : (
                    // Manual selection when opened from main button
                    <div className="space-y-2">
                      <Select
                        value={subCategoryForm.categoryId}
                        onValueChange={(value) => {
                          console.log('Parent category selected:', value)
                          setSubCategoryForm({ ...subCategoryForm, categoryId: value })
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.categoryId} value={category.categoryId}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-categories" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {/* Debug info for dropdown */}
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <div>Available categories: {categories.length}</div>
                        <div>Categories: {categories.map(c => `${c.name}(${c.categoryId || c.id})`).join(', ')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <Label
                    htmlFor="subcategory-sort-order"
                    className="text-sm font-medium"
                  >
                    Sort Order
                  </Label>
                  <Input
                    id="subcategory-sort-order"
                    type="number"
                    value={subCategoryForm.sortOrder}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="h-10 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Media
              </h4>
              <div className="space-y-2">
                <Label htmlFor="subcategory-image" className="text-sm font-medium">
                  Image URL
                </Label>
                <Input
                  id="subcategory-image"
                  value={subCategoryForm.imageUrl || ""}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="h-10"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Settings
              </h4>
              <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg">
                <Switch
                  id="subcategory-active"
                  checked={subCategoryForm.isActive}
                  onCheckedChange={(checked) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      isActive: checked,
                    })
                  }
                />
                <div className="space-y-0.5">
                  <Label htmlFor="subcategory-active" className="text-sm font-medium">
                    Active Subcategory
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable this subcategory for public use
                  </p>
                </div>
              </div>
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsAddSubCategoryOpen(false)
              resetSubCategoryForm()
              setSelectedCategoryForSub(null)
            }}>
              Cancel
            </Button>
            {/* Debug info */}
            <div className="text-xs text-muted-foreground flex flex-col items-end bg-slate-100 p-2 rounded">
              <div>Name: "{subCategoryForm.name}"</div>
              <div>Name trimmed: "{subCategoryForm.name?.trim()}"</div>
              <div>CategoryId: "{subCategoryForm.categoryId}"</div>
              <div>SelectedCategoryForSub: "{selectedCategoryForSub}"</div>
              <div>Name valid: {!!subCategoryForm.name?.trim()}</div>
              <div>CategoryId valid: {!!subCategoryForm.categoryId}</div>
              <div>Button should be enabled: {!(!subCategoryForm.name?.trim() || !subCategoryForm.categoryId)}</div>
            </div>
            <Button 
              onClick={() => {
                console.log('Create button clicked!', { 
                  name: subCategoryForm.name, 
                  categoryId: subCategoryForm.categoryId,
                  formData: subCategoryForm
                })
                handleCreateSubCategory()
              }} 
              disabled={!subCategoryForm.name?.trim() || !subCategoryForm.categoryId}
              className="min-w-[140px]"
            >
              Create Subcategory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubCategoryOpen} onOpenChange={setIsEditSubCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update the subcategory details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="edit-subcategory-description">Description</Label>
              <Input
                id="edit-subcategory-description"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                placeholder="Enter subcategory description"
              />
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
            <Button onClick={handleUpdateSubCategory} disabled={!subCategoryForm.name?.trim()}>
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
              This will permanently delete the {deleteTarget?.type} "{deleteTarget?.name}" and all its associated data.
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

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg 
                  className="w-6 h-6 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>
            <DialogTitle className="text-xl text-green-700">
              {successMessage?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {successMessage?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => setSuccessDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
            >
              Great!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}