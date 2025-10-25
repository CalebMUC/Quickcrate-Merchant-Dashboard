# Backend Implementation Guide: Categories Management System

## Overview

This document provides a comprehensive guide for implementing the backend API for the Quickcrate Merchant Dashboard Categories Management System. The system supports a 3-level hierarchical structure: **Category → SubCategory → Sub-SubCategory**.

## Table of Contents

1. [Database Schema](#database-schema)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Business Logic](#business-logic)
5. [Security & Authorization](#security--authorization)
6. [Performance Considerations](#performance-considerations)
7. [Implementation Examples](#implementation-examples)

---

## Database Schema

### 1. Categories Table

```sql
CREATE TABLE Categories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Slug NVARCHAR(255) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    MerchantId INT NOT NULL,
    ParentId INT NULL, -- For future hierarchical expansion
    ImageUrl NVARCHAR(500),
    MetaTitle NVARCHAR(255),
    MetaDescription NVARCHAR(500),
    ProductCount INT NOT NULL DEFAULT 0,
    CreatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedOn DATETIME2,
    CreatedBy NVARCHAR(255) NOT NULL,
    UpdatedBy NVARCHAR(255),
    
    CONSTRAINT FK_Categories_Merchant FOREIGN KEY (MerchantId) REFERENCES Merchants(Id),
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentId) REFERENCES Categories(Id),
    
    INDEX IX_Categories_Merchant (MerchantId),
    INDEX IX_Categories_Active (IsActive),
    INDEX IX_Categories_SortOrder (SortOrder),
    INDEX IX_Categories_Slug (Slug)
);
```

### 2. SubCategories Table

```sql
CREATE TABLE SubCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Slug NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CategoryId INT NOT NULL,
    MerchantId INT NOT NULL,
    ImageUrl NVARCHAR(500),
    ProductCount INT NOT NULL DEFAULT 0,
    CreatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedOn DATETIME2,
    CreatedBy NVARCHAR(255) NOT NULL,
    UpdatedBy NVARCHAR(255),
    
    CONSTRAINT FK_SubCategories_Category FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE CASCADE,
    CONSTRAINT FK_SubCategories_Merchant FOREIGN KEY (MerchantId) REFERENCES Merchants(Id),
    
    INDEX IX_SubCategories_Category (CategoryId),
    INDEX IX_SubCategories_Merchant (MerchantId),
    INDEX IX_SubCategories_Active (IsActive),
    INDEX IX_SubCategories_SortOrder (SortOrder),
    INDEX IX_SubCategories_Slug (Slug),
    
    CONSTRAINT UQ_SubCategories_Slug_Merchant UNIQUE (Slug, MerchantId)
);
```

### 3. SubSubCategories Table

```sql
CREATE TABLE SubSubCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Slug NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    SubCategoryId INT NOT NULL,
    MerchantId INT NOT NULL,
    ImageUrl NVARCHAR(500),
    ProductCount INT NOT NULL DEFAULT 0,
    CreatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedOn DATETIME2,
    CreatedBy NVARCHAR(255) NOT NULL,
    UpdatedBy NVARCHAR(255),
    
    CONSTRAINT FK_SubSubCategories_SubCategory FOREIGN KEY (SubCategoryId) REFERENCES SubCategories(Id) ON DELETE CASCADE,
    CONSTRAINT FK_SubSubCategories_Merchant FOREIGN KEY (MerchantId) REFERENCES Merchants(Id),
    
    INDEX IX_SubSubCategories_SubCategory (SubCategoryId),
    INDEX IX_SubSubCategories_Merchant (MerchantId),
    INDEX IX_SubSubCategories_Active (IsActive),
    INDEX IX_SubSubCategories_SortOrder (SortOrder),
    INDEX IX_SubSubCategories_Slug (Slug),
    
    CONSTRAINT UQ_SubSubCategories_Slug_Merchant UNIQUE (Slug, MerchantId)
);
```

### 4. Product Categories Relationship

```sql
-- Update Products table to include category references
ALTER TABLE Products ADD 
    CategoryId INT,
    SubCategoryId INT,
    SubSubCategoryId INT;

-- Add foreign key constraints
ALTER TABLE Products ADD 
    CONSTRAINT FK_Products_Category FOREIGN KEY (CategoryId) REFERENCES Categories(Id),
    CONSTRAINT FK_Products_SubCategory FOREIGN KEY (SubCategoryId) REFERENCES SubCategories(Id),
    CONSTRAINT FK_Products_SubSubCategory FOREIGN KEY (SubSubCategoryId) REFERENCES SubSubCategories(Id);

-- Add indexes for performance
CREATE INDEX IX_Products_Category ON Products(CategoryId);
CREATE INDEX IX_Products_SubCategory ON Products(SubCategoryId);
CREATE INDEX IX_Products_SubSubCategory ON Products(SubSubCategoryId);
```

---

## API Endpoints

### Base URL
```
https://localhost:7270/api/categories
```

### 1. Categories Endpoints

#### Get All Categories
```http
GET /api/categories
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `search` (string, optional): Search term for name/description
- `isActive` (boolean, optional): Filter by active status
- `sortBy` (string, optional): Sort field (name, sortOrder, createdOn)
- `sortOrder` (string, optional): asc or desc
- `page` (int, optional): Page number (default: 1)
- `pageSize` (int, optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "slug": "electronics",
        "isActive": true,
        "sortOrder": 1,
        "merchantId": 123,
        "imageUrl": "https://example.com/image.jpg",
        "metaTitle": "Electronics Category",
        "metaDescription": "Browse our electronics collection",
        "productCount": 45,
        "createdOn": "2025-10-20T10:00:00Z",
        "updatedOn": "2025-10-20T15:30:00Z",
        "createdBy": "admin@quickcrate.com",
        "updatedBy": "admin@quickcrate.com"
      }
    ],
    "totalCount": 10,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

#### Get Category by ID
```http
GET /api/categories/{id}
Authorization: Bearer {jwt_token}
```

#### Create Category
```http
POST /api/categories
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "slug": "electronics",
  "isActive": true,
  "sortOrder": 1,
  "imageUrl": "https://example.com/image.jpg",
  "metaTitle": "Electronics Category",
  "metaDescription": "Browse our electronics collection"
}
```

#### Update Category
```http
PUT /api/categories/{id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Updated Electronics",
  "description": "Updated description",
  "isActive": true,
  "sortOrder": 2
}
```

#### Delete Category
```http
DELETE /api/categories/{id}
Authorization: Bearer {jwt_token}
```

### 2. SubCategories Endpoints

#### Get SubCategories by Category
```http
GET /api/categories/{categoryId}/subcategories
Authorization: Bearer {jwt_token}
```

#### Create SubCategory
```http
POST /api/categories/{categoryId}/subcategories
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "slug": "smartphones",
  "isActive": true,
  "sortOrder": 1,
  "imageUrl": "https://example.com/smartphone.jpg"
}
```

#### Update SubCategory
```http
PUT /api/subcategories/{id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Updated Smartphones",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete SubCategory
```http
DELETE /api/subcategories/{id}
Authorization: Bearer {jwt_token}
```

### 3. Sub-SubCategories Endpoints

#### Get Sub-SubCategories by SubCategory
```http
GET /api/subcategories/{subCategoryId}/subsubcategories
Authorization: Bearer {jwt_token}
```

#### Create Sub-SubCategory
```http
POST /api/subcategories/{subCategoryId}/subsubcategories
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "iPhone",
  "description": "Apple iPhone devices",
  "slug": "iphone",
  "isActive": true,
  "sortOrder": 1,
  "imageUrl": "https://example.com/iphone.jpg"
}
```

#### Update Sub-SubCategory
```http
PUT /api/subsubcategories/{id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Updated iPhone",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Sub-SubCategory
```http
DELETE /api/subsubcategories/{id}
Authorization: Bearer {jwt_token}
```

---

## Data Models

### C# Entity Models

#### Category Entity
```csharp
public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
    
    [Required]
    public int MerchantId { get; set; }
    
    public int? ParentId { get; set; }
    
    [MaxLength(500)]
    public string ImageUrl { get; set; }
    
    [MaxLength(255)]
    public string MetaTitle { get; set; }
    
    [MaxLength(500)]
    public string MetaDescription { get; set; }
    
    public int ProductCount { get; set; } = 0;
    
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedOn { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string CreatedBy { get; set; }
    
    [MaxLength(255)]
    public string UpdatedBy { get; set; }
    
    // Navigation Properties
    public virtual Merchant Merchant { get; set; }
    public virtual Category Parent { get; set; }
    public virtual ICollection<Category> Children { get; set; }
    public virtual ICollection<SubCategory> SubCategories { get; set; }
    public virtual ICollection<Product> Products { get; set; }
}
```

#### SubCategory Entity
```csharp
public class SubCategory
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    public int MerchantId { get; set; }
    
    [MaxLength(500)]
    public string ImageUrl { get; set; }
    
    public int ProductCount { get; set; } = 0;
    
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedOn { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string CreatedBy { get; set; }
    
    [MaxLength(255)]
    public string UpdatedBy { get; set; }
    
    // Navigation Properties
    public virtual Category Category { get; set; }
    public virtual Merchant Merchant { get; set; }
    public virtual ICollection<SubSubCategory> SubSubCategories { get; set; }
    public virtual ICollection<Product> Products { get; set; }
}
```

#### SubSubCategory Entity
```csharp
public class SubSubCategory
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
    
    [Required]
    public int SubCategoryId { get; set; }
    
    [Required]
    public int MerchantId { get; set; }
    
    [MaxLength(500)]
    public string ImageUrl { get; set; }
    
    public int ProductCount { get; set; } = 0;
    
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedOn { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string CreatedBy { get; set; }
    
    [MaxLength(255)]
    public string UpdatedBy { get; set; }
    
    // Navigation Properties
    public virtual SubCategory SubCategory { get; set; }
    public virtual Merchant Merchant { get; set; }
    public virtual ICollection<Product> Products { get; set; }
}
```

### DTO Models

#### Request DTOs
```csharp
public class CreateCategoryDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
    
    public int? ParentId { get; set; }
    
    [MaxLength(500)]
    [Url]
    public string ImageUrl { get; set; }
    
    [MaxLength(255)]
    public string MetaTitle { get; set; }
    
    [MaxLength(500)]
    public string MetaDescription { get; set; }
}

public class UpdateCategoryDto
{
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool? IsActive { get; set; }
    
    public int? SortOrder { get; set; }
    
    public int? ParentId { get; set; }
    
    [MaxLength(500)]
    [Url]
    public string ImageUrl { get; set; }
    
    [MaxLength(255)]
    public string MetaTitle { get; set; }
    
    [MaxLength(500)]
    public string MetaDescription { get; set; }
}

public class CreateSubCategoryDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
    
    [Required]
    public int CategoryId { get; set; }
    
    [MaxLength(500)]
    [Url]
    public string ImageUrl { get; set; }
}

public class UpdateSubCategoryDto
{
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool? IsActive { get; set; }
    
    public int? SortOrder { get; set; }
    
    public int? CategoryId { get; set; }
    
    [MaxLength(500)]
    [Url]
    public string ImageUrl { get; set; }
}

public class CreateSubSubCategoryDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
    
    [Required]
    public int SubCategoryId { get; set; }
    
    [MaxLength(500)]
    [Url]
    public string ImageUrl { get; set; }
}

public class UpdateSubSubCategoryDto
{
    [MaxLength(255)]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    [MaxLength(255)]
    public string Slug { get; set; }
    
    public bool? IsActive { get; set; }
    
    public int? SortOrder { get; set; }
    
    public int? SubCategoryId { get; set; }
    
    [MaxLength(500)]
    [Url]
    public string ImageUrl { get; set; }
}
```

#### Response DTOs
```csharp
public class CategoryResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Slug { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public int MerchantId { get; set; }
    public int? ParentId { get; set; }
    public string ImageUrl { get; set; }
    public string MetaTitle { get; set; }
    public string MetaDescription { get; set; }
    public int ProductCount { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
    public List<SubCategoryResponseDto> SubCategories { get; set; }
}

public class SubCategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Slug { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public int CategoryId { get; set; }
    public int MerchantId { get; set; }
    public string ImageUrl { get; set; }
    public int ProductCount { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
    public List<SubSubCategoryResponseDto> SubSubCategories { get; set; }
}

public class SubSubCategoryResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Slug { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public int SubCategoryId { get; set; }
    public int MerchantId { get; set; }
    public string ImageUrl { get; set; }
    public int ProductCount { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public string CreatedBy { get; set; }
    public string UpdatedBy { get; set; }
}

public class PagedResultDto<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class CategoryHierarchySearchResultDto
{
    public List<CategoryResponseDto> Categories { get; set; } = new List<CategoryResponseDto>();
    public List<SubCategoryResponseDto> SubCategories { get; set; } = new List<SubCategoryResponseDto>();
    public List<SubSubCategoryResponseDto> SubSubCategories { get; set; } = new List<SubSubCategoryResponseDto>();
}
```

---

## Business Logic

### Core Business Rules

1. **Hierarchy Constraints**
   - Categories are the top-level organization
   - SubCategories must belong to a Category
   - Sub-SubCategories must belong to a SubCategory
   - Circular references are not allowed

2. **Merchant Isolation**
   - All categories are scoped to a specific merchant
   - Merchants can only access their own categories
   - Cross-merchant category access is prohibited

3. **Slug Generation**
   - Slugs must be unique within merchant scope
   - Auto-generate from name if not provided
   - URL-safe characters only (lowercase, hyphens)

4. **Product Count Maintenance**
   - Product counts are maintained automatically
   - Counts cascade up the hierarchy
   - Real-time updates when products are added/removed

5. **Soft Delete Support**
   - Use `IsActive` flag for soft deletes
   - Inactive categories hide from frontend
   - Preserve data integrity for reporting

### Service Layer Implementation

#### ICategoryService Interface
```csharp
public interface ICategoryService
{
    Task<PagedResultDto<CategoryResponseDto>> GetCategoriesAsync(
        int merchantId, 
        CategoryQueryDto query);
    
    Task<CategoryResponseDto> GetCategoryByIdAsync(Guid categoryId, Guid merchantId);
    
    Task<CategoryResponseDto> CreateCategoryAsync(
        CreateCategoryDto dto, 
        int merchantId, 
        string userId);
    
    Task<CategoryResponseDto> UpdateCategoryAsync(
        Guid id, 
        UpdateCategoryDto dto, 
        int merchantId, 
        string userId);
    
    Task DeleteCategoryAsync(Guid id, int merchantId);
    
    Task<List<SubCategoryResponseDto>> GetSubCategoriesAsync(
        int categoryId, 
        int merchantId);
    
    Task<SubCategoryResponseDto> CreateSubCategoryAsync(
        int categoryId, 
        CreateSubCategoryDto dto, 
        int merchantId, 
        string userId);
    
    Task<SubCategoryResponseDto> UpdateSubCategoryAsync(
        int id, 
        UpdateSubCategoryDto dto, 
        int merchantId, 
        string userId);
    
    Task DeleteSubCategoryAsync(int id, int merchantId);
    
    Task<List<SubSubCategoryResponseDto>> GetSubSubCategoriesAsync(
        int subCategoryId, 
        int merchantId);
    
    Task<SubSubCategoryResponseDto> CreateSubSubCategoryAsync(
        int subCategoryId, 
        CreateSubSubCategoryDto dto, 
        int merchantId, 
        string userId);
    
    Task<SubSubCategoryResponseDto> UpdateSubSubCategoryAsync(
        int id, 
        UpdateSubSubCategoryDto dto, 
        int merchantId, 
        string userId);
    
    Task DeleteSubSubCategoryAsync(int id, int merchantId);
    
    Task UpdateProductCountsAsync(int merchantId);
}
```

#### CategoryService Implementation
```csharp
public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        IApplicationDbContext context,
        IMapper mapper,
        ILogger<CategoryService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResultDto<CategoryResponseDto>> GetCategoriesAsync(
        int merchantId, 
        CategoryQueryDto query)
    {
        var queryable = _context.Categories
            .Where(c => c.MerchantId == merchantId)
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.SubSubCategories);

        // Apply filters
        if (!string.IsNullOrEmpty(query.Search))
        {
            queryable = queryable.Where(c => 
                c.Name.Contains(query.Search) || 
                c.Description.Contains(query.Search));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(c => c.IsActive == query.IsActive.Value);
        }

        // Apply sorting
        queryable = query.SortBy?.ToLower() switch
        {
            "name" => query.SortOrder == "desc" 
                ? queryable.OrderByDescending(c => c.Name)
                : queryable.OrderBy(c => c.Name),
            "createdon" => query.SortOrder == "desc"
                ? queryable.OrderByDescending(c => c.CreatedOn)
                : queryable.OrderBy(c => c.CreatedOn),
            _ => queryable.OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
        };

        var totalCount = await queryable.CountAsync();
        
        var categories = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var result = _mapper.Map<List<CategoryResponseDto>>(categories);

        return new PagedResultDto<CategoryResponseDto>
        {
            Items = result,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    public async Task<CategoryResponseDto> GetCategoryByIdAsync(Guid categoryId, Guid merchantId)
    {
        var category = await _context.Categories
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.SubSubCategories)
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.MerchantId == merchantId);

        if (category == null)
        {
            throw new NotFoundException($"Category with ID {categoryId} not found.");
        }

        _logger.LogInformation(
            "Category retrieved: {CategoryId} for merchant {MerchantId}", 
            categoryId, merchantId);

        return _mapper.Map<CategoryResponseDto>(category);
    }

    public async Task<CategoryResponseDto> CreateCategoryAsync(
        CreateCategoryDto dto, 
        int merchantId, 
        string userId)
    {
        // Generate slug if not provided
        var slug = !string.IsNullOrEmpty(dto.Slug) 
            ? dto.Slug.ToLowerInvariant()
            : GenerateSlug(dto.Name);

        // Ensure slug is unique
        slug = await EnsureUniqueSlugAsync(slug, merchantId);

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            Slug = slug,
            IsActive = dto.IsActive,
            SortOrder = dto.SortOrder,
            MerchantId = merchantId,
            ParentId = dto.ParentId,
            ImageUrl = dto.ImageUrl,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription,
            CreatedBy = userId,
            CreatedOn = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Category created: {CategoryId} by {UserId}", 
            category.Id, userId);

        return _mapper.Map<CategoryResponseDto>(category);
    }

    public async Task<CategoryResponseDto> UpdateCategoryAsync(
        Guid id, 
        UpdateCategoryDto dto, 
        int merchantId, 
        string userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.MerchantId == merchantId);

        if (category == null)
        {
            throw new NotFoundException($"Category with ID {id} not found.");
        }

        // Update fields
        if (!string.IsNullOrEmpty(dto.Name))
            category.Name = dto.Name;

        if (dto.Description != null)
            category.Description = dto.Description;

        if (!string.IsNullOrEmpty(dto.Slug))
        {
            var slug = dto.Slug.ToLowerInvariant();
            if (slug != category.Slug)
            {
                category.Slug = await EnsureUniqueSlugAsync(slug, merchantId, id);
            }
        }

        if (dto.IsActive.HasValue)
            category.IsActive = dto.IsActive.Value;

        if (dto.SortOrder.HasValue)
            category.SortOrder = dto.SortOrder.Value;

        if (dto.ParentId.HasValue)
            category.ParentId = dto.ParentId.Value;

        if (dto.ImageUrl != null)
            category.ImageUrl = dto.ImageUrl;

        if (dto.MetaTitle != null)
            category.MetaTitle = dto.MetaTitle;

        if (dto.MetaDescription != null)
            category.MetaDescription = dto.MetaDescription;

        category.UpdatedBy = userId;
        category.UpdatedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Category updated: {CategoryId} by {UserId}", 
            category.Id, userId);

        return _mapper.Map<CategoryResponseDto>(category);
    }

    public async Task DeleteCategoryAsync(Guid id, int merchantId)
    {
        var category = await _context.Categories
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id && c.MerchantId == merchantId);

        if (category == null)
        {
            throw new NotFoundException($"Category with ID {id} not found.");
        }

        // Check if category has products
        if (category.Products.Any())
        {
            throw new BadRequestException(
                "Cannot delete category with associated products. " +
                "Please move or delete products first.");
        }

        // Check if category has subcategories
        if (category.SubCategories.Any())
        {
            throw new BadRequestException(
                "Cannot delete category with subcategories. " +
                "Please delete subcategories first.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Category deleted: {CategoryId}", category.Id);
    }

    private string GenerateSlug(string name)
    {
        return name
            .ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("&", "and")
            .Replace("/", "-")
            .Replace("\\", "-")
            .Replace(".", "")
            .Replace(",", "")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace("(", "")
            .Replace(")", "")
            .Replace("[", "")
            .Replace("]", "")
            .Replace("{", "")
            .Replace("}", "")
            .Trim('-');
    }

    private async Task<string> EnsureUniqueSlugAsync(
        string baseSlug, 
        int merchantId, 
        Guid? excludeId = null)
    {
        var slug = baseSlug;
        var counter = 1;

        while (await SlugExistsAsync(slug, merchantId, excludeId))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private async Task<bool> SlugExistsAsync(
        string slug, 
        int merchantId, 
        Guid? excludeId = null)
    {
        return await _context.Categories
            .AnyAsync(c => 
                c.Slug == slug && 
                c.MerchantId == merchantId && 
                (excludeId == null || c.Id != excludeId));
    }

    // SubCategories Methods
    public async Task<List<SubCategoryResponseDto>> GetSubCategoriesAsync(
        int categoryId, 
        int merchantId)
    {
        var subCategories = await _context.SubCategories
            .Where(sc => sc.CategoryId == categoryId && sc.MerchantId == merchantId)
            .Include(sc => sc.SubSubCategories)
            .OrderBy(sc => sc.SortOrder)
            .ThenBy(sc => sc.Name)
            .ToListAsync();

        _logger.LogInformation(
            "SubCategories retrieved for Category: {CategoryId}, Merchant: {MerchantId}, Count: {Count}", 
            categoryId, merchantId, subCategories.Count);

        return _mapper.Map<List<SubCategoryResponseDto>>(subCategories);
    }

    public async Task<SubCategoryResponseDto> GetSubCategoryByIdAsync(
        int id, 
        int merchantId)
    {
        var subCategory = await _context.SubCategories
            .Include(sc => sc.SubSubCategories)
            .Include(sc => sc.Category)
            .FirstOrDefaultAsync(sc => sc.Id == id && sc.MerchantId == merchantId);

        if (subCategory == null)
        {
            throw new NotFoundException($"SubCategory with ID {id} not found.");
        }

        _logger.LogInformation(
            "SubCategory retrieved: {SubCategoryId} for merchant {MerchantId}", 
            id, merchantId);

        return _mapper.Map<SubCategoryResponseDto>(subCategory);
    }

    public async Task<SubCategoryResponseDto> CreateSubCategoryAsync(
        int categoryId, 
        CreateSubCategoryDto dto, 
        int merchantId, 
        string userId)
    {
        // Verify category exists and belongs to merchant
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.MerchantId == merchantId);

        if (category == null)
        {
            throw new NotFoundException($"Category with ID {categoryId} not found.");
        }

        // Generate slug if not provided
        var slug = !string.IsNullOrEmpty(dto.Slug) 
            ? dto.Slug.ToLowerInvariant()
            : GenerateSlug(dto.Name);

        // Ensure slug is unique within merchant scope
        slug = await EnsureUniqueSubCategorySlugAsync(slug, merchantId);

        var subCategory = new SubCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            Slug = slug,
            IsActive = dto.IsActive,
            SortOrder = dto.SortOrder,
            CategoryId = categoryId,
            MerchantId = merchantId,
            ImageUrl = dto.ImageUrl,
            CreatedBy = userId,
            CreatedOn = DateTime.UtcNow
        };

        _context.SubCategories.Add(subCategory);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "SubCategory created: {SubCategoryId} under Category {CategoryId} by {UserId}", 
            subCategory.Id, categoryId, userId);

        return _mapper.Map<SubCategoryResponseDto>(subCategory);
    }

    public async Task<SubCategoryResponseDto> UpdateSubCategoryAsync(
        int id, 
        UpdateSubCategoryDto dto, 
        int merchantId, 
        string userId)
    {
        var subCategory = await _context.SubCategories
            .FirstOrDefaultAsync(sc => sc.Id == id && sc.MerchantId == merchantId);

        if (subCategory == null)
        {
            throw new NotFoundException($"SubCategory with ID {id} not found.");
        }

        // Update fields
        if (!string.IsNullOrEmpty(dto.Name))
            subCategory.Name = dto.Name;

        if (dto.Description != null)
            subCategory.Description = dto.Description;

        if (!string.IsNullOrEmpty(dto.Slug))
        {
            var slug = dto.Slug.ToLowerInvariant();
            if (slug != subCategory.Slug)
            {
                subCategory.Slug = await EnsureUniqueSubCategorySlugAsync(slug, merchantId, id);
            }
        }

        if (dto.IsActive.HasValue)
            subCategory.IsActive = dto.IsActive.Value;

        if (dto.SortOrder.HasValue)
            subCategory.SortOrder = dto.SortOrder.Value;

        if (dto.CategoryId.HasValue)
        {
            // Verify new category exists and belongs to merchant
            var newCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value && c.MerchantId == merchantId);

            if (newCategory == null)
            {
                throw new NotFoundException($"Category with ID {dto.CategoryId.Value} not found.");
            }

            subCategory.CategoryId = dto.CategoryId.Value;
        }

        if (dto.ImageUrl != null)
            subCategory.ImageUrl = dto.ImageUrl;

        subCategory.UpdatedBy = userId;
        subCategory.UpdatedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "SubCategory updated: {SubCategoryId} by {UserId}", 
            subCategory.Id, userId);

        return _mapper.Map<SubCategoryResponseDto>(subCategory);
    }

    public async Task DeleteSubCategoryAsync(int id, int merchantId)
    {
        var subCategory = await _context.SubCategories
            .Include(sc => sc.SubSubCategories)
            .Include(sc => sc.Products)
            .FirstOrDefaultAsync(sc => sc.Id == id && sc.MerchantId == merchantId);

        if (subCategory == null)
        {
            throw new NotFoundException($"SubCategory with ID {id} not found.");
        }

        // Check if subcategory has products
        if (subCategory.Products.Any())
        {
            throw new BadRequestException(
                "Cannot delete subcategory with associated products. " +
                "Please move or delete products first.");
        }

        // Check if subcategory has sub-subcategories
        if (subCategory.SubSubCategories.Any())
        {
            throw new BadRequestException(
                "Cannot delete subcategory with sub-subcategories. " +
                "Please delete sub-subcategories first.");
        }

        _context.SubCategories.Remove(subCategory);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "SubCategory deleted: {SubCategoryId}", subCategory.Id);
    }

    // Sub-SubCategories Methods
    public async Task<List<SubSubCategoryResponseDto>> GetSubSubCategoriesAsync(
        int subCategoryId, 
        int merchantId)
    {
        var subSubCategories = await _context.SubSubCategories
            .Where(ssc => ssc.SubCategoryId == subCategoryId && ssc.MerchantId == merchantId)
            .OrderBy(ssc => ssc.SortOrder)
            .ThenBy(ssc => ssc.Name)
            .ToListAsync();

        _logger.LogInformation(
            "SubSubCategories retrieved for SubCategory: {SubCategoryId}, Merchant: {MerchantId}, Count: {Count}", 
            subCategoryId, merchantId, subSubCategories.Count);

        return _mapper.Map<List<SubSubCategoryResponseDto>>(subSubCategories);
    }

    public async Task<SubSubCategoryResponseDto> GetSubSubCategoryByIdAsync(
        int id, 
        int merchantId)
    {
        var subSubCategory = await _context.SubSubCategories
            .Include(ssc => ssc.SubCategory)
                .ThenInclude(sc => sc.Category)
            .FirstOrDefaultAsync(ssc => ssc.Id == id && ssc.MerchantId == merchantId);

        if (subSubCategory == null)
        {
            throw new NotFoundException($"SubSubCategory with ID {id} not found.");
        }

        _logger.LogInformation(
            "SubSubCategory retrieved: {SubSubCategoryId} for merchant {MerchantId}", 
            id, merchantId);

        return _mapper.Map<SubSubCategoryResponseDto>(subSubCategory);
    }

    public async Task<SubSubCategoryResponseDto> CreateSubSubCategoryAsync(
        int subCategoryId, 
        CreateSubSubCategoryDto dto, 
        int merchantId, 
        string userId)
    {
        // Verify subcategory exists and belongs to merchant
        var subCategory = await _context.SubCategories
            .FirstOrDefaultAsync(sc => sc.Id == subCategoryId && sc.MerchantId == merchantId);

        if (subCategory == null)
        {
            throw new NotFoundException($"SubCategory with ID {subCategoryId} not found.");
        }

        // Generate slug if not provided
        var slug = !string.IsNullOrEmpty(dto.Slug) 
            ? dto.Slug.ToLowerInvariant()
            : GenerateSlug(dto.Name);

        // Ensure slug is unique within merchant scope
        slug = await EnsureUniqueSubSubCategorySlugAsync(slug, merchantId);

        var subSubCategory = new SubSubCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            Slug = slug,
            IsActive = dto.IsActive,
            SortOrder = dto.SortOrder,
            SubCategoryId = subCategoryId,
            MerchantId = merchantId,
            ImageUrl = dto.ImageUrl,
            CreatedBy = userId,
            CreatedOn = DateTime.UtcNow
        };

        _context.SubSubCategories.Add(subSubCategory);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "SubSubCategory created: {SubSubCategoryId} under SubCategory {SubCategoryId} by {UserId}", 
            subSubCategory.Id, subCategoryId, userId);

        return _mapper.Map<SubSubCategoryResponseDto>(subSubCategory);
    }

    public async Task<SubSubCategoryResponseDto> UpdateSubSubCategoryAsync(
        int id, 
        UpdateSubSubCategoryDto dto, 
        int merchantId, 
        string userId)
    {
        var subSubCategory = await _context.SubSubCategories
            .FirstOrDefaultAsync(ssc => ssc.Id == id && ssc.MerchantId == merchantId);

        if (subSubCategory == null)
        {
            throw new NotFoundException($"SubSubCategory with ID {id} not found.");
        }

        // Update fields
        if (!string.IsNullOrEmpty(dto.Name))
            subSubCategory.Name = dto.Name;

        if (dto.Description != null)
            subSubCategory.Description = dto.Description;

        if (!string.IsNullOrEmpty(dto.Slug))
        {
            var slug = dto.Slug.ToLowerInvariant();
            if (slug != subSubCategory.Slug)
            {
                subSubCategory.Slug = await EnsureUniqueSubSubCategorySlugAsync(slug, merchantId, id);
            }
        }

        if (dto.IsActive.HasValue)
            subSubCategory.IsActive = dto.IsActive.Value;

        if (dto.SortOrder.HasValue)
            subSubCategory.SortOrder = dto.SortOrder.Value;

        if (dto.SubCategoryId.HasValue)
        {
            // Verify new subcategory exists and belongs to merchant
            var newSubCategory = await _context.SubCategories
                .FirstOrDefaultAsync(sc => sc.Id == dto.SubCategoryId.Value && sc.MerchantId == merchantId);

            if (newSubCategory == null)
            {
                throw new NotFoundException($"SubCategory with ID {dto.SubCategoryId.Value} not found.");
            }

            subSubCategory.SubCategoryId = dto.SubCategoryId.Value;
        }

        if (dto.ImageUrl != null)
            subSubCategory.ImageUrl = dto.ImageUrl;

        subSubCategory.UpdatedBy = userId;
        subSubCategory.UpdatedOn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "SubSubCategory updated: {SubSubCategoryId} by {UserId}", 
            subSubCategory.Id, userId);

        return _mapper.Map<SubSubCategoryResponseDto>(subSubCategory);
    }

    public async Task DeleteSubSubCategoryAsync(int id, int merchantId)
    {
        var subSubCategory = await _context.SubSubCategories
            .Include(ssc => ssc.Products)
            .FirstOrDefaultAsync(ssc => ssc.Id == id && ssc.MerchantId == merchantId);

        if (subSubCategory == null)
        {
            throw new NotFoundException($"SubSubCategory with ID {id} not found.");
        }

        // Check if sub-subcategory has products
        if (subSubCategory.Products.Any())
        {
            throw new BadRequestException(
                "Cannot delete sub-subcategory with associated products. " +
                "Please move or delete products first.");
        }

        _context.SubSubCategories.Remove(subSubCategory);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "SubSubCategory deleted: {SubSubCategoryId}", subSubCategory.Id);
    }

    // Product Count Maintenance
    public async Task UpdateProductCountsAsync(int merchantId)
    {
        // Update SubSubCategory product counts
        var subSubCategories = await _context.SubSubCategories
            .Where(ssc => ssc.MerchantId == merchantId)
            .ToListAsync();

        foreach (var ssc in subSubCategories)
        {
            var productCount = await _context.Products
                .CountAsync(p => p.SubSubCategoryId == ssc.Id && p.IsActive);
            
            ssc.ProductCount = productCount;
        }

        // Update SubCategory product counts (including sub-subcategory products)
        var subCategories = await _context.SubCategories
            .Where(sc => sc.MerchantId == merchantId)
            .Include(sc => sc.SubSubCategories)
            .ToListAsync();

        foreach (var sc in subCategories)
        {
            var directProductCount = await _context.Products
                .CountAsync(p => p.SubCategoryId == sc.Id && p.IsActive);
            
            var subSubProductCount = sc.SubSubCategories.Sum(ssc => ssc.ProductCount);
            
            sc.ProductCount = directProductCount + subSubProductCount;
        }

        // Update Category product counts (including subcategory and sub-subcategory products)
        var categories = await _context.Categories
            .Where(c => c.MerchantId == merchantId)
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.SubSubCategories)
            .ToListAsync();

        foreach (var c in categories)
        {
            var directProductCount = await _context.Products
                .CountAsync(p => p.CategoryId == c.Id && p.IsActive);
            
            var subCategoryProductCount = c.SubCategories.Sum(sc => sc.ProductCount);
            
            c.ProductCount = directProductCount + subCategoryProductCount;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Product counts updated for merchant {MerchantId}", merchantId);
    }

    // Helper methods for slug uniqueness
    private async Task<string> EnsureUniqueSubCategorySlugAsync(
        string baseSlug, 
        int merchantId, 
        int? excludeId = null)
    {
        var slug = baseSlug;
        var counter = 1;

        while (await SubCategorySlugExistsAsync(slug, merchantId, excludeId))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private async Task<bool> SubCategorySlugExistsAsync(
        string slug, 
        int merchantId, 
        int? excludeId = null)
    {
        return await _context.SubCategories
            .AnyAsync(sc => 
                sc.Slug == slug && 
                sc.MerchantId == merchantId && 
                (excludeId == null || sc.Id != excludeId));
    }

    private async Task<string> EnsureUniqueSubSubCategorySlugAsync(
        string baseSlug, 
        int merchantId, 
        int? excludeId = null)
    {
        var slug = baseSlug;
        var counter = 1;

        while (await SubSubCategorySlugExistsAsync(slug, merchantId, excludeId))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private async Task<bool> SubSubCategorySlugExistsAsync(
        string slug, 
        int merchantId, 
        int? excludeId = null)
    {
        return await _context.SubSubCategories
            .AnyAsync(ssc => 
                ssc.Slug == slug && 
                ssc.MerchantId == merchantId && 
                (excludeId == null || ssc.Id != excludeId));
    }

    // Bulk operations for better performance
    public async Task<List<SubCategoryResponseDto>> GetSubCategoriesByCategoryIdsAsync(
        List<int> categoryIds, 
        int merchantId)
    {
        var subCategories = await _context.SubCategories
            .Where(sc => categoryIds.Contains(sc.CategoryId) && sc.MerchantId == merchantId)
            .Include(sc => sc.SubSubCategories)
            .OrderBy(sc => sc.CategoryId)
            .ThenBy(sc => sc.SortOrder)
            .ThenBy(sc => sc.Name)
            .ToListAsync();

        return _mapper.Map<List<SubCategoryResponseDto>>(subCategories);
    }

    public async Task<List<SubSubCategoryResponseDto>> GetSubSubCategoriesBySubCategoryIdsAsync(
        List<int> subCategoryIds, 
        int merchantId)
    {
        var subSubCategories = await _context.SubSubCategories
            .Where(ssc => subCategoryIds.Contains(ssc.SubCategoryId) && ssc.MerchantId == merchantId)
            .OrderBy(ssc => ssc.SubCategoryId)
            .ThenBy(ssc => ssc.SortOrder)
            .ThenBy(ssc => ssc.Name)
            .ToListAsync();

        return _mapper.Map<List<SubSubCategoryResponseDto>>(subSubCategories);
    }

    // Search across all category levels
    public async Task<CategoryHierarchySearchResultDto> SearchCategoriesAsync(
        string searchTerm, 
        int merchantId, 
        int maxResults = 50)
    {
        var result = new CategoryHierarchySearchResultDto();

        if (string.IsNullOrWhiteSpace(searchTerm))
            return result;

        var searchLower = searchTerm.ToLowerInvariant();

        // Search Categories
        result.Categories = await _context.Categories
            .Where(c => c.MerchantId == merchantId && 
                       (c.Name.ToLower().Contains(searchLower) || 
                        c.Description.ToLower().Contains(searchLower)))
            .OrderBy(c => c.Name)
            .Take(maxResults)
            .Select(c => _mapper.Map<CategoryResponseDto>(c))
            .ToListAsync();

        // Search SubCategories
        result.SubCategories = await _context.SubCategories
            .Where(sc => sc.MerchantId == merchantId && 
                        (sc.Name.ToLower().Contains(searchLower) || 
                         sc.Description.ToLower().Contains(searchLower)))
            .Include(sc => sc.Category)
            .OrderBy(sc => sc.Name)
            .Take(maxResults)
            .Select(sc => _mapper.Map<SubCategoryResponseDto>(sc))
            .ToListAsync();

        // Search SubSubCategories
        result.SubSubCategories = await _context.SubSubCategories
            .Where(ssc => ssc.MerchantId == merchantId && 
                         (ssc.Name.ToLower().Contains(searchLower) || 
                          ssc.Description.ToLower().Contains(searchLower)))
            .Include(ssc => ssc.SubCategory)
                .ThenInclude(sc => sc.Category)
            .OrderBy(ssc => ssc.Name)
            .Take(maxResults)
            .Select(ssc => _mapper.Map<SubSubCategoryResponseDto>(ssc))
            .ToListAsync();

        return result;
    }
}
```

---

## Security & Authorization

### JWT Authentication
All endpoints require valid JWT tokens with merchant context.

### Authorization Policies
```csharp
[Authorize(Policy = "MerchantAccess")]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ICurrentUserService _currentUserService;

    public CategoriesController(
        ICategoryService categoryService,
        ICurrentUserService currentUserService)
    {
        _categoryService = categoryService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResultDto<CategoryResponseDto>>>> GetCategories(
        [FromQuery] CategoryQueryDto query)
    {
        var merchantId = _currentUserService.MerchantId;
        var result = await _categoryService.GetCategoriesAsync(merchantId, query);
        return Ok(ApiResponse<PagedResultDto<CategoryResponseDto>>.Success(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> CreateCategory(
        CreateCategoryDto dto)
    {
        var merchantId = _currentUserService.MerchantId;
        var userId = _currentUserService.UserId;
        var result = await _categoryService.CreateCategoryAsync(dto, merchantId, userId);
        return CreatedAtAction(
            nameof(GetCategoryById), 
            new { id = result.Id }, 
            ApiResponse<CategoryResponseDto>.Success(result));
    }
}
```

### Data Validation
```csharp
public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(255)
            .WithMessage("Name is required and must be less than 255 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description must be less than 1000 characters.");

        RuleFor(x => x.Slug)
            .MaximumLength(255)
            .Matches(@"^[a-z0-9-]+$")
            .When(x => !string.IsNullOrEmpty(x.Slug))
            .WithMessage("Slug must contain only lowercase letters, numbers, and hyphens.");

        RuleFor(x => x.ImageUrl)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrEmpty(x.ImageUrl))
            .WithMessage("Image URL must be a valid URL.");

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Sort order must be a non-negative number.");
    }

    private static bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}
```

---

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**
   ```sql
   -- Composite indexes for common queries
   CREATE INDEX IX_Categories_Merchant_Active_Sort ON Categories(MerchantId, IsActive, SortOrder);
   CREATE INDEX IX_SubCategories_Category_Active_Sort ON SubCategories(CategoryId, IsActive, SortOrder);
   CREATE INDEX IX_SubSubCategories_SubCategory_Active_Sort ON SubSubCategories(SubCategoryId, IsActive, SortOrder);
   ```

2. **Query Optimization**
   ```csharp
   // Use projection for list views
   var categories = await _context.Categories
       .Where(c => c.MerchantId == merchantId)
       .Select(c => new CategoryListDto
       {
           Id = c.Id,
           Name = c.Name,
           ProductCount = c.ProductCount,
           IsActive = c.IsActive
       })
       .ToListAsync();
   ```

3. **Caching Strategy**
   ```csharp
   public async Task<CategoryResponseDto> GetCategoryByIdAsync(int id, int merchantId)
   {
       var cacheKey = $"category:{merchantId}:{id}";
       var cached = await _cache.GetAsync<CategoryResponseDto>(cacheKey);
       
       if (cached != null)
           return cached;

       var category = await _context.Categories
           .Include(c => c.SubCategories)
           .FirstOrDefaultAsync(c => c.Id == id && c.MerchantId == merchantId);

       if (category == null)
           throw new NotFoundException($"Category with ID {id} not found.");

       var result = _mapper.Map<CategoryResponseDto>(category);
       await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(30));
       
       return result;
   }
   ```

### API Performance

1. **Pagination**: Always use pagination for list endpoints
2. **Field Selection**: Support field selection to reduce payload size
3. **Compression**: Enable gzip compression for responses
4. **Rate Limiting**: Implement rate limiting to prevent abuse

---

## Implementation Examples

### Complete Controller Implementation
```csharp
[Authorize(Policy = "MerchantAccess")]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(
        ICategoryService categoryService,
        ICurrentUserService currentUserService,
        ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Get all categories for the current merchant
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResultDto<CategoryResponseDto>>), 200)]
    public async Task<ActionResult<ApiResponse<PagedResultDto<CategoryResponseDto>>>> GetCategories(
        [FromQuery] CategoryQueryDto query)
    {
        var merchantId = _currentUserService.MerchantId;
        var result = await _categoryService.GetCategoriesAsync(merchantId, query);
        return Ok(ApiResponse<PagedResultDto<CategoryResponseDto>>.Success(result));
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> GetCategoryById(Guid id)
    {
        var merchantId = _currentUserService.MerchantId;
        var result = await _categoryService.GetCategoryByIdAsync(id, merchantId);
        return Ok(ApiResponse<CategoryResponseDto>.Success(result));
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponseDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> CreateCategory(
        CreateCategoryDto dto)
    {
        var merchantId = _currentUserService.MerchantId;
        var userId = _currentUserService.UserId;
        var result = await _categoryService.CreateCategoryAsync(dto, merchantId, userId);
        
        return CreatedAtAction(
            nameof(GetCategoryById), 
            new { id = result.Id }, 
            ApiResponse<CategoryResponseDto>.Success(result));
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse<CategoryResponseDto>>> UpdateCategory(
        Guid id, 
        UpdateCategoryDto dto)
    {
        var merchantId = _currentUserService.MerchantId;
        var userId = _currentUserService.UserId;
        var result = await _categoryService.UpdateCategoryAsync(id, dto, merchantId, userId);
        return Ok(ApiResponse<CategoryResponseDto>.Success(result));
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<ActionResult<ApiResponse>> DeleteCategory(Guid id)
    {
        var merchantId = _currentUserService.MerchantId;
        await _categoryService.DeleteCategoryAsync(id, merchantId);
        return Ok(ApiResponse.Success("Category deleted successfully"));
    }

    /// <summary>
    /// Get subcategories for a specific category
    /// </summary>
    [HttpGet("{categoryId}/subcategories")]
    [ProducesResponseType(typeof(ApiResponse<List<SubCategoryResponseDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<SubCategoryResponseDto>>>> GetSubCategories(
        int categoryId)
    {
        var merchantId = _currentUserService.MerchantId;
        var result = await _categoryService.GetSubCategoriesAsync(categoryId, merchantId);
        return Ok(ApiResponse<List<SubCategoryResponseDto>>.Success(result));
    }

    /// <summary>
    /// Create a new subcategory
    /// </summary>
    [HttpPost("{categoryId}/subcategories")]
    [ProducesResponseType(typeof(ApiResponse<SubCategoryResponseDto>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<ActionResult<ApiResponse<SubCategoryResponseDto>>> CreateSubCategory(
        int categoryId, 
        CreateSubCategoryDto dto)
    {
        var merchantId = _currentUserService.MerchantId;
        var userId = _currentUserService.UserId;
        var result = await _categoryService.CreateSubCategoryAsync(categoryId, dto, merchantId, userId);
        return CreatedAtAction(
            nameof(GetSubCategories), 
            new { categoryId = categoryId }, 
            ApiResponse<SubCategoryResponseDto>.Success(result));
    }
}
```

### Repository Pattern Implementation
```csharp
public interface ICategoryRepository
{
    Task<IQueryable<Category>> GetCategoriesQueryAsync(int merchantId);
    Task<Category> GetByIdAsync(int id, int merchantId);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(int id, int merchantId);
    Task<bool> SlugExistsAsync(string slug, int merchantId, int? excludeId = null);
    Task UpdateProductCountsAsync(int merchantId);
}

public class CategoryRepository : ICategoryRepository
{
    private readonly IApplicationDbContext _context;

    public CategoryRepository(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IQueryable<Category>> GetCategoriesQueryAsync(int merchantId)
    {
        return _context.Categories
            .Where(c => c.MerchantId == merchantId)
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.SubSubCategories);
    }

    public async Task<Category> GetByIdAsync(int id, int merchantId)
    {
        return await _context.Categories
            .Include(c => c.SubCategories)
                .ThenInclude(sc => sc.SubSubCategories)
            .FirstOrDefaultAsync(c => c.Id == id && c.MerchantId == merchantId);
    }

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task DeleteAsync(int id, int merchantId)
    {
        var category = await GetByIdAsync(id, merchantId);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> SlugExistsAsync(string slug, int merchantId, int? excludeId = null)
    {
        return await _context.Categories
            .AnyAsync(c => 
                c.Slug == slug && 
                c.MerchantId == merchantId && 
                (excludeId == null || c.Id != excludeId));
    }

    public async Task UpdateProductCountsAsync(int merchantId)
    {
        // Update SubSubCategory product counts
        await _context.Database.ExecuteSqlRawAsync(@"
            UPDATE ssc SET ProductCount = (
                SELECT COUNT(*) 
                FROM Products p 
                WHERE p.SubSubCategoryId = ssc.Id AND p.IsActive = 1
            )
            FROM SubSubCategories ssc
            WHERE ssc.MerchantId = {0}", merchantId);

        // Update SubCategory product counts
        await _context.Database.ExecuteSqlRawAsync(@"
            UPDATE sc SET ProductCount = (
                SELECT ISNULL(SUM(p.ProductCount), 0) + ISNULL(SUM(ssc.ProductCount), 0)
                FROM (
                    SELECT COUNT(*) as ProductCount
                    FROM Products p 
                    WHERE p.SubCategoryId = sc.Id AND p.IsActive = 1
                    UNION ALL
                    SELECT SUM(ssc.ProductCount) as ProductCount
                    FROM SubSubCategories ssc
                    WHERE ssc.SubCategoryId = sc.Id
                ) p
            )
            FROM SubCategories sc
            WHERE sc.MerchantId = {0}", merchantId);

        // Update Category product counts
        await _context.Database.ExecuteSqlRawAsync(@"
            UPDATE c SET ProductCount = (
                SELECT ISNULL(SUM(p.ProductCount), 0) + ISNULL(SUM(sc.ProductCount), 0)
                FROM (
                    SELECT COUNT(*) as ProductCount
                    FROM Products p 
                    WHERE p.CategoryId = c.Id AND p.IsActive = 1
                    UNION ALL
                    SELECT SUM(sc.ProductCount) as ProductCount
                    FROM SubCategories sc
                    WHERE sc.CategoryId = c.Id
                ) p
            )
            FROM Categories c
            WHERE c.MerchantId = {0}", merchantId);
    }
}
```

---

## Testing Strategy

### Unit Tests
```csharp
[TestClass]
public class CategoryServiceTests
{
    private Mock<IApplicationDbContext> _contextMock;
    private Mock<IMapper> _mapperMock;
    private Mock<ILogger<CategoryService>> _loggerMock;
    private CategoryService _service;

    [TestInitialize]
    public void Setup()
    {
        _contextMock = new Mock<IApplicationDbContext>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<CategoryService>>();
        _service = new CategoryService(_contextMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [TestMethod]
    public async Task CreateCategoryAsync_ValidInput_ReturnsCategory()
    {
        // Arrange
        var dto = new CreateCategoryDto
        {
            Name = "Test Category",
            Description = "Test Description"
        };
        var merchantId = 1;
        var userId = "test-user";

        var category = new Category
        {
            Id = 1,
            Name = dto.Name,
            Description = dto.Description,
            MerchantId = merchantId
        };

        var responseDto = new CategoryResponseDto
        {
            Id = 1,
            Name = dto.Name,
            Description = dto.Description
        };

        _contextMock.Setup(x => x.Categories.Add(It.IsAny<Category>()));
        _contextMock.Setup(x => x.SaveChangesAsync()).ReturnsAsync(1);
        _mapperMock.Setup(x => x.Map<CategoryResponseDto>(It.IsAny<Category>()))
            .Returns(responseDto);

        // Act
        var result = await _service.CreateCategoryAsync(dto, merchantId, userId);

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(dto.Name, result.Name);
        Assert.AreEqual(dto.Description, result.Description);
    }
}
```

### Integration Tests
```csharp
[TestClass]
public class CategoriesControllerIntegrationTests : IntegrationTestBase
{
    [TestMethod]
    public async Task GetCategories_ValidRequest_ReturnsCategories()
    {
        // Arrange
        await SeedTestDataAsync();

        // Act
        var response = await Client.GetAsync("/api/categories");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResultDto<CategoryResponseDto>>>(content);
        
        Assert.IsNotNull(result);
        Assert.IsTrue(result.Success);
        Assert.IsTrue(result.Data.Items.Count > 0);
    }

    [TestMethod]
    public async Task CreateCategory_ValidInput_CreatesCategory()
    {
        // Arrange
        var dto = new CreateCategoryDto
        {
            Name = "Integration Test Category",
            Description = "Created via integration test"
        };

        var json = JsonSerializer.Serialize(dto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/categories", content);

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
    }
}
```

---

## Deployment Considerations

### Environment Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=QuickcrateDB;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "QuickcrateAPI.Services.CategoryService": "Debug"
    }
  },
  "Cache": {
    "DefaultExpirationMinutes": 30,
    "CategoryCacheExpirationMinutes": 60
  },
  "Api": {
    "RateLimiting": {
      "RequestsPerMinute": 100,
      "BurstSize": 20
    }
  }
}
```

### Database Migration Script
```sql
-- Categories Management Migration Script
-- Version: 1.0.0
-- Date: 2025-10-20

BEGIN TRANSACTION;

-- Create Categories table
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Slug NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    MerchantId INT NOT NULL,
    ParentId INT NULL,
    ImageUrl NVARCHAR(500),
    MetaTitle NVARCHAR(255),
    MetaDescription NVARCHAR(500),
    ProductCount INT NOT NULL DEFAULT 0,
    CreatedOn DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedOn DATETIME2,
    CreatedBy NVARCHAR(255) NOT NULL,
    UpdatedBy NVARCHAR(255),
    
    CONSTRAINT FK_Categories_Merchant FOREIGN KEY (MerchantId) REFERENCES Merchants(Id),
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentId) REFERENCES Categories(Id),
    CONSTRAINT UQ_Categories_Slug_Merchant UNIQUE (Slug, MerchantId)
);

-- Create indexes
CREATE INDEX IX_Categories_Merchant ON Categories(MerchantId);
CREATE INDEX IX_Categories_Active ON Categories(IsActive);
CREATE INDEX IX_Categories_SortOrder ON Categories(SortOrder);
CREATE INDEX IX_Categories_Slug ON Categories(Slug);
CREATE INDEX IX_Categories_Merchant_Active_Sort ON Categories(MerchantId, IsActive, SortOrder);

-- Insert sample data
INSERT INTO Categories (Name, Description, Slug, MerchantId, CreatedBy) VALUES
('Electronics', 'Electronic devices and accessories', 'electronics', 1, 'system'),
('Clothing', 'Apparel and fashion items', 'clothing', 1, 'system'),
('Home & Garden', 'Home improvement and garden supplies', 'home-garden', 1, 'system');

COMMIT TRANSACTION;
```

---

## API Documentation

### OpenAPI/Swagger Configuration
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Quickcrate Categories API",
            Version = "v1",
            Description = "API for managing product categories in the Quickcrate platform",
            Contact = new OpenApiContact
            {
                Name = "Quickcrate Support",
                Email = "support@quickcrate.com"
            }
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] {}
            }
        });

        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        c.IncludeXmlComments(xmlPath);
    });
}
```

---

## Conclusion

This implementation guide provides a comprehensive foundation for building a robust, scalable categories management system for the Quickcrate Merchant Dashboard. The system supports:

- **Hierarchical category structure** with proper data integrity
- **Multi-tenant architecture** with merchant isolation
- **RESTful API design** with comprehensive CRUD operations
- **Performance optimization** with caching and indexing strategies
- **Security best practices** with JWT authentication and authorization
- **Comprehensive testing** with unit and integration tests
- **Production-ready features** including logging, validation, and error handling

The implementation follows industry best practices and provides a solid foundation that can be extended as business requirements evolve.