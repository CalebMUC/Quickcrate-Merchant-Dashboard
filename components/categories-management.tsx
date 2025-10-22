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
    categoryId: "",
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
            const subcategories = await categoriesService.getSubCategories(category.id)
            
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
      const newSubCategory = await categoriesService.createSubCategory(subCategoryForm as CreateSubCategoryDto)
      
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
      categoryId: "",
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
      categoryId: subCategory.categoryId,
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
    setSubCategoryForm({
      ...subCategoryForm,
      categoryId
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                <Tag className="h-5 w-5 text-white" />
              </div>
              {/* <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Categories Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Organize your products with a comprehensive category hierarchy
                </p>
              </div> */}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="hover:bg-muted/80 transition-colors"
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
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

      {/* Search and Filters Section */}
      {/* <Card className="shadow-sm border-0 bg-muted/30">
         <CardContent className="p-4"> */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-background/50 border-muted focus:bg-background transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              variant="secondary" 
              size="sm"
              className="sm:w-auto w-full h-9"
            >
              Search
            </Button>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm('')} 
                variant="ghost" 
                size="sm"
                className="sm:w-auto w-full h-9 text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        {/* </CardContent>
      </Card>  */}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      {!loading && filteredCategories.length > 0 && (
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-card to-card/80 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Categories
                  </span>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {filteredCategories.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your product categories and their hierarchy
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>{filteredCategories.filter(cat => cat.isActive).length} active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span>{filteredCategories.filter(cat => !cat.isActive).length} inactive</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                    <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors border-b border-border/40">
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
                            onClick={() => openAddSubCategory(category.id)}
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
                                onClick={() => openAddSubCategory(category.id)}
                                className="cursor-pointer hover:bg-green-50 focus:bg-green-50"
                              >
                                <Plus className="h-4 w-4 mr-2 text-green-600" />
                                <span>Add Subcategory</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => confirmDelete('category', category.id, category.name)}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="text-center py-16">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-muted rounded-full p-6 mb-6">
                <Tag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No categories match your search' : 'No categories found'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm 
                  ? `No categories match "${searchTerm}". Try adjusting your search terms.`
                  : 'Get started by creating your first product category to organize your inventory.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                )}
                <Button onClick={() => setIsAddCategoryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {searchTerm ? 'Add Category' : 'Add First Category'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <SelectItem key={cat.id} value={cat.id}>
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
                      {categories.filter(cat => cat.id !== editingCategory?.id).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
            <DialogDescription>
              Create a new subcategory under the selected category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="subcategory-description">Description</Label>
              <Input
                id="subcategory-description"
                value={subCategoryForm.description}
                onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                placeholder="Enter subcategory description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsAddSubCategoryOpen(false)
              resetSubCategoryForm()
              setSelectedCategoryForSub(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubCategory} disabled={!subCategoryForm.name?.trim()}>
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
      </div>
    </div>
  )
}