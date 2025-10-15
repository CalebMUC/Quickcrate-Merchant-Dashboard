import { apiClient } from './client';
import { mockApiService } from './mock';
import { Product, ProductCreateRequest, PaginatedResponse, ApiResponse } from '@/types';

const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export const productsService = {
  // Get all products with pagination and filters
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    if (USE_MOCK_API) {
      return await mockApiService.getProducts(params);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<Product>>(`/products${query}`);
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  // Create new product
  async createProduct(productData: ProductCreateRequest): Promise<Product> {
    return apiClient.post<Product>('/products', productData);
  },

  // Update product
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, productData);
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/products/${id}`);
  },

  // Get products pending approval
  async getPendingProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/products/pending');
  },

  // Approve product
  async approveProduct(id: string): Promise<Product> {
    return apiClient.post<Product>(`/products/${id}/approve`);
  },

  // Reject product
  async rejectProduct(id: string, reason?: string): Promise<Product> {
    return apiClient.post<Product>(`/products/${id}/reject`, { reason });
  },

  // Upload product images
  async uploadProductImages(productId: string, files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    return apiClient.uploadFile<{ urls: string[] }>(`/products/${productId}/images`, files[0], {
      productId,
    });
  },

  // Get categories
  async getCategories(): Promise<{ id: string; name: string; productCount: number }[]> {
    return apiClient.get<{ id: string; name: string; productCount: number }[]>('/products/categories');
  },

  // Update inventory
  async updateInventory(id: string, stock: number): Promise<Product> {
    return apiClient.patch<Product>(`/products/${id}/inventory`, { stock });
  },
};