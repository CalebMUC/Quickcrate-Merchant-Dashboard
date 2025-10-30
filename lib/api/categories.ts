import { apiClient } from './client'
import { toast } from 'sonner'

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
  subCategoryId?: string // Primary identifier in database
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
  subSubCategoryId?: string // Primary identifier in database
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
          
          // Show success toast
          toast.success("Category Created Successfully!", {
            description: `${response.data.name} has been created successfully.`
          })
          
          return response.data
        } else {
          console.error('❌ CategoriesService: API returned unsuccessful response:', response)
          throw new Error(response.message || 'Failed to create category')
        }
      }
      
      // Handle direct response (legacy format)
      console.log('✅ CategoriesService: Category created successfully (legacy format):', response.id)
      
      // Show success toast
      toast.success("Category Created Successfully!", {
        description: `${response.name} has been created successfully.`
      })
      
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
      // Validate input parameters
      if (!id || typeof id !== 'string') {
        throw new Error('Category ID is required and must be a valid string')
      }

      if (!categoryData || typeof categoryData !== 'object') {
        throw new Error('Category data is required')
      }

      console.log('✏️ CategoriesService: Updating category:', id)
      console.log('📝 CategoriesService: Original update data:', categoryData)
      
      // Generate or update slug if name is provided but slug is not
      if (categoryData.name && !categoryData.slug) {
        categoryData.slug = this.generateSlug(categoryData.name)
      }

      // Process the data for backend compatibility
      const processedData: UpdateCategoryDto = {
        ...categoryData
      }

      // Handle parentId: convert empty string to null, undefined to null
      if ('parentId' in processedData) {
        if (processedData.parentId === '' || processedData.parentId === undefined) {
          processedData.parentId = null
        }
      }

      // Ensure boolean values are properly set
      if ('isActive' in processedData && processedData.isActive !== undefined) {
        processedData.isActive = Boolean(processedData.isActive)
      }

      // Ensure sortOrder is a valid number
      if ('sortOrder' in processedData && processedData.sortOrder !== undefined) {
        processedData.sortOrder = Number(processedData.sortOrder) || 0
      }

      // Clean up any undefined values to prevent serialization issues
      Object.keys(processedData).forEach(key => {
        const typedKey = key as keyof UpdateCategoryDto
        if (processedData[typedKey] === undefined) {
          delete processedData[typedKey]
        }
      })
      
      console.log('🔄 CategoriesService: Processed update data:', processedData)
      
      // Make the API request using POST as required by backend
      const response = await apiClient.post<any>(`/Categories/${id}`, processedData)
      
      console.log('📦 CategoriesService: Raw update response:', response)
      
      // Handle different response structures from the API
      if (response && typeof response === 'object') {
        // Handle wrapped ApiResponse structure: { success: boolean, data: T, message?: string }
        if ('success' in response && 'data' in response) {
          if (response.success === true && response.data) {
            const categoryData = response.data
            console.log('✅ CategoriesService: Category updated successfully (wrapped response):', 
              categoryData.categoryId || categoryData.id || id)
            
            // Show success toast
            toast.success("Category Updated Successfully!", {
              description: `${categoryData.name} has been updated successfully.`
            })
            
            // Normalize the response to match our Category interface
            const normalizedCategory: Category = {
              id: categoryData.id || categoryData.categoryId || id,
              categoryId: categoryData.categoryId || categoryData.id,
              name: categoryData.name,
              description: categoryData.description || '',
              slug: categoryData.slug,
              isActive: categoryData.isActive ?? true,
              sortOrder: categoryData.sortOrder || 0,
              merchantId: categoryData.merchantId,
              parentId: categoryData.parentId || undefined,
              imageUrl: categoryData.imageUrl || undefined,
              metaTitle: categoryData.metaTitle || undefined,
              metaDescription: categoryData.metaDescription || undefined,
              productCount: categoryData.productCount || 0,
              subcategories: categoryData.subcategories || [],
              createdOn: categoryData.createdOn || new Date().toISOString(),
              updatedOn: categoryData.updatedOn || new Date().toISOString(),
              createdBy: categoryData.createdBy || '',
              updatedBy: categoryData.updatedBy || ''
            }
            
            return normalizedCategory
          } else {
            // API returned wrapped response but with success: false
            const errorMessage = response.message || 'Failed to update category'
            console.error('❌ CategoriesService: API returned unsuccessful response:', response)
            throw new Error(errorMessage)
          }
        }
        
        // Handle direct Category object response (legacy format)
        else if (response.id || response.categoryId || response.name) {
          console.log('✅ CategoriesService: Category updated successfully (direct response):', 
            response.id || response.categoryId || id)
          
          // Show success toast
          toast.success("Category Updated Successfully!", {
            description: `${response.name} has been updated successfully.`
          })
          
          // Normalize the direct response
          const normalizedCategory: Category = {
            id: response.id || response.categoryId || id,
            categoryId: response.categoryId || response.id,
            name: response.name,
            description: response.description || '',
            slug: response.slug,
            isActive: response.isActive ?? true,
            sortOrder: response.sortOrder || 0,
            merchantId: response.merchantId,
            parentId: response.parentId || undefined,
            imageUrl: response.imageUrl || undefined,
            metaTitle: response.metaTitle || undefined,
            metaDescription: response.metaDescription || undefined,
            productCount: response.productCount || 0,
            subcategories: response.subcategories || [],
            createdOn: response.createdOn || new Date().toISOString(),
            updatedOn: response.updatedOn || new Date().toISOString(),
            createdBy: response.createdBy || '',
            updatedBy: response.updatedBy || ''
          }
          
          return normalizedCategory
        }
        
        // Unexpected response structure
        else {
          console.error('❌ CategoriesService: Unexpected response structure:', response)
          throw new Error('Unexpected response format from server')
        }
      }
      
      // Response is not an object or is null/undefined
      else {
        console.error('❌ CategoriesService: Invalid response from server:', response)
        throw new Error('Invalid response from server')
      }
      
    } catch (error) {
      console.error('💥 CategoriesService: Error updating category:', error)
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('💥 Error name:', error.name)
        console.error('💥 Error message:', error.message)
        console.error('💥 Error stack:', error.stack)
      }
      
      // Handle ApiError specifically
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ApiError') {
        const apiError = error as any
        console.error('💥 API Error Details:', {
          code: apiError.code,
          message: apiError.message,
          response: apiError.response
        })
        
        // Provide more user-friendly error messages based on status codes
        if (apiError.code === '400') {
          throw new Error('Invalid category data provided. Please check all required fields.')
        } else if (apiError.code === '401') {
          throw new Error('Authentication failed. Please log in again.')
        } else if (apiError.code === '403') {
          throw new Error('You do not have permission to update this category.')
        } else if (apiError.code === '404') {
          throw new Error('Category not found. It may have been deleted.')
        } else if (apiError.code === '409') {
          throw new Error('Category name or slug already exists. Please choose a different name.')
        } else if (apiError.code === '422') {
          throw new Error('Invalid category data. Please check the format of all fields.')
        } else if (apiError.code >= '500') {
          throw new Error('Server error occurred. Please try again later.')
        }
      }
      
      // Re-throw the original error if we can't provide a better message
      throw error
    }
  },

  // Delete category (soft delete)
  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      console.log('🗑️ CategoriesService: Deleting category:', id)
      
      const response = await apiClient.delete<{ message: string }>(`/Categories/${id}`)
      
      console.log('✅ CategoriesService: Category deleted successfully:', id)
      
      // Show success toast
      toast.success("Category Deleted Successfully!", {
        description: "The category has been removed successfully."
      })
      
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
      console.log('📝 CategoriesService: Subcategory data:', subCategoryData)
      
      if (!subCategoryData.slug) {
        subCategoryData.slug = this.generateSlug(subCategoryData.name)
      }
      
      // Use the correct endpoint pattern from backend: /Categories/{categoryId}/subcategories
      const response = await apiClient.post<any>(`/Categories/${subCategoryData.categoryId}/subcategories`, subCategoryData)
      
      console.log('✅ CategoriesService: Raw subcategory create response:', response)
      
      // Handle wrapped API response structure
      if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
        if (response.success && response.data) {
          console.log('✅ CategoriesService: Subcategory created successfully:', response.data.id)
          
          // Show success toast
          toast.success("Subcategory Created Successfully!", {
            description: `${response.data.name} has been created successfully.`
          })
          
          return response.data
        } else {
          console.error('❌ CategoriesService: API returned unsuccessful response:', response)
          throw new Error(response.message || 'Failed to create subcategory')
        }
      }
      
      // Handle direct response (legacy format)
      console.log('✅ CategoriesService: Subcategory created successfully (legacy format):', response.id)
      
      // Show success toast
      toast.success("Subcategory Created Successfully!", {
        description: `${response.name} has been created successfully.`
      })
      
      return response
    } catch (error) {
      console.error('💥 CategoriesService: Error creating subcategory:', error)
      throw error
    }
  },

  // Update subcategory
  async updateSubCategory(id: string, subCategoryData: UpdateSubCategoryDto): Promise<SubCategory> {
    try {
      // Validate input parameters
      if (!id || typeof id !== 'string') {
        throw new Error('Subcategory ID is required and must be a valid string')
      }

      if (!subCategoryData || typeof subCategoryData !== 'object') {
        throw new Error('Subcategory data is required')
      }

      // Validate that categoryId is provided in the data
      if (!subCategoryData.categoryId) {
        throw new Error('Category ID is required for updating subcategory')
      }

      console.log('✏️ CategoriesService: Updating subcategory:', id)
      console.log('📝 CategoriesService: Original subcategory update data:', subCategoryData)
      
      // Generate or update slug if name is provided but slug is not
      if (subCategoryData.name && !subCategoryData.slug) {
        subCategoryData.slug = this.generateSlug(subCategoryData.name)
      }

      // Process the data for backend compatibility
      const processedData: UpdateSubCategoryDto = {
        ...subCategoryData
      }

      // Ensure boolean values are properly set
      if ('isActive' in processedData && processedData.isActive !== undefined) {
        processedData.isActive = Boolean(processedData.isActive)
      }

      // Ensure sortOrder is a valid number
      if ('sortOrder' in processedData && processedData.sortOrder !== undefined) {
        processedData.sortOrder = Number(processedData.sortOrder) || 0
      }

      // Clean up any undefined values to prevent serialization issues
      Object.keys(processedData).forEach(key => {
        const typedKey = key as keyof UpdateSubCategoryDto
        if (processedData[typedKey] === undefined) {
          delete processedData[typedKey]
        }
      })
      
      console.log('🔄 CategoriesService: Processed subcategory update data:', processedData)
      
      // Use the correct backend endpoint: PUT /Categories/{categoryId}/subcategories/{subCategoryId}
      const response = await apiClient.put<any>(`/Categories/${subCategoryData.categoryId}/subcategories/${id}`, processedData)
      
      console.log('📦 CategoriesService: Raw subcategory update response:', response)
      
      // Handle different response structures from the API
      if (response && typeof response === 'object') {
        // Handle wrapped ApiResponse structure: { success: boolean, data: T, message?: string }
        if ('success' in response && 'data' in response) {
          if (response.success === true && response.data) {
            const subCategoryData = response.data
            console.log('✅ CategoriesService: Subcategory updated successfully (wrapped response):', 
              subCategoryData.subCategoryId || subCategoryData.id || id)
            
            // Show success toast
            toast.success("Subcategory Updated Successfully!", {
              description: `${subCategoryData.name} has been updated successfully.`
            })
            
            // Normalize the response to match our SubCategory interface
            const normalizedSubCategory: SubCategory = {
              id: subCategoryData.id || subCategoryData.subCategoryId || id,
              subCategoryId: subCategoryData.subCategoryId || subCategoryData.id,
              name: subCategoryData.name,
              description: subCategoryData.description || '',
              slug: subCategoryData.slug,
              isActive: subCategoryData.isActive ?? true,
              sortOrder: subCategoryData.sortOrder || 0,
              categoryId: subCategoryData.categoryId,
              merchantId: subCategoryData.merchantId,
              imageUrl: subCategoryData.imageUrl || undefined,
              productCount: subCategoryData.productCount || 0,
              subSubCategories: subCategoryData.subSubCategories || [],
              createdOn: subCategoryData.createdOn || new Date().toISOString(),
              updatedOn: subCategoryData.updatedOn || new Date().toISOString(),
              createdBy: subCategoryData.createdBy || '',
              updatedBy: subCategoryData.updatedBy || ''
            }
            
            return normalizedSubCategory
          } else {
            // API returned wrapped response but with success: false
            const errorMessage = response.message || 'Failed to update subcategory'
            console.error('❌ CategoriesService: API returned unsuccessful response:', response)
            throw new Error(errorMessage)
          }
        }
        
        // Handle direct SubCategory object response (legacy format)
        else if (response.id || response.subCategoryId || response.name) {
          console.log('✅ CategoriesService: Subcategory updated successfully (direct response):', 
            response.id || response.subCategoryId || id)
          
          // Show success toast
          toast.success("Subcategory Updated Successfully!", {
            description: `${response.name} has been updated successfully.`
          })
          
          // Normalize the direct response
          const normalizedSubCategory: SubCategory = {
            id: response.id || response.subCategoryId || id,
            subCategoryId: response.subCategoryId || response.id,
            name: response.name,
            description: response.description || '',
            slug: response.slug,
            isActive: response.isActive ?? true,
            sortOrder: response.sortOrder || 0,
            categoryId: response.categoryId || subCategoryData.categoryId,
            merchantId: response.merchantId,
            imageUrl: response.imageUrl || undefined,
            productCount: response.productCount || 0,
            subSubCategories: response.subSubCategories || [],
            createdOn: response.createdOn || new Date().toISOString(),
            updatedOn: response.updatedOn || new Date().toISOString(),
            createdBy: response.createdBy || '',
            updatedBy: response.updatedBy || ''
          }
          
          return normalizedSubCategory
        }
        
        // Unexpected response structure
        else {
          console.error('❌ CategoriesService: Unexpected response structure:', response)
          throw new Error('Unexpected response format from server')
        }
      }
      
      // Response is not an object or is null/undefined
      else {
        console.error('❌ CategoriesService: Invalid response from server:', response)
        throw new Error('Invalid response from server')
      }
      
    } catch (error) {
      console.error('💥 CategoriesService: Error updating subcategory:', error)
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('💥 Error name:', error.name)
        console.error('💥 Error message:', error.message)
        console.error('💥 Error stack:', error.stack)
      }
      
      // Handle ApiError specifically
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ApiError') {
        const apiError = error as any
        console.error('💥 API Error Details:', {
          code: apiError.code,
          message: apiError.message,
          response: apiError.response
        })
        
        // Provide more user-friendly error messages based on status codes
        if (apiError.code === '400') {
          throw new Error('Invalid subcategory data provided. Please check all required fields.')
        } else if (apiError.code === '401') {
          throw new Error('Authentication failed. Please log in again.')
        } else if (apiError.code === '403') {
          throw new Error('You do not have permission to update this subcategory.')
        } else if (apiError.code === '404') {
          throw new Error('Subcategory not found. It may have been deleted.')
        } else if (apiError.code === '409') {
          throw new Error('Subcategory name or slug already exists. Please choose a different name.')
        } else if (apiError.code === '422') {
          throw new Error('Invalid subcategory data. Please check the format of all fields.')
        } else if (apiError.code >= '500') {
          throw new Error('Server error occurred. Please try again later.')
        }
      }
      
      // Re-throw the original error if we can't provide a better message
      throw error
    }
  },

  // Delete subcategory
  async deleteSubCategory(id: string): Promise<{ message: string }> {
    try {
      console.log('🗑️ CategoriesService: Deleting subcategory:', id)
      
      const response = await apiClient.delete<{ message: string }>(`/SubCategories/${id}`)
      
      console.log('✅ CategoriesService: Subcategory deleted successfully:', id)
      
      // Show success toast
      toast.success("Subcategory Deleted Successfully!", {
        description: "The subcategory has been removed successfully."
      })
      
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
      
      // Show success toast
      toast.success("Sub-subcategory Created Successfully!", {
        description: `${response.name} has been created successfully.`
      })
      
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
      
      // Show success toast
      toast.success("Sub-subcategory Updated Successfully!", {
        description: `${response.name} has been updated successfully.`
      })
      
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
      
      // Show success toast
      toast.success("Sub-subcategory Deleted Successfully!", {
        description: "The sub-subcategory has been removed successfully."
      })
      
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