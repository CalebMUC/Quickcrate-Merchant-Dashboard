import { apiClient } from './client';
import { Product, ProductCreateRequest, PaginatedResponse, ApiResponse } from '@/types';

export interface ProductFormData {
  productName: string;
  description: string;
  productDescription: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  subSubCategoryId?: number;
  subSubCategoryName?: string;
  productType?: string;
  keyFeatures: string;
  specification: string;
  box: string;
  searchKeyWord: string;
  discount: number;
  inStock: boolean;
  imageType: string;
  isSaved: boolean;
}

export interface CreateProductResponse {
  success: boolean;
  data?: {
    productId: string;
    productName: string;
    message: string;
  };
  message: string;
  errors?: string[];
}

export interface ProductImageUpload {
  file: File;
  id: string;
  preview: string;
}

export const productsService = {
  // Create a new product with images
  async createProduct(
    productData: ProductFormData,
    images: ProductImageUpload[]
  ): Promise<CreateProductResponse> {
    try {
      console.log('🛍️ ProductService: Creating product with data:', productData);
      console.log('🖼️ ProductService: Images count:', images.length);

      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add product data
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add system fields
      formData.append('createdOn', new Date().toISOString());
      formData.append('createdBy', 'current-user'); // TODO: Get from auth context
      formData.append('imageUrl', '[]'); // Will be populated by backend

      // Add images
      images.forEach((image, index) => {
        formData.append('productImages', image.file);
        console.log(`📸 Adding image ${index + 1}: ${image.file.name} (${(image.file.size / 1024 / 1024).toFixed(2)} MB)`);
      });

      console.log('🚀 ProductService: Sending request to /Products/create');

      // Send to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Products/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ ProductService: Product created successfully:', result);
      
      return result;
    } catch (error) {
      console.error('💥 ProductService: Error creating product:', error);
      throw error;
    }
  },

  // Validate image file
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Maximum size is 10MB.'
      };
    }

    return { valid: true };
  },

  // Get all products with pagination and filters
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<Product>>(`/Products${query}`);
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/Products/${id}`);
  },

  // Update product
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return apiClient.put<Product>(`/Products/${id}`, productData);
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/Products/${id}`);
  },

  // Get products pending approval
  async getPendingProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/Products/pending');
  },

  // Approve product
  async approveProduct(id: string): Promise<Product> {
    return apiClient.post<Product>(`/Products/${id}/approve`);
  },

  // Reject product
  async rejectProduct(id: string, reason?: string): Promise<Product> {
    return apiClient.post<Product>(`/Products/${id}/reject`, { reason });
  },

  // Upload product images
  async uploadProductImages(productId: string, files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return apiClient.uploadFile<{ urls: string[] }>(`/Products/${productId}/images`, files[0], {
      productId,
    });
  },

  // Get categories
  async getCategories(): Promise<{ id: string; name: string; productCount: number }[]> {
    return apiClient.get<{ id: string; name: string; productCount: number }[]>('/Products/categories');
  },

  // Update inventory
  async updateInventory(id: string, stock: number): Promise<Product> {
    return apiClient.patch<Product>(`/Products/${id}/inventory`, { stock });
  },
};