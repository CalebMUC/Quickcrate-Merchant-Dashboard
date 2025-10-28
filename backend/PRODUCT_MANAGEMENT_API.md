# Product Management API Documentation

## Overview

This document provides comprehensive documentation for the Product Management API implemented for the QuickCrate Merchant Dashboard. The API provides full CRUD operations, advanced filtering, search capabilities, analytics, and bulk operations for product management.

## Table of Contents

1. [Product Model Structure](#product-model-structure)
2. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
3. [API Endpoints](#api-endpoints)
4. [Authentication & Authorization](#authentication--authorization)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)
7. [Database Migration](#database-migration)

## Product Model Structure

The Product model includes the following key properties:

```csharp
public class Product
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; }
    public string Description { get; set; }
    public string ProductDescription { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int StockQuantity { get; set; }
    public string SKU { get; set; }
    
    // Category Information
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; }
    public Guid? SubCategoryId { get; set; }
    public string? SubCategoryName { get; set; }
    public Guid? SubSubCategoryId { get; set; }
    public string? SubSubCategoryName { get; set; }
    
    public string ProductSpecification { get; set; } // JSON format
    public string Features { get; set; }
    public string BoxContents { get; set; }
    public string ProductType { get; set; }
    
    // Status & Features
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public string Status { get; set; }
    
    // Images
    public List<string> ImageUrlsList { get; set; }
    
    // Merchant Relationship
    public Guid MerchantID { get; set; }
    
    // Audit Fields
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public string? DeletedBy { get; set; }
}
```

## DTOs (Data Transfer Objects)

### CreateProductDto
Used for creating new products.

### UpdateProductDto
Used for updating existing products.

### ProductResponseDto
Complete product information returned by the API.

### ProductListDto
Simplified product information for list/grid views.

### ProductFilterDto
Advanced filtering and pagination parameters:

```csharp
public class ProductFilterDto
{
    public Guid? MerchantId { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? SubCategoryId { get; set; }
    public Guid? SubSubCategoryId { get; set; }
    public string? ProductName { get; set; }
    public string? SKU { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public string? Status { get; set; }
    public string? ProductType { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public int? MinStock { get; set; }
    public int? MaxStock { get; set; }
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    
    // Sorting
    public string SortBy { get; set; } = "CreatedOn";
    public string SortDirection { get; set; } = "DESC";
}
```

## API Endpoints

### Basic CRUD Operations

#### GET /api/products/{id}
Get a specific product by ID.

**Response:** `ProductResponseDto`

#### POST /api/products/search
Get all products with filtering and pagination.

**Request Body:** `ProductFilterDto`  
**Response:** `PagedResultDto<ProductListDto>`

#### POST /api/products/merchant/{merchantId}
Get products by merchant ID.

**Path Parameter:** `merchantId` (Guid)  
**Request Body:** `ProductFilterDto`  
**Response:** `PagedResultDto<ProductListDto>`

#### POST /api/products/category/{categoryId}
Get products by category ID.

**Path Parameter:** `categoryId` (Guid)  
**Request Body:** `ProductFilterDto`  
**Response:** `PagedResultDto<ProductListDto>`

#### POST /api/products
Create a new product.

**Request Body:** `CreateProductDto`  
**Response:** `ProductResponseDto`

#### PUT /api/products/{id}
Update an existing product.

**Path Parameter:** `id` (Guid)  
**Request Body:** `UpdateProductDto`  
**Response:** `ProductResponseDto`

#### DELETE /api/products/{id}
Permanently delete a product.

**Path Parameter:** `id` (Guid)  
**Response:** `204 No Content`

### Advanced Operations

#### POST /api/products/{id}/soft-delete
Soft delete a product (mark as deleted).

#### POST /api/products/{id}/restore
Restore a soft-deleted product.

#### POST /api/products/merchant/{merchantId}/deleted
Get deleted products for a merchant.

### Bulk Operations

#### POST /api/products/bulk/update-status
Bulk update product status.

**Request Body:** `BulkUpdateProductStatusDto`

#### POST /api/products/bulk/delete
Bulk delete products (permanent).

**Request Body:** `BulkDeleteProductDto`

#### POST /api/products/bulk/soft-delete
Bulk soft delete products.

**Request Body:** `BulkDeleteProductDto`

### Status Management

#### PATCH /api/products/{id}/status
Update product status.

#### PATCH /api/products/{id}/toggle-active
Toggle product active status.

#### PATCH /api/products/{id}/toggle-featured
Toggle product featured status.

### Stock Management

#### PATCH /api/products/{id}/stock
Update product stock quantity.

#### PATCH /api/products/{id}/stock/adjust
Adjust product stock (add or subtract).

#### GET /api/products/merchant/{merchantId}/low-stock
Get low stock products for a merchant.

#### GET /api/products/merchant/{merchantId}/out-of-stock
Get out of stock products for a merchant.

### Category-based Queries

#### POST /api/products/subcategory/{subCategoryId}
Get products by subcategory ID.

#### POST /api/products/subsubcategory/{subSubCategoryId}
Get products by sub-subcategory ID.

### Search and Filtering

#### POST /api/products/search/{searchTerm}
Search products by text.

#### GET /api/products/merchant/{merchantId}/featured
Get featured products for a merchant.

#### GET /api/products/merchant/{merchantId}/recent
Get recent products for a merchant.

### Analytics and Statistics

#### GET /api/products/merchant/{merchantId}/statistics
Get comprehensive product statistics.

**Response:** `ProductStatisticsDto`

#### GET /api/products/merchant/{merchantId}/category-counts
Get product count by category.

#### GET /api/products/merchant/{merchantId}/inventory-value
Get inventory value by category.

### Validation

#### GET /api/products/validate/sku
Check if SKU is unique for a merchant.

### Import/Export

#### POST /api/products/import
Import products from a list.

#### POST /api/products/merchant/{merchantId}/export
Export products for a merchant as CSV.

### Image Management

#### PUT /api/products/{id}/images
Update product images.

#### POST /api/products/{id}/images
Add an image to a product.

#### DELETE /api/products/{id}/images
Remove an image from a product.

### Pricing

#### PATCH /api/products/{id}/price
Update product price.

#### PATCH /api/products/{id}/discount
Apply discount to a product.

#### POST /api/products/bulk/update-prices
Bulk update product prices.

### Duplicate and Copy

#### POST /api/products/{id}/duplicate
Duplicate a product with a new name.

## Authentication & Authorization

All endpoints require authentication via JWT Bearer token. 

### Roles and Permissions:
- **Merchant**: Can only access and modify their own products
- **Admin**: Can access and modify all products across all merchants

### Authorization Policies:
- Most endpoints check if the user owns the product being accessed (unless they're an admin)
- Bulk operations require appropriate permissions
- Analytics endpoints are restricted to the merchant's own data

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success with no content (e.g., delete operations)
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include detailed error messages and validation information.

## Usage Examples

### Create a Product

```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "productName": "Wireless Bluetooth Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "productDescription": "Premium wireless Bluetooth headphones featuring active noise cancellation, 30-hour battery life, and superior sound quality.",
  "price": 199.99,
  "discount": 10.0,
  "stockQuantity": 50,
  "sku": "WBH-001",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryName": "Electronics",
  "subCategoryId": "550e8400-e29b-41d4-a716-446655440001",
  "subCategoryName": "Audio",
  "productSpecification": "{\"brand\":\"AudioTech\",\"model\":\"AT-WH100\",\"color\":\"Black\",\"weight\":\"250g\"}",
  "features": "Active Noise Cancellation, 30-hour battery, Bluetooth 5.0, Quick charge",
  "boxContents": "Headphones, Charging cable, Carrying case, User manual",
  "productType": "Electronics",
  "isActive": true,
  "isFeatured": true,
  "status": "active",
  "imageUrls": [
    "https://example.com/images/headphones1.jpg",
    "https://example.com/images/headphones2.jpg"
  ],
  "merchantID": "550e8400-e29b-41d4-a716-446655440002"
}
```

### Search Products with Filtering

```http
POST /api/products/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "merchantId": "550e8400-e29b-41d4-a716-446655440002",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "minPrice": 50.0,
  "maxPrice": 500.0,
  "isActive": true,
  "productName": "wireless",
  "page": 1,
  "pageSize": 20,
  "sortBy": "Price",
  "sortDirection": "ASC"
}
```

### Get Product Statistics

```http
GET /api/products/merchant/550e8400-e29b-41d4-a716-446655440002/statistics
Authorization: Bearer {token}
```

Response:
```json
{
  "totalProducts": 150,
  "activeProducts": 125,
  "inactiveProducts": 25,
  "featuredProducts": 15,
  "outOfStockProducts": 5,
  "lowStockProducts": 12,
  "totalInventoryValue": 75000.00,
  "productsByStatus": {
    "active": 125,
    "pending": 20,
    "inactive": 5
  },
  "productsByCategory": {
    "Electronics": 80,
    "Clothing": 45,
    "Home & Garden": 25
  }
}
```

## Database Migration

To apply the new Product model structure, you'll need to create and run a migration:

```bash
# Add migration
dotnet ef migrations add UpdateProductModel

# Update database
dotnet ef database update
```

## Key Features Implemented

1. **Full CRUD Operations**: Complete Create, Read, Update, Delete functionality
2. **Advanced Filtering**: Multiple filter criteria with pagination and sorting
3. **Soft Delete**: Products can be soft deleted and restored
4. **Bulk Operations**: Mass update/delete operations for efficiency
5. **Stock Management**: Track inventory, low stock alerts, stock adjustments
6. **Image Management**: Multiple image support with add/remove functionality
7. **Search Functionality**: Text-based search across multiple product fields
8. **Analytics**: Comprehensive statistics and reporting
9. **Category Integration**: Full support for category, subcategory, and sub-subcategory
10. **Security**: Role-based access control and merchant data isolation
11. **Import/Export**: CSV export and batch import capabilities
12. **Validation**: SKU uniqueness, data validation, and business rule enforcement
13. **Audit Trail**: Complete audit logging with created/updated/deleted tracking
14. **Product Duplication**: Easy product copying and duplication
15. **Pricing Management**: Price updates and discount application

This implementation provides a robust, scalable, and feature-rich product management system suitable for both merchant and admin use cases.