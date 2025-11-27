import { apiClient } from './client';
import { Product, ProductCreateRequest, PaginatedResponse, ApiResponse } from '@/types';

// Legacy interface - kept for backward compatibility
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

// New CreateProductDto interface - Frontend format (camelCase)
// Note: This gets converted to PascalCase when sent to backend
export interface CreateProductDto {
  productName: string;          // -> ProductName (Required)
  description: string;          // -> Description
  productDescription: string;   // -> ProductDescription
  price: number;               // -> Price (Required, > 0)
  discount: number;            // -> Discount (0-100)
  stockQuantity: number;       // -> StockQuantity (Required, >= 0)
  sku: string;                 // -> SKU
  categoryId: string;          // -> CategoryId (Required GUID)
  categoryName: string;        // -> CategoryName
  subCategoryId?: string | null;    // -> SubCategoryId (nullable GUID)
  subCategoryName?: string | null;  // -> SubCategoryName (nullable)
  subSubCategoryId?: string | null; // -> SubSubCategoryId (nullable GUID)
  subSubCategoryName?: string | null; // -> SubSubCategoryName (nullable)
  productSpecification: string;     // -> ProductSpecification
  features: string;            // -> Features
  boxContents: string;         // -> BoxContents
  productType: string;         // -> ProductType
  isActive: boolean;           // -> IsActive (default: true)
  isFeatured: boolean;         // -> IsFeatured (default: false)
  status: string;              // -> Status (default: "pending")
  imageUrls: string[];         // -> ImageUrls (handled by backend)
  merchantID: string;          // -> MerchantID (Required GUID)
  searchKeywords?: string;     // -> Not in backend DTO (frontend only)
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

// UpdateProductDto interface - Frontend format (camelCase)
// Used for updating existing products
export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  categoryName: string;
  subcategoryName?: string;
  brand: string;
  sku: string;
  stockQuantity: number;
  weight?: number;
  dimensions?: string;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  imageUrls?: string[]; // Added for image updates
}

export interface ProductImageUpload {
  file: File;
  id: string;
  preview: string;
}

// Utility function to decode JWT and get user info
function getCurrentUserFromToken(): { merchantId?: string; userId?: string; role?: string } | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Decode JWT payload (base64)
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const payload = JSON.parse(atob(payloadBase64));
    
    return {
      merchantId: payload.MerchantId || payload.merchantId || payload.merchant_id,
      userId: payload.UserId || payload.userId || payload.user_id || payload.sub,
      role: payload.Role || payload.role || payload.roles
    };
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

export const productsService = {
  // Get current user info from JWT token
  getCurrentUser(): { merchantId?: string; userId?: string; role?: string } | null {
    return getCurrentUserFromToken();
  },

  // Debug method to check current authentication
  debugAuth(): void {
    const token = localStorage.getItem('token');
    console.log('🔐 Authentication Debug:');
    console.log('Token exists:', !!token);
    
    if (token) {
      const user = getCurrentUserFromToken();
      console.log('Decoded user info:', user);
      console.log('Token payload (raw):', token.split('.')[1] ? JSON.parse(atob(token.split('.')[1])) : 'Invalid token');
    }
  },

  // Upload a single image and get URL
  async uploadSingleImage(image: ProductImageUpload): Promise<string> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7270/api';
    
    console.log(`📸 Uploading image: ${image.file.name} (${(image.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const formData = new FormData();
    formData.append('file', image.file);

    const response = await fetch(`${apiUrl}/Upload/Documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`💥 Upload failed for ${image.file.name}:`, errorText);
      throw new Error(`Image upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Image uploaded successfully:`, result);
    
    // Handle both lowercase 'url' and uppercase 'Url' from backend
    const imageUrl = result.Url || result.url;
    
    if (!imageUrl) {
      console.error('❌ Upload response structure:', result);
      throw new Error('Upload response missing URL property (checked both "Url" and "url")');
    }

    return imageUrl;
  },

  // Upload multiple images with retry logic
  async uploadImages(images: ProductImageUpload[]): Promise<string[]> {
    console.log(`📸 Uploading ${images.length} images to AWS S3...`);

    const uploadPromises = images.map(async (image, index) => {
      let retries = 2;
      let lastError: any;

      while (retries >= 0) {
        try {
          const url = await this.uploadSingleImage(image);
          console.log(`✅ Image ${index + 1}/${images.length} uploaded: ${url}`);
          return url;
        } catch (error) {
          lastError = error;
          retries--;
          
          if (retries >= 0) {
            console.log(`⚠️ Retry ${2 - retries}/2 for image ${image.file.name}...`);
            // Wait 1 second before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error(`💥 Failed to upload image ${index + 1} (${image.file.name}) after 3 attempts:`, lastError);
            throw lastError;
          }
        }
      }

      throw lastError;
    });

    // Upload all images in parallel for better performance
    const urls = await Promise.all(uploadPromises);
    
    console.log('🎉 All images uploaded successfully. URLs:', urls);
    return urls;
  },

  // Create a new product with images - Two-step process: Upload images first, then create product
  async createProduct(
    productData: ProductFormData | CreateProductDto,
    images: ProductImageUpload[]
  ): Promise<CreateProductResponse> {
    
    try {
      console.log('🛍️ ProductService: Creating product with data:', productData);
      console.log('🖼️ ProductService: Images count:', images.length);

      // Step 1: Upload images first and get URLs
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await this.uploadImages(images);
      }

      // Detect if we're using the new CreateProductDto format
      const isNewFormat = 'merchantID' in productData && 'features' in productData;
      console.log(`📦 Using ${isNewFormat ? 'new CreateProductDto' : 'legacy ProductFormData'} format`);

      // Step 2: Create product with uploaded image URLs
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7270/api';
      const endpoint = `${apiUrl}/Product/Create`;
      
      let productPayload: any;

      if (isNewFormat) {
        const dto = productData as CreateProductDto;
        
        // Get current user's merchant ID from JWT token
        const currentUser = getCurrentUserFromToken();
        const merchantId = currentUser?.merchantId;
        
        if (!merchantId) {
          console.warn('⚠️ No MerchantId found in JWT token. Backend will need to handle this.');
        }
        
        // Create clean product payload with EXACT backend field names (PascalCase)
        productPayload = {
          // Required fields matching BaseProductDto - with safe string handling
          ProductName: (dto.productName || '').trim(),
          Description: (dto.description || '').trim(),
          ProductDescription: (dto.productDescription || '').trim(),
          Price: dto.price || 0,
          Discount: dto.discount || 0,
          StockQuantity: dto.stockQuantity || 0,
          SKU: (dto.sku || '').trim(),
          CategoryId: dto.categoryId || '',
          CategoryName: (dto.categoryName || '').trim(),
          ProductSpecification: (dto.productSpecification || '').trim(),
          Features: (dto.features || '').trim(),
          BoxContents: (dto.boxContents || '').trim(),
          ProductType: dto.productType || 'physical',
          IsActive: dto.isActive ?? true,
          IsFeatured: dto.isFeatured ?? false,
          Status: dto.status || 'pending',
          ImageUrls: imageUrls, // 🎯 Use uploaded image URLs
        };

        // Add MerchantID from JWT token or let backend handle it
        if (merchantId) {
          productPayload.MerchantID = merchantId;
          console.log('✅ Using MerchantID from JWT token:', merchantId);
        } else {
          console.log('⚠️ No MerchantID in token - backend will use _currentUserService.MerchantId');
          // Don't include MerchantID - let backend set it from _currentUserService
        }

        // Optional subcategory fields (Guid? means nullable)
        if (dto.subCategoryId && dto.subCategoryId !== 'null' && (dto.subCategoryId || '').trim()) {
          productPayload.SubCategoryId = dto.subCategoryId;
          productPayload.SubCategoryName = dto.subCategoryName || '';
        } else {
          // Explicitly set to null for nullable Guid fields
          productPayload.SubCategoryId = null;
          productPayload.SubCategoryName = null;
        }
        
        if (dto.subSubCategoryId && dto.subSubCategoryId !== 'null' && (dto.subSubCategoryId || '').trim()) {
          productPayload.SubSubCategoryId = dto.subSubCategoryId;
          productPayload.SubSubCategoryName = dto.subSubCategoryName || '';
        } else {
          // Explicitly set to null for nullable Guid fields
          productPayload.SubSubCategoryId = null;
          productPayload.SubSubCategoryName = null;
        }
      } else {
        // Handle legacy format
        productPayload = {
          ...productData,
          ImageUrls: imageUrls, // Add uploaded image URLs
          createdOn: new Date().toISOString(),
          createdBy: 'current-user'
        };
      }

      console.log('🚀 ProductService: Sending request to', endpoint);
      console.log('🔧 API URL from env:', process.env.NEXT_PUBLIC_API_URL);
      console.log('📦 Product payload with uploaded image URLs:', productPayload);

      // Send JSON payload to backend
      const response = await fetch(endpoint, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        
        console.error('🚨 Backend Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData
        });
        
        // More detailed error message
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
        if (errorData.errors) {
          errorMessage += ` | Validation Errors: ${JSON.stringify(errorData.errors)}`;
        }
        if (errorData.title) {
          errorMessage += ` | ${errorData.title}`;
        }
        
        throw new Error(errorMessage);
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
    // Backend expects POST request with ProductFilterDto in body
    const filter = {
      // Required pagination fields
      Page: params?.page || 1,
      PageSize: params?.limit || 10,
      
      // Optional filter fields (PascalCase to match C# backend)
      ProductName: params?.search || undefined, // Search by product name
      Status: params?.status || undefined,
      CategoryId: params?.category || undefined,
      
      // Optional fields - set to undefined to let backend use defaults
      MerchantId: undefined, // Let backend filter by current user's merchant
      SubCategoryId: undefined,
      SubSubCategoryId: undefined,
      SKU: undefined,
      MinPrice: undefined,
      MaxPrice: undefined,
      IsActive: undefined,
      IsFeatured: undefined,
      ProductType: undefined,
      CreatedFrom: undefined,
      CreatedTo: undefined,
      MinStock: undefined,
      MaxStock: undefined,
      
      // Sorting
      SortBy: 'CreatedOn',
      SortDirection: 'DESC'
    };

    // Use POST /Products/search endpoint as defined in controller
    return apiClient.post<PaginatedResponse<Product>>('/Product/search', filter);
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/Products/${id}`);
  },

  // Update product - Enhanced to match createProduct approach
  async updateProduct(
    id: string,
    productData: ProductFormData | CreateProductDto,
    images?: ProductImageUpload[]
  ): Promise<Product> {
    
    try {
      console.log('✏️ ProductService: Updating product with ID:', id);
      console.log('📝 ProductService: Update data:', productData);
      console.log('🖼️ ProductService: New images count:', images?.length || 0);

      // Step 1: Upload new images if provided
      let newImageUrls: string[] = [];
      if (images && images.length > 0) {
        console.log('📸 Uploading new images for product update...');
        newImageUrls = await this.uploadImages(images);
      }

      // Detect if we're using the new CreateProductDto format
      const isNewFormat = 'merchantID' in productData && 'features' in productData;
      console.log(`📦 Using ${isNewFormat ? 'new CreateProductDto' : 'legacy ProductFormData'} format for update`);

      // Step 2: Prepare product update payload
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7270/api';
      const endpoint = `${apiUrl}/Products/${id}`;
      
      let productPayload: any;

      if (isNewFormat) {
        const dto = productData as CreateProductDto;
        
        // Get current user's merchant ID from JWT token
        const currentUser = getCurrentUserFromToken();
        const merchantId = currentUser?.merchantId;
        
        // Create comprehensive product update payload with EXACT backend field names (PascalCase)
        productPayload = {
          // REQUIRED: ProductId must match URL parameter for backend validation
          ProductId: id,
          
          // Required fields matching UpdateProductDto - with safe string handling
          ProductName: (dto.productName || '').trim(),
          Description: (dto.description || '').trim(),
          ProductDescription: (dto.productDescription || '').trim(),
          Price: dto.price || 0,
          Discount: dto.discount || 0,
          StockQuantity: dto.stockQuantity || 0,
          SKU: (dto.sku || '').trim(),
          CategoryId: dto.categoryId, // Required GUID - must be provided
          CategoryName: (dto.categoryName || '').trim(),
          ProductSpecification: (dto.productSpecification || '').trim(),
          Features: (dto.features || '').trim(),
          BoxContents: (dto.boxContents || '').trim(),
          ProductType: dto.productType || 'physical',
          IsActive: dto.isActive ?? true,
          IsFeatured: dto.isFeatured ?? false,
          Status: dto.status || 'pending',
        };

        // Handle image URLs - combine existing and new
        const existingImageUrls = dto.imageUrls || [];
        const allImageUrls = [...existingImageUrls, ...newImageUrls];
        productPayload.ImageUrls = allImageUrls;

        // Add MerchantID from JWT token or let backend handle it
        if (merchantId) {
          productPayload.MerchantID = merchantId;
          console.log('✅ Using MerchantID from JWT token:', merchantId);
        } else {
          console.log('⚠️ No MerchantID in token - backend will use _currentUserService.MerchantId');
        }

        // Optional subcategory fields (Guid? means nullable)
        if (dto.subCategoryId && dto.subCategoryId !== 'null' && (dto.subCategoryId || '').trim()) {
          productPayload.SubCategoryId = dto.subCategoryId;
          productPayload.SubCategoryName = dto.subCategoryName || '';
        } else {
          productPayload.SubCategoryId = null;
          productPayload.SubCategoryName = null;
        }
        
        if (dto.subSubCategoryId && dto.subSubCategoryId !== 'null' && (dto.subSubCategoryId || '').trim()) {
          productPayload.SubSubCategoryId = dto.subSubCategoryId;
          productPayload.SubSubCategoryName = dto.subSubCategoryName || '';
        } else {
          productPayload.SubSubCategoryId = null;
          productPayload.SubSubCategoryName = null;
        }
      } else {
        // Handle legacy ProductFormData format
        const legacy = productData as ProductFormData;
        
        productPayload = {
          // REQUIRED: ProductId must match URL parameter for backend validation
          ProductId: id,
          
          ProductName: (legacy.productName || '').trim(),
          Description: (legacy.description || '').trim(),
          ProductDescription: (legacy.productDescription || '').trim(),
          Price: legacy.price || 0,
          Discount: legacy.discount || 0,
          StockQuantity: legacy.stockQuantity || 0,
          SKU: '', // ProductFormData doesn't have SKU field
          CategoryId: legacy.categoryId ? legacy.categoryId.toString() : null, // Will be validated below
          CategoryName: (legacy.categoryName || '').trim(),
          SubCategoryId: legacy.subCategoryId?.toString() || null,
          SubCategoryName: legacy.subCategoryName || null,
          SubSubCategoryId: legacy.subSubCategoryId?.toString() || null,
          SubSubCategoryName: legacy.subSubCategoryName || null,
          ProductSpecification: (legacy.specification || '').trim(),
          Features: (legacy.keyFeatures || '').trim(),
          BoxContents: (legacy.box || '').trim(),
          ProductType: legacy.productType || 'physical',
          IsActive: legacy.inStock ?? true,
          IsFeatured: false, // Not in legacy format
          Status: 'pending', // Default for legacy
          ImageUrls: newImageUrls, // Use new uploaded images
        };
      }

      console.log('🚀 ProductService: Sending update request to', endpoint);
      console.log('📦 Product update payload:', productPayload);
      console.log('🔍 CategoryId value:', productPayload.CategoryId, 'Type:', typeof productPayload.CategoryId);

      // Validate required fields before sending
      if (!productPayload.CategoryId) {
        throw new Error('CategoryId is required and must be a valid GUID');
      }
      
      // Log what we're sending for debugging
      console.log('✅ Validation passed - CategoryId:', productPayload.CategoryId);

      // Send update request to backend - [FromBody] expects direct UpdateProductDto
      const response = await fetch(endpoint, {
        method: 'POST', // Using POST for updates
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        
        console.error('🚨 Update Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorData
        });
        
        // More detailed error message
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
        if (errorData.errors) {
          errorMessage += ` | Validation Errors: ${JSON.stringify(errorData.errors)}`;
        }
        if (errorData.title) {
          errorMessage += ` | ${errorData.title}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ ProductService: Product updated successfully:', result);
      
      return result;
    } catch (error) {
      console.error('💥 ProductService: Error updating product:', error);
      throw error;
    }
  },

  // Delete product (permanent deletion)
  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/Products/${id}`);
  },

  // Soft delete product (mark as deleted)
  async softDeleteProduct(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/Products/${id}/soft-delete`);
  },

  // Update product status (approve/reject/pending/etc.)
  async updateProductStatus(id: string, status: string): Promise<{ message: string }> {
    // Backend expects just a string in the body
    return apiClient.patch<{ message: string }>(`/Products/${id}/status`, status);
  },

  // Approve product (using status update)
  async approveProduct(id: string): Promise<{ message: string }> {
    return this.updateProductStatus(id, 'approved');
  },

  // Reject product (using status update)
  async rejectProduct(id: string, reason?: string): Promise<{ message: string }> {
    // Note: The backend status endpoint doesn't handle reason, you might need a separate endpoint for that
    return this.updateProductStatus(id, 'rejected');
  },

  // Get products pending approval (filter by status)
  async getPendingProducts(): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ status: 'pending' });
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

  // Get subcategories by category name
  async getSubcategories(categoryName: string): Promise<{ id: string; name: string; productCount: number }[]> {
    return apiClient.get<{ id: string; name: string; productCount: number }[]>(`/Products/categories/${encodeURIComponent(categoryName)}/subcategories`);
  },

  // Update inventory
  async updateInventory(id: string, stock: number): Promise<Product> {
    return apiClient.patch<Product>(`/Products/${id}/inventory`, { stock });
  },
};