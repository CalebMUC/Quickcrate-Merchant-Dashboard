import { apiClient } from './client'

// Category Type Definitions
export interface Category {
  id: string // Changed from number to string for GUID support
  categoryId?: string // Alternative field name for API compatibility
  name: string
  description?: string
  slug: string
  isActive: boolean
  sortOrder: number
  merchantId: string // Changed from number to string for GUID support
  parentId?: string // Changed from number to string for GUID support
  imageUrl?: string
  metaTitle?: string
  metaDescription?: string
  productCount: number
  subcategories?: SubCategory[]
  createdOn: string
  updatedOn?: string
  createdBy: string
  updatedBy?: string
}

export interface SubCategory {
  id: string // Changed to string for GUID support
  name: string
  description?: string
  slug: string
  isActive: boolean
  sortOrder: number
  categoryId: string // Changed to string for GUID support
  merchantId: string // Changed to string for GUID support
  imageUrl?: string
  productCount: number
  subSubCategories?: SubSubCategory[]
  createdOn: string
  updatedOn?: string
  createdBy: string
  updatedBy?: string
}

export interface SubSubCategory {
  id: string // Changed to string for GUID support
  name: string
  description?: string
  slug: string
  isActive: boolean
  sortOrder: number
  subCategoryId: string // Changed to string for GUID support
  merchantId: string // Changed to string for GUID support
  imageUrl?: string
  productCount: number
  createdOn: string
  updatedOn?: string
  createdBy: string
  updatedBy?: string
}

// Request DTOs
export interface CreateCategoryDto {
  name: string
  description?: string
  slug?: string
  isActive?: boolean
  sortOrder?: number
  parentId?: string | null // Allow null for no parent
  imageUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  slug?: string
  isActive?: boolean
  sortOrder?: number
  parentId?: string | null // Allow null for no parent
  imageUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export interface CreateSubCategoryDto {
  name: string
  description?: string
  slug?: string
  isActive?: boolean
  sortOrder?: number
  categoryId: string // Changed to string for GUID support
  imageUrl?: string
}

export interface UpdateSubCategoryDto {
  name?: string
  description?: string
  slug?: string
  isActive?: boolean
  sortOrder?: number
  categoryId?: string // Changed to string for GUID support
  imageUrl?: string
}

export interface CreateSubSubCategoryDto {
  name: string
  description?: string
  slug?: string
  isActive?: boolean
  sortOrder?: number
  subCategoryId: string // Changed to string for GUID support
  imageUrl?: string
}

export interface UpdateSubSubCategoryDto {
  name?: string
  description?: string
  slug?: string
  isActive?: boolean
  sortOrder?: number
  subCategoryId?: string // Changed to string for GUID support
  imageUrl?: string
}

// Response Types
export interface CategoriesResponse {
  categories: Category[]
  totalCount: number
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
  level: number
}

// Filter and Pagination
export interface CategoryFilter {
  search?: string
  isActive?: boolean
  parentId?: string // Changed to string for GUID support
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Categories Service
export const categoriesService = {
  // =====================================
  // CATEGORIES CRUD OPERATIONS
  // =====================================

  // Get all categories with hierarchy
  async getCategories(filter?: CategoryFilter): Promise<any> {
    try {
      console.log('📂 CategoriesService: Fetching categories with filter:', filter)
      
      const queryParams = new URLSearchParams()
      if (filter?.search) queryParams.append('search', filter.search)
      if (filter?.isActive !== undefined) queryParams.append('isActive', filter.isActive.toString())
      if (filter?.parentId) queryParams.append('parentId', filter.parentId.toString())
      if (filter?.page) queryParams.append('page', filter.page.toString())
      if (filter?.pageSize) queryParams.append('pageSize', filter.pageSize.toString())
      if (filter?.sortBy) queryParams.append('sortBy', filter.sortBy)
      if (filter?.sortOrder) queryParams.append('sortOrder', filter.sortOrder)

      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await apiClient.get<any>(`/Categories${query}`)
      
      console.log('✅ CategoriesService: Raw response:', response)
      
      // Handle wrapped API response structure
      if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        if (response.success && response.data) {
          // Handle paginated response with items array
          if (response.data.items && Array.isArray(response.data.items)) {
            return {
              categories: response.data.items,
              totalCount: response.data.totalCount || response.data.items.length,
              page: response.data.page || 1,
              pageSize: response.data.pageSize || response.data.items.length,
              totalPages: response.data.totalPages || 1
            }
          }
          // If data is a single category, convert to categories array format
          if (response.data.categoryId || response.data.id) {
            return {
              categories: [response.data],
              totalCount: 1
            }
          }
          // If data is already in expected format with categories array
          if (response.data.categories) {
            return response.data
          }
          // If data is an array
          if (Array.isArray(response.data)) {
            return {
              categories: response.data,
              totalCount: response.data.length
            }
          }
        }
      }
      
      // Return original response if it's already in expected format
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error fetching categories:', error)
      throw error
    }
  },

  // Get category tree (hierarchical structure)
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    try {
      console.log('🌲 CategoriesService: Fetching category tree')
      
      const response = await apiClient.get<CategoryTreeNode[]>('/Categories/tree')
      
      console.log('✅ CategoriesService: Category tree fetched successfully')
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error fetching category tree:', error)
      throw error
    }
  },

  // Get single category by ID
  async getCategory(id: string): Promise<Category> {
    try {
      console.log('📂 CategoriesService: Fetching category:', id)
      
      const response = await apiClient.get<Category>(`/Categories/${id}`)
      
      console.log('✅ CategoriesService: Category fetched successfully:', response.name)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error fetching category:', error)
      throw error
    }
  },

  // Create new category
  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    try {
      console.log('➕ CategoriesService: Creating category:', categoryData.name)
      console.log('📝 CategoriesService: Original category data:', categoryData)
      
      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = this.generateSlug(categoryData.name)
      }

      // Convert empty string parentId to null for proper backend handling
      const processedData = {
        ...categoryData,
        parentId: categoryData.parentId === "" ? null : categoryData.parentId
      }
      
      console.log('🔄 CategoriesService: Processed category data:', processedData)
      
      const response = await apiClient.post<any>('/Categories', processedData)
      
      console.log('📦 CategoriesService: Raw create response:', response)
      
      // Handle wrapped API response structure
      if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        if (response.success && response.data) {
          console.log('✅ CategoriesService: Category created successfully:', response.data.categoryId || response.data.id)
          return response.data
        } else {
          console.error('❌ CategoriesService: API returned unsuccessful response:', response)
          throw new Error(response.message || 'Failed to create category')
        }
      }
      
      // Handle direct response (legacy format)
      console.log('✅ CategoriesService: Category created successfully (legacy format):', response.id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error creating category:', error)
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('💥 Error message:', error.message)
        console.error('💥 Error stack:', error.stack)
      }
      
      // If it's an ApiError, extract response details
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any
        console.error('💥 API error details:', {
          code: apiError.code,
          response: apiError.response,
          message: apiError.message
        })
      }
      
      throw error
    }
  },

  // Update category
  async updateCategory(id: string, categoryData: UpdateCategoryDto): Promise<Category> {
    try {
      console.log('✏️ CategoriesService: Updating category:', id)
      
      // Update slug if name is changed
      if (categoryData.name && !categoryData.slug) {
        categoryData.slug = this.generateSlug(categoryData.name)
      }
      
      const response = await apiClient.put<Category>(`/Categories/${id}`, categoryData)
      
      console.log('✅ CategoriesService: Category updated successfully:', id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error updating category:', error)
      throw error
    }
  },

  // Delete category (soft delete)
  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      console.log('🗑️ CategoriesService: Deleting category:', id)
      
      const response = await apiClient.delete<{ message: string }>(`/Categories/${id}`)
      
      console.log('✅ CategoriesService: Category deleted successfully:', id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error deleting category:', error)
      throw error
    }
  },

  // =====================================
  // SUBCATEGORIES CRUD OPERATIONS
  // =====================================

  // Get subcategories for a category
  async getSubCategories(categoryId: number | string): Promise<SubCategory[]> {
    try {
      console.log('📂 CategoriesService: Fetching subcategories for category:', categoryId)
      
      const response = await apiClient.get<any>(`/Categories/${categoryId}/subcategories`)
      
      console.log('✅ CategoriesService: Raw subcategories response:', response)
      
      // Handle wrapped API response structure
      if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        if (response.success && response.data) {
          const subcategories = Array.isArray(response.data) ? response.data : []
          console.log('✅ CategoriesService: Subcategories fetched successfully:', subcategories.length)
          return subcategories
        }
      }
      
      // Handle direct array response
      if (Array.isArray(response)) {
        console.log('✅ CategoriesService: Subcategories fetched successfully:', response.length)
        return response
      }
      
      console.log('⚠️ CategoriesService: No subcategories found')
      return []
    } catch (error) {
      console.error('💥 CategoriesService: Error fetching subcategories:', error)
      return [] // Return empty array instead of throwing to prevent breaking the UI
    }
  },

  // Create subcategory
  async createSubCategory(subCategoryData: CreateSubCategoryDto): Promise<SubCategory> {
    try {
      console.log('➕ CategoriesService: Creating subcategory:', subCategoryData.name)
      
      if (!subCategoryData.slug) {
        subCategoryData.slug = this.generateSlug(subCategoryData.name)
      }
      
      const response = await apiClient.post<SubCategory>('/SubCategories', subCategoryData)
      
      console.log('✅ CategoriesService: Subcategory created successfully:', response.id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error creating subcategory:', error)
      throw error
    }
  },

  // Update subcategory
  async updateSubCategory(id: string, subCategoryData: UpdateSubCategoryDto): Promise<SubCategory> {
    try {
      console.log('✏️ CategoriesService: Updating subcategory:', id)
      
      if (subCategoryData.name && !subCategoryData.slug) {
        subCategoryData.slug = this.generateSlug(subCategoryData.name)
      }
      
      const response = await apiClient.put<SubCategory>(`/SubCategories/${id}`, subCategoryData)
      
      console.log('✅ CategoriesService: Subcategory updated successfully:', id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error updating subcategory:', error)
      throw error
    }
  },

  // Delete subcategory
  async deleteSubCategory(id: string): Promise<{ message: string }> {
    try {
      console.log('🗑️ CategoriesService: Deleting subcategory:', id)
      
      const response = await apiClient.delete<{ message: string }>(`/SubCategories/${id}`)
      
      console.log('✅ CategoriesService: Subcategory deleted successfully:', id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error deleting subcategory:', error)
      throw error
    }
  },

  // =====================================
  // SUB-SUBCATEGORIES CRUD OPERATIONS
  // =====================================

  // Get sub-subcategories for a subcategory
  async getSubSubCategories(subCategoryId: number | string): Promise<SubSubCategory[]> {
    try {
      console.log('📂 CategoriesService: Fetching sub-subcategories for subcategory:', subCategoryId)
      
      const response = await apiClient.get<any>(`/SubCategories/${subCategoryId}/subsubcategories`)
      
      console.log('✅ CategoriesService: Raw sub-subcategories response:', response)
      
      // Handle wrapped API response structure
      if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        if (response.success && response.data) {
          const subSubCategories = Array.isArray(response.data) ? response.data : []
          console.log('✅ CategoriesService: Sub-subcategories fetched successfully:', subSubCategories.length)
          return subSubCategories
        }
      }
      
      // Handle direct array response
      if (Array.isArray(response)) {
        console.log('✅ CategoriesService: Sub-subcategories fetched successfully:', response.length)
        return response
      }
      
      console.log('⚠️ CategoriesService: No sub-subcategories found')
      return []
    } catch (error) {
      console.error('💥 CategoriesService: Error fetching sub-subcategories:', error)
      return [] // Return empty array instead of throwing to prevent breaking the UI
    }
  },

  // Create sub-subcategory
  async createSubSubCategory(subSubCategoryData: CreateSubSubCategoryDto): Promise<SubSubCategory> {
    try {
      console.log('➕ CategoriesService: Creating sub-subcategory:', subSubCategoryData.name)
      
      if (!subSubCategoryData.slug) {
        subSubCategoryData.slug = this.generateSlug(subSubCategoryData.name)
      }
      
      const response = await apiClient.post<SubSubCategory>('/SubSubCategories', subSubCategoryData)
      
      console.log('✅ CategoriesService: Sub-subcategory created successfully:', response.id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error creating sub-subcategory:', error)
      throw error
    }
  },

  // Update sub-subcategory
  async updateSubSubCategory(id: string, subSubCategoryData: UpdateSubSubCategoryDto): Promise<SubSubCategory> {
    try {
      console.log('✏️ CategoriesService: Updating sub-subcategory:', id)
      
      if (subSubCategoryData.name && !subSubCategoryData.slug) {
        subSubCategoryData.slug = this.generateSlug(subSubCategoryData.name)
      }
      
      const response = await apiClient.put<SubSubCategory>(`/SubSubCategories/${id}`, subSubCategoryData)
      
      console.log('✅ CategoriesService: Sub-subcategory updated successfully:', id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error updating sub-subcategory:', error)
      throw error
    }
  },

  // Delete sub-subcategory
  async deleteSubSubCategory(id: string): Promise<{ message: string }> {
    try {
      console.log('🗑️ CategoriesService: Deleting sub-subcategory:', id)
      
      const response = await apiClient.delete<{ message: string }>(`/SubSubCategories/${id}`)
      
      console.log('✅ CategoriesService: Sub-subcategory deleted successfully:', id)
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error deleting sub-subcategory:', error)
      throw error
    }
  },

  // =====================================
  // UTILITY FUNCTIONS
  // =====================================

  // Generate URL-friendly slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim() // Remove leading/trailing spaces
  },

  // Validate category hierarchy (prevent circular references)
  async validateCategoryHierarchy(categoryId: string, parentId?: string): Promise<boolean> {
    if (!parentId) return true
    
    try {
      // Check if parent is a descendant of the current category
      const categoryTree = await this.getCategoryTree()
      
      const findInTree = (nodes: CategoryTreeNode[], searchId: string, ancestorId: string): boolean => {
        for (const node of nodes) {
          if (node.id === searchId) {
            return node.id === ancestorId || findInTree(node.children, node.id, ancestorId)
          }
          if (findInTree(node.children, searchId, ancestorId)) {
            return true
          }
        }
        return false
      }
      
      return !findInTree(categoryTree, parentId, categoryId)
    } catch (error) {
      console.error('💥 CategoriesService: Error validating hierarchy:', error)
      return false
    }
  },

  // Reorder categories
  async reorderCategories(categoryOrders: { id: string; sortOrder: number }[]): Promise<void> {
    try {
      console.log('🔄 CategoriesService: Reordering categories:', categoryOrders.length)
      
      await apiClient.post('/Categories/reorder', { categoryOrders })
      
      console.log('✅ CategoriesService: Categories reordered successfully')
    } catch (error) {
      console.error('💥 CategoriesService: Error reordering categories:', error)
      throw error
    }
  },

  // Bulk operations
  async bulkUpdateCategories(updates: { id: string; data: UpdateCategoryDto }[]): Promise<Category[]> {
    try {
      console.log('📦 CategoriesService: Bulk updating categories:', updates.length)
      
      const response = await apiClient.post<Category[]>('/Categories/bulk-update', { updates })
      
      console.log('✅ CategoriesService: Categories bulk updated successfully')
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error bulk updating categories:', error)
      throw error
    }
  },

  // Get category statistics
  async getCategoryStats(): Promise<{
    totalCategories: number
    totalSubCategories: number
    totalSubSubCategories: number
    activeCategories: number
    inactiveCategories: number
  }> {
    try {
      console.log('📊 CategoriesService: Fetching category statistics')
      
      const response = await apiClient.get<{
        totalCategories: number
        totalSubCategories: number
        totalSubSubCategories: number
        activeCategories: number
        inactiveCategories: number
      }>('/Categories/stats')
      
      console.log('✅ CategoriesService: Category stats fetched successfully')
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error fetching category stats:', error)
      throw error
    }
  }
}