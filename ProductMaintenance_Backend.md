# Product Maintenance Backend - .NET 8 Clean Architecture Guide

## 1. Overview

The Product Maintenance module is the core backend service for managing products within the Merchant Dashboard system. It provides secure, scalable, and maintainable APIs for merchants to manage their product catalogs.

### Purpose & Role
- **Central Product Management**: Handle all product-related operations for merchants
- **Data Integrity**: Ensure product data consistency and validation
- **Security**: Protect merchant data with proper authentication and authorization
- **Scalability**: Support high-volume product operations with efficient data access

### Core Features
- ✅ **CRUD Operations**: Create, Read, Update, Delete products
- ✅ **Validation**: Comprehensive input validation and business rules
- ✅ **Authentication**: JWT-based secure access
- ✅ **Authorization**: Merchant-level access control
- ✅ **Soft Deletion**: Maintain data integrity with logical deletion
- ✅ **Image Management**: Support for product image uploads
- ✅ **Audit Trail**: Track changes with timestamps and user information

## 2. Architecture & Project Structure

### Recommended Folder Structure
```
ProductMaintenance.API/
├── Controllers/
│   └── ProductsController.cs
├── Services/
│   ├── Interfaces/
│   │   └── IProductService.cs
│   └── ProductService.cs
├── Repositories/
│   ├── Interfaces/
│   │   └── IProductRepository.cs
│   └── ProductRepository.cs
├── Models/
│   ├── Entities/
│   │   ├── Product.cs
│   │   └── Merchant.cs
│   └── DTOs/
│       ├── CreateProductDto.cs
│       ├── UpdateProductDto.cs
│       └── ProductResponseDto.cs
├── Mappings/
│   └── ProductMappingProfile.cs
├── Validators/
│   └── ProductValidators.cs
├── Middleware/
│   └── ErrorHandlingMiddleware.cs
└── Data/
    ├── ApplicationDbContext.cs
    └── Configurations/
```

### Layer Interactions
```
Client Request → Controller → Service → Repository → Database
      ↓              ↓         ↓          ↓
   JWT Auth → Validation → Business Logic → Data Access → EF Core
```

## 3. Implementation Details

### 3.1 Product Entity Model

```csharp
public class Product : BaseEntity
{
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string SKU { get; set; } = string.Empty;
    
    // Category Information
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? SubCategoryId { get; set; }
    public string? SubCategoryName { get; set; }
    
    // Product Details
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public decimal? Weight { get; set; }
    public string? Dimensions { get; set; }
    public string? Material { get; set; }
    public string? Tags { get; set; }
    
    // Status & Features
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public string Status { get; set; } = "pending";
    
    // Images
    public List<string> ImageUrls { get; set; } = new();
    
    // Merchant Relationship
    public int MerchantId { get; set; }
    public Merchant Merchant { get; set; } = null!;
    
    // Audit Fields
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedOn { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedOn { get; set; }
    public string? DeletedBy { get; set; }
}

public abstract class BaseEntity
{
    public int Id { get; set; }
}

public class Merchant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty; // Link to Identity User
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
```

### 3.2 Data Transfer Objects (DTOs)

```csharp
// Create Product DTO
public class CreateProductDto
{
    [Required]
    [StringLength(255)]
    public string ProductName { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public string ProductDescription { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string CategoryName { get; set; } = string.Empty;
    
    public int? SubCategoryId { get; set; }
    public string? SubCategoryName { get; set; }
    public int? SubSubCategoryId { get; set; }
    public string? SubSubCategoryName { get; set; }
    
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public decimal? Weight { get; set; }
    public string? Dimensions { get; set; }
    public string? Material { get; set; }
    public string? Tags { get; set; }
    public string? SKU { get; set; }
    
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public string Status { get; set; } = "pending";
    
    public List<IFormFile>? ProductImages { get; set; }
}

// Update Product DTO (supports partial updates)
public class UpdateProductDto
{
    public string? ProductName { get; set; }
    public string? Description { get; set; }
    public string? ProductDescription { get; set; }
    public decimal? Price { get; set; }
    public int? StockQuantity { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public string? Color { get; set; }
    public string? Size { get; set; }
    public decimal? Weight { get; set; }
    public string? Dimensions { get; set; }
    public string? Material { get; set; }
    public string? Tags { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public string? Status { get; set; }
    public List<IFormFile>? NewImages { get; set; }
    public List<string>? ImageUrlsToRemove { get; set; }
}

// Product Response DTO
public class ProductResponseDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
}
```

### 3.3 Repository Pattern Implementation

```csharp
public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id, int merchantId);
    Task<PagedResult<Product>> GetAllAsync(int merchantId, ProductFilter filter);
    Task<Product> CreateAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task<bool> SoftDeleteAsync(int id, int merchantId, string deletedBy);
    Task<bool> ExistsAsync(int id, int merchantId);
}

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProductRepository> _logger;

    public ProductRepository(ApplicationDbContext context, ILogger<ProductRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Product?> GetByIdAsync(int id, int merchantId)
    {
        return await _context.Products
            .Where(p => p.Id == id && p.MerchantId == merchantId && !p.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<PagedResult<Product>> GetAllAsync(int merchantId, ProductFilter filter)
    {
        var query = _context.Products
            .Where(p => p.MerchantId == merchantId && !p.IsDeleted);

        // Apply filters
        if (!string.IsNullOrEmpty(filter.Search))
        {
            query = query.Where(p => p.ProductName.Contains(filter.Search) || 
                                   p.Description.Contains(filter.Search));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == filter.CategoryId);
        }

        if (!string.IsNullOrEmpty(filter.Status))
        {
            query = query.Where(p => p.Status == filter.Status);
        }

        // Apply sorting
        query = filter.SortBy?.ToLower() switch
        {
            "name" => filter.SortOrder == "desc" ? 
                query.OrderByDescending(p => p.ProductName) : 
                query.OrderBy(p => p.ProductName),
            "price" => filter.SortOrder == "desc" ? 
                query.OrderByDescending(p => p.Price) : 
                query.OrderBy(p => p.Price),
            "created" => filter.SortOrder == "desc" ? 
                query.OrderByDescending(p => p.CreatedOn) : 
                query.OrderBy(p => p.CreatedOn),
            _ => query.OrderByDescending(p => p.CreatedOn)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResult<Product>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<Product> CreateAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Product created with ID: {ProductId}", product.Id);
        return product;
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        product.UpdatedOn = DateTime.UtcNow;
        _context.Products.Update(product);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Product updated with ID: {ProductId}", product.Id);
        return product;
    }

    public async Task<bool> SoftDeleteAsync(int id, int merchantId, string deletedBy)
    {
        var product = await GetByIdAsync(id, merchantId);
        if (product == null) return false;

        product.IsDeleted = true;
        product.DeletedOn = DateTime.UtcNow;
        product.DeletedBy = deletedBy;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Product soft deleted with ID: {ProductId}", id);
        return true;
    }

    public async Task<bool> ExistsAsync(int id, int merchantId)
    {
        return await _context.Products
            .AnyAsync(p => p.Id == id && p.MerchantId == merchantId && !p.IsDeleted);
    }
}
```

### 3.4 Service Layer Implementation

```csharp
public interface IProductService
{
    Task<ProductResponseDto> CreateProductAsync(CreateProductDto dto, int merchantId, string userId);
    Task<ProductResponseDto> UpdateProductAsync(int id, UpdateProductDto dto, int merchantId, string userId);
    Task<ProductResponseDto?> GetProductAsync(int id, int merchantId);
    Task<PagedResult<ProductResponseDto>> GetProductsAsync(int merchantId, ProductFilter filter);
    Task<bool> DeleteProductAsync(int id, int merchantId, string userId);
}

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        IProductRepository productRepository,
        IMapper mapper,
        IImageService imageService,
        ILogger<ProductService> logger)
    {
        _productRepository = productRepository;
        _mapper = mapper;
        _imageService = imageService;
        _logger = logger;
    }

    public async Task<ProductResponseDto> CreateProductAsync(CreateProductDto dto, int merchantId, string userId)
    {
        try
        {
            _logger.LogInformation("Creating product for merchant {MerchantId}", merchantId);

            // Map DTO to entity
            var product = _mapper.Map<Product>(dto);
            product.MerchantId = merchantId;
            product.CreatedOn = DateTime.UtcNow;
            product.CreatedBy = userId;
            product.SKU = await GenerateSkuAsync();

            // Handle image uploads
            if (dto.ProductImages?.Any() == true)
            {
                var imageUrls = await _imageService.UploadImagesAsync(dto.ProductImages);
                product.ImageUrls = imageUrls;
            }

            // Create product
            var createdProduct = await _productRepository.CreateAsync(product);
            
            _logger.LogInformation("Product created successfully with ID: {ProductId}", createdProduct.Id);
            return _mapper.Map<ProductResponseDto>(createdProduct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product for merchant {MerchantId}", merchantId);
            throw;
        }
    }

    public async Task<ProductResponseDto> UpdateProductAsync(int id, UpdateProductDto dto, int merchantId, string userId)
    {
        try
        {
            _logger.LogInformation("Updating product {ProductId} for merchant {MerchantId}", id, merchantId);

            var existingProduct = await _productRepository.GetByIdAsync(id, merchantId);
            if (existingProduct == null)
                throw new NotFoundException($"Product with ID {id} not found");

            // Apply partial updates
            _mapper.Map(dto, existingProduct);
            existingProduct.UpdatedBy = userId;
            existingProduct.UpdatedOn = DateTime.UtcNow;

            // Handle image updates
            if (dto.NewImages?.Any() == true)
            {
                var newImageUrls = await _imageService.UploadImagesAsync(dto.NewImages);
                existingProduct.ImageUrls.AddRange(newImageUrls);
            }

            if (dto.ImageUrlsToRemove?.Any() == true)
            {
                foreach (var url in dto.ImageUrlsToRemove)
                {
                    existingProduct.ImageUrls.Remove(url);
                    await _imageService.DeleteImageAsync(url);
                }
            }

            var updatedProduct = await _productRepository.UpdateAsync(existingProduct);
            
            _logger.LogInformation("Product updated successfully with ID: {ProductId}", id);
            return _mapper.Map<ProductResponseDto>(updatedProduct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product {ProductId} for merchant {MerchantId}", id, merchantId);
            throw;
        }
    }

    public async Task<ProductResponseDto?> GetProductAsync(int id, int merchantId)
    {
        var product = await _productRepository.GetByIdAsync(id, merchantId);
        return product == null ? null : _mapper.Map<ProductResponseDto>(product);
    }

    public async Task<PagedResult<ProductResponseDto>> GetProductsAsync(int merchantId, ProductFilter filter)
    {
        var result = await _productRepository.GetAllAsync(merchantId, filter);
        return new PagedResult<ProductResponseDto>
        {
            Items = _mapper.Map<List<ProductResponseDto>>(result.Items),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        };
    }

    public async Task<bool> DeleteProductAsync(int id, int merchantId, string userId)
    {
        _logger.LogInformation("Soft deleting product {ProductId} for merchant {MerchantId}", id, merchantId);
        return await _productRepository.SoftDeleteAsync(id, merchantId, userId);
    }

    private async Task<string> GenerateSkuAsync()
    {
        // Generate unique SKU logic
        return $"PRD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }
}
```

### 3.5 Controller Implementation

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct([FromForm] CreateProductDto dto)
    {
        var merchantId = GetMerchantId();
        var userId = GetUserId();
        
        var result = await _productService.CreateProductAsync(dto, merchantId, userId);
        return CreatedAtAction(nameof(GetProduct), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
    {
        var merchantId = GetMerchantId();
        var result = await _productService.GetProductAsync(id, merchantId);
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductResponseDto>>> GetProducts([FromQuery] ProductFilter filter)
    {
        var merchantId = GetMerchantId();
        var result = await _productService.GetProductsAsync(merchantId, filter);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductResponseDto>> UpdateProduct(int id, [FromForm] UpdateProductDto dto)
    {
        var merchantId = GetMerchantId();
        var userId = GetUserId();
        
        var result = await _productService.UpdateProductAsync(id, dto, merchantId, userId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var merchantId = GetMerchantId();
        var userId = GetUserId();
        
        var success = await _productService.DeleteProductAsync(id, merchantId, userId);
        if (!success)
            return NotFound();
            
        return NoContent();
    }

    private int GetMerchantId()
    {
        var merchantId = User.FindFirst("MerchantId")?.Value;
        if (string.IsNullOrEmpty(merchantId) || !int.TryParse(merchantId, out var id))
            throw new UnauthorizedAccessException("Invalid merchant ID");
        return id;
    }

    private string GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException("User ID not found");
    }
}
```

## 4. Validation & Error Handling

### 4.1 FluentValidation Implementation

```csharp
public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(255).WithMessage("Product name cannot exceed 255 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero")
            .LessThanOrEqualTo(999999.99m).WithMessage("Price cannot exceed 999,999.99");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category is required");

        RuleFor(x => x.ProductImages)
            .Must(images => images == null || images.Count <= 4)
            .WithMessage("Maximum 4 images allowed");

        RuleForEach(x => x.ProductImages)
            .Must(BeValidImage)
            .WithMessage("Invalid image file. Only JPEG, PNG, and WEBP files up to 10MB are allowed");
    }

    private bool BeValidImage(IFormFile file)
    {
        if (file == null) return true;
        
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        var maxSize = 10 * 1024 * 1024; // 10MB

        return allowedTypes.Contains(file.ContentType) && file.Length <= maxSize;
    }
}
```

### 4.2 Error Handling Middleware

```csharp
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = exception switch
        {
            NotFoundException => new ErrorResponse
            {
                StatusCode = 404,
                Message = exception.Message,
                Details = "The requested resource was not found"
            },
            ValidationException validationEx => new ErrorResponse
            {
                StatusCode = 400,
                Message = "Validation failed",
                Details = validationEx.Message,
                Errors = validationEx.Errors?.Select(e => e.ErrorMessage).ToList()
            },
            UnauthorizedAccessException => new ErrorResponse
            {
                StatusCode = 401,
                Message = "Unauthorized access",
                Details = exception.Message
            },
            _ => new ErrorResponse
            {
                StatusCode = 500,
                Message = "An internal server error occurred",
                Details = "Please try again later"
            }
        };

        response.StatusCode = errorResponse.StatusCode;
        await response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
}

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public List<string>? Errors { get; set; }
}
```

## 5. Authentication & Authorization

### 5.1 JWT Configuration

```csharp
public class JwtService
{
    private readonly IConfiguration _configuration;
    
    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(string userId, int merchantId, string email, List<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new("MerchantId", merchantId.ToString()),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### 5.2 Authorization Policy

```csharp
public class MerchantOwnershipHandler : AuthorizationHandler<MerchantOwnershipRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public MerchantOwnershipHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        MerchantOwnershipRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return Task.CompletedTask;

        var userMerchantId = context.User.FindFirst("MerchantId")?.Value;
        var requestedMerchantId = httpContext.Request.RouteValues["merchantId"]?.ToString();

        if (userMerchantId == requestedMerchantId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

## 6. Best Practices Implementation

### 6.1 Dependency Injection Setup

```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddProductServices(this IServiceCollection services)
    {
        // Repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        
        // Services
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IImageService, ImageService>();
        
        // AutoMapper
        services.AddAutoMapper(typeof(ProductMappingProfile));
        
        // Validators
        services.AddScoped<IValidator<CreateProductDto>, CreateProductDtoValidator>();
        services.AddScoped<IValidator<UpdateProductDto>, UpdateProductDtoValidator>();
        
        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
                };
            });

        return services;
    }
}
```

### 6.2 Logging Configuration

```csharp
public static class LoggingConfiguration
{
    public static IServiceCollection AddSerilogLogging(this IServiceCollection services, IConfiguration configuration)
    {
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "ProductMaintenance.API")
            .WriteTo.Console()
            .WriteTo.File("logs/product-maintenance-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        services.AddSerilog();
        return services;
    }
}
```

## 7. API Endpoints & Examples

### 7.1 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/Products/create` | Create new product |
| GET | `/api/Products` | Get all products (paginated) |
| GET | `/api/Products/{id}` | Get product by ID |
| PUT | `/api/Products/{id}` | Update product |
| DELETE | `/api/Products/{id}` | Soft delete product |

### 7.2 Request/Response Examples

#### Create Product Request
```json
POST /api/Products/create
Content-Type: multipart/form-data
Authorization: Bearer {jwt-token}

{
  "productName": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "productDescription": "The iPhone 15 Pro features a titanium design...",
  "price": 999.99,
  "stockQuantity": 50,
  "categoryId": 1,
  "categoryName": "Electronics",
  "subCategoryId": 1,
  "subCategoryName": "Smartphones",
  "brand": "Apple",
  "model": "iPhone 15 Pro",
  "color": "Natural Titanium",
  "size": "6.1 inch",
  "weight": 187,
  "tags": "smartphone,apple,5g,premium",
  "isActive": true,
  "isFeatured": true,
  "status": "pending"
}
```

#### Create Product Response
```json
{
  "id": 123,
  "productName": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "price": 999.99,
  "stockQuantity": 50,
  "sku": "PRD-20251020-A1B2C3D4",
  "categoryId": 1,
  "categoryName": "Electronics",
  "brand": "Apple",
  "model": "iPhone 15 Pro",
  "imageUrls": [
    "https://storage.example.com/products/123/image1.jpg",
    "https://storage.example.com/products/123/image2.jpg"
  ],
  "isActive": true,
  "isFeatured": true,
  "status": "pending",
  "createdOn": "2025-10-20T10:30:00Z",
  "updatedOn": null
}
```

#### Get Products Response (Paginated)
```json
{
  "items": [
    {
      "id": 123,
      "productName": "iPhone 15 Pro",
      "price": 999.99,
      "stockQuantity": 50,
      "categoryName": "Electronics",
      "status": "active",
      "createdOn": "2025-10-20T10:30:00Z"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

## 8. Optional Enhancements

### 8.1 Pagination & Filtering

```csharp
public class ProductFilter
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; } = "created";
    public string? SortOrder { get; set; } = "desc";
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
```

### 8.2 Image Upload Service

```csharp
public interface IImageService
{
    Task<List<string>> UploadImagesAsync(IEnumerable<IFormFile> images);
    Task<bool> DeleteImageAsync(string imageUrl);
}

public class ImageService : IImageService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ImageService> _logger;

    public ImageService(IConfiguration configuration, ILogger<ImageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<List<string>> UploadImagesAsync(IEnumerable<IFormFile> images)
    {
        var uploadedUrls = new List<string>();
        var uploadPath = _configuration["FileUpload:ProductImages:Path"];

        foreach (var image in images)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream);

            var imageUrl = $"{_configuration["FileUpload:BaseUrl"]}/products/{fileName}";
            uploadedUrls.Add(imageUrl);
            
            _logger.LogInformation("Image uploaded: {ImageUrl}", imageUrl);
        }

        return uploadedUrls;
    }

    public async Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            var fileName = Path.GetFileName(new Uri(imageUrl).LocalPath);
            var uploadPath = _configuration["FileUpload:ProductImages:Path"];
            var filePath = Path.Combine(uploadPath, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("Image deleted: {ImageUrl}", imageUrl);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {ImageUrl}", imageUrl);
            return false;
        }
    }
}
```

### 8.3 Audit Trail Implementation

```csharp
public class AuditEntry
{
    public string EntityName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Create, Update, Delete
    public string EntityId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
}

public class AuditableDbContext : DbContext
{
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = OnBeforeSaveChanges();
        var result = await base.SaveChangesAsync(cancellationToken);
        await OnAfterSaveChanges(auditEntries);
        return result;
    }

    private List<AuditEntry> OnBeforeSaveChanges()
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is not IAuditable || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry
            {
                EntityName = entry.Entity.GetType().Name,
                Action = entry.State.ToString(),
                EntityId = entry.Property("Id").CurrentValue?.ToString() ?? "",
                Timestamp = DateTime.UtcNow
            };

            auditEntries.Add(auditEntry);
        }

        return auditEntries;
    }

    private async Task OnAfterSaveChanges(List<AuditEntry> auditEntries)
    {
        if (auditEntries.Any())
        {
            AuditTrail.AddRange(auditEntries);
            await base.SaveChangesAsync();
        }
    }

    public DbSet<AuditEntry> AuditTrail { get; set; }
}
```

## Conclusion

This comprehensive backend implementation provides:

- ✅ **Secure & Scalable Architecture**: Clean Architecture with proper separation of concerns
- ✅ **Complete CRUD Operations**: All product management operations with proper validation
- ✅ **Authentication & Authorization**: JWT-based security with merchant-level access control
- ✅ **Error Handling**: Centralized error management with proper HTTP status codes
- ✅ **Best Practices**: Async/await, DI, Repository pattern, comprehensive logging
- ✅ **Production Ready**: Includes pagination, filtering, image upload, and audit trails

The implementation follows .NET 8 best practices and provides a robust foundation for a production merchant dashboard system.