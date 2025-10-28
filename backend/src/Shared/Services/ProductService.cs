using AutoMapper;
using MerchantService.Data;
using MerchantService.Model;
using MerchantService.Model.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MerchantService.Services
{
    public class ProductService : IProductService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IApplicationDbContext context, IMapper mapper, ILogger<ProductService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        #region Basic CRUD Operations

        public async Task<ProductResponseDto?> GetByIdAsync(Guid productId)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Merchant)
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                return product == null ? null : _mapper.Map<ProductResponseDto>(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product with ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<PagedResultDto<ProductListDto>> GetAllAsync(ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => !p.IsDeleted);

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all products");
                throw;
            }
        }

        public async Task<PagedResultDto<ProductListDto>> GetProductsByMerchantIdAsync(Guid merchantId, ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted);

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<PagedResultDto<ProductListDto>> GetProductsByCategoryAsync(Guid categoryId, ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => p.CategoryId == categoryId && !p.IsDeleted);

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for category: {CategoryId}", categoryId);
                throw;
            }
        }

        public async Task<ProductResponseDto> CreateAsync(CreateProductDto createProductDto, string createdBy)
        {
            try
            {
                // Validate SKU uniqueness if provided
                if (!string.IsNullOrEmpty(createProductDto.SKU))
                {
                    var skuExists = await IsSkuUniqueAsync(createProductDto.SKU, createProductDto.MerchantID);
                    if (!skuExists)
                    {
                        throw new ArgumentException($"SKU '{createProductDto.SKU}' already exists for this merchant.");
                    }
                }

                var product = _mapper.Map<Product>(createProductDto);
                product.CreatedBy = createdBy;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return await GetByIdAsync(product.ProductId) ?? throw new InvalidOperationException("Failed to retrieve created product");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product for merchant: {MerchantId}", createProductDto.MerchantID);
                throw;
            }
        }

        public async Task<ProductResponseDto> UpdateAsync(UpdateProductDto updateProductDto, string updatedBy)
        {
            try
            {
                var existingProduct = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == updateProductDto.ProductId && !p.IsDeleted);

                if (existingProduct == null)
                {
                    throw new ArgumentException($"Product with ID {updateProductDto.ProductId} not found or has been deleted.");
                }

                // Validate SKU uniqueness if changed
                if (!string.IsNullOrEmpty(updateProductDto.SKU) && updateProductDto.SKU != existingProduct.SKU)
                {
                    var skuExists = await IsSkuUniqueAsync(updateProductDto.SKU, existingProduct.MerchantID, updateProductDto.ProductId);
                    if (!skuExists)
                    {
                        throw new ArgumentException($"SKU '{updateProductDto.SKU}' already exists for this merchant.");
                    }
                }

                _mapper.Map(updateProductDto, existingProduct);
                existingProduct.UpdatedBy = updatedBy;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(existingProduct.ProductId) ?? throw new InvalidOperationException("Failed to retrieve updated product");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product: {ProductId}", updateProductDto.ProductId);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid productId, string deletedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} permanently deleted by {DeletedBy}", productId, deletedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product: {ProductId}", productId);
                throw;
            }
        }

        #endregion

        #region Advanced Operations

        public async Task<bool> SoftDeleteAsync(Guid productId, string deletedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.IsDeleted = true;
                product.DeletedBy = deletedBy;
                product.DeletedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} soft deleted by {DeletedBy}", productId, deletedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting product: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> RestoreAsync(Guid productId, string restoredBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && p.IsDeleted);

                if (product == null) return false;

                product.IsDeleted = false;
                product.DeletedBy = null;
                product.DeletedOn = null;
                product.UpdatedBy = restoredBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} restored by {RestoredBy}", productId, restoredBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring product: {ProductId}", productId);
                throw;
            }
        }

        public async Task<PagedResultDto<ProductListDto>> GetDeletedProductsAsync(Guid merchantId, ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => p.MerchantID == merchantId && p.IsDeleted);

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deleted products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        #endregion

        #region Bulk Operations

        public async Task<bool> BulkUpdateStatusAsync(BulkUpdateProductStatusDto bulkUpdateDto, string updatedBy)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => bulkUpdateDto.ProductIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                foreach (var product in products)
                {
                    product.Status = bulkUpdateDto.Status;
                    product.UpdatedBy = updatedBy;
                    product.UpdatedOn = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Bulk status update completed for {Count} products by {UpdatedBy}", 
                    products.Count, updatedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk status update");
                throw;
            }
        }

        public async Task<bool> BulkDeleteAsync(BulkDeleteProductDto bulkDeleteDto, string deletedBy)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => bulkDeleteDto.ProductIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                _context.Products.RemoveRange(products);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Bulk delete completed for {Count} products by {DeletedBy}", 
                    products.Count, deletedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk delete");
                throw;
            }
        }

        public async Task<bool> BulkSoftDeleteAsync(BulkDeleteProductDto bulkDeleteDto, string deletedBy)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => bulkDeleteDto.ProductIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                foreach (var product in products)
                {
                    product.IsDeleted = true;
                    product.DeletedBy = deletedBy;
                    product.DeletedOn = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Bulk soft delete completed for {Count} products by {DeletedBy}", 
                    products.Count, deletedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk soft delete");
                throw;
            }
        }

        #endregion

        #region Status Management

        public async Task<bool> UpdateStatusAsync(Guid productId, string status, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.Status = status;
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product status: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> ToggleActiveStatusAsync(Guid productId, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.IsActive = !product.IsActive;
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active status: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> ToggleFeaturedStatusAsync(Guid productId, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.IsFeatured = !product.IsFeatured;
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling featured status: {ProductId}", productId);
                throw;
            }
        }

        #endregion

        #region Stock Management

        public async Task<bool> UpdateStockAsync(Guid productId, int newStock, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.StockQuantity = newStock;
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> AdjustStockAsync(Guid productId, int adjustment, string updatedBy, string reason)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.StockQuantity = Math.Max(0, product.StockQuantity + adjustment);
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stock adjusted for product {ProductId}: {Adjustment} units. Reason: {Reason}", 
                    productId, adjustment, reason);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adjusting stock: {ProductId}", productId);
                throw;
            }
        }

        public async Task<List<ProductSummaryDto>> GetLowStockProductsAsync(Guid merchantId, int threshold = 10)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted && p.StockQuantity <= threshold && p.IsActive)
                    .OrderBy(p => p.StockQuantity)
                    .ToListAsync();

                return _mapper.Map<List<ProductSummaryDto>>(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving low stock products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<List<ProductSummaryDto>> GetOutOfStockProductsAsync(Guid merchantId)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted && p.StockQuantity == 0 && p.IsActive)
                    .OrderBy(p => p.ProductName)
                    .ToListAsync();

                return _mapper.Map<List<ProductSummaryDto>>(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving out of stock products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        #endregion

        #region Category-based Queries

        public async Task<PagedResultDto<ProductListDto>> GetProductsBySubCategoryAsync(Guid subCategoryId, ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => p.SubCategoryId == subCategoryId && !p.IsDeleted);

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for subcategory: {SubCategoryId}", subCategoryId);
                throw;
            }
        }

        public async Task<PagedResultDto<ProductListDto>> GetProductsBySubSubCategoryAsync(Guid subSubCategoryId, ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => p.SubSubCategoryId == subSubCategoryId && !p.IsDeleted);

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for sub-subcategory: {SubSubCategoryId}", subSubCategoryId);
                throw;
            }
        }

        #endregion

        #region Search and Filtering

        public async Task<PagedResultDto<ProductListDto>> SearchProductsAsync(string searchTerm, Guid? merchantId, ProductFilterDto filter)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.SubCategory)
                    .Include(p => p.SubSubCategory)
                    .Where(p => !p.IsDeleted);

                if (merchantId.HasValue)
                {
                    query = query.Where(p => p.MerchantID == merchantId.Value);
                }

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(p => 
                        p.ProductName.Contains(searchTerm) ||
                        p.Description.Contains(searchTerm) ||
                        p.SKU.Contains(searchTerm) ||
                        p.CategoryName.Contains(searchTerm) ||
                        (p.SubCategoryName != null && p.SubCategoryName.Contains(searchTerm)) ||
                        (p.SubSubCategoryName != null && p.SubSubCategoryName.Contains(searchTerm)));
                }

                query = ApplyFilters(query, filter);
                
                return await GetPagedResultAsync(query, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products with term: {SearchTerm}", searchTerm);
                throw;
            }
        }

        public async Task<List<ProductSummaryDto>> GetFeaturedProductsAsync(Guid merchantId, int count = 10)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted && p.IsFeatured && p.IsActive)
                    .OrderBy(p => p.CreatedOn)
                    .Take(count)
                    .ToListAsync();

                return _mapper.Map<List<ProductSummaryDto>>(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving featured products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<List<ProductSummaryDto>> GetRecentProductsAsync(Guid merchantId, int count = 10)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted && p.IsActive)
                    .OrderByDescending(p => p.CreatedOn)
                    .Take(count)
                    .ToListAsync();

                return _mapper.Map<List<ProductSummaryDto>>(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        #endregion

        #region Analytics and Statistics

        public async Task<ProductStatisticsDto> GetProductStatisticsAsync(Guid merchantId)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted)
                    .ToListAsync();

                var statistics = new ProductStatisticsDto
                {
                    TotalProducts = products.Count,
                    ActiveProducts = products.Count(p => p.IsActive),
                    InactiveProducts = products.Count(p => !p.IsActive),
                    FeaturedProducts = products.Count(p => p.IsFeatured),
                    OutOfStockProducts = products.Count(p => p.StockQuantity == 0),
                    LowStockProducts = products.Count(p => p.StockQuantity > 0 && p.StockQuantity <= 10),
                    TotalInventoryValue = products.Sum(p => p.Price * p.StockQuantity),
                    ProductsByStatus = products.GroupBy(p => p.Status).ToDictionary(g => g.Key, g => g.Count()),
                    ProductsByCategory = products.GroupBy(p => p.CategoryName).ToDictionary(g => g.Key, g => g.Count())
                };

                return statistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product statistics for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<Dictionary<string, int>> GetProductCountByCategoryAsync(Guid merchantId)
        {
            try
            {
                var categoryStats = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted && p.IsActive)
                    .GroupBy(p => p.CategoryName)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());

                return categoryStats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product count by category for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<Dictionary<string, decimal>> GetInventoryValueByCategoryAsync(Guid merchantId)
        {
            try
            {
                var valueStats = await _context.Products
                    .Where(p => p.MerchantID == merchantId && !p.IsDeleted && p.IsActive)
                    .GroupBy(p => p.CategoryName)
                    .ToDictionaryAsync(g => g.Key, g => g.Sum(p => p.Price * p.StockQuantity));

                return valueStats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving inventory value by category for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        #endregion

        #region Validation and Business Logic

        public async Task<bool> IsSkuUniqueAsync(string sku, Guid merchantId, Guid? excludeProductId = null)
        {
            try
            {
                var query = _context.Products
                    .Where(p => p.SKU == sku && p.MerchantID == merchantId && !p.IsDeleted);

                if (excludeProductId.HasValue)
                {
                    query = query.Where(p => p.ProductId != excludeProductId.Value);
                }

                return !await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking SKU uniqueness: {SKU}", sku);
                throw;
            }
        }

        public async Task<bool> ProductExistsAsync(Guid productId)
        {
            try
            {
                return await _context.Products.AnyAsync(p => p.ProductId == productId && !p.IsDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking product existence: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> ProductBelongsToMerchantAsync(Guid productId, Guid merchantId)
        {
            try
            {
                return await _context.Products
                    .AnyAsync(p => p.ProductId == productId && p.MerchantID == merchantId && !p.IsDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking product ownership: {ProductId}", productId);
                throw;
            }
        }

        #endregion

        #region Import/Export

        public async Task<List<ProductResponseDto>> ImportProductsAsync(List<CreateProductDto> products, string createdBy)
        {
            try
            {
                var createdProducts = new List<ProductResponseDto>();

                foreach (var productDto in products)
                {
                    try
                    {
                        var createdProduct = await CreateAsync(productDto, createdBy);
                        createdProducts.Add(createdProduct);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to import product: {ProductName}", productDto.ProductName);
                        // Continue with other products
                    }
                }

                _logger.LogInformation("Import completed: {SuccessCount}/{TotalCount} products", 
                    createdProducts.Count, products.Count);

                return createdProducts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during product import");
                throw;
            }
        }

        public async Task<byte[]> ExportProductsAsync(Guid merchantId, ProductFilterDto filter)
        {
            try
            {
                var products = await GetProductsByMerchantIdAsync(merchantId, filter);
                
                // This is a simplified implementation. You might want to use a proper CSV/Excel library
                var csv = "ProductId,ProductName,Price,StockQuantity,CategoryName,Status,CreatedOn\n";
                
                foreach (var product in products.Data)
                {
                    csv += $"{product.ProductId},{product.ProductName},{product.Price},{product.StockQuantity}," +
                          $"{product.CategoryName},{product.Status},{product.CreatedOn:yyyy-MM-dd}\n";
                }

                return System.Text.Encoding.UTF8.GetBytes(csv);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting products for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        #endregion

        #region Image Management

        public async Task<bool> UpdateProductImagesAsync(Guid productId, List<string> imageUrls, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.ImageUrls = JsonSerializer.Serialize(imageUrls);
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product images: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> AddProductImageAsync(Guid productId, string imageUrl, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                var currentImages = product.ImageUrlsList;
                if (!currentImages.Contains(imageUrl))
                {
                    currentImages.Add(imageUrl);
                    product.ImageUrlsList = currentImages;
                    product.UpdatedBy = updatedBy;
                    product.UpdatedOn = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding product image: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> RemoveProductImageAsync(Guid productId, string imageUrl, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                var currentImages = product.ImageUrlsList;
                if (currentImages.Remove(imageUrl))
                {
                    product.ImageUrlsList = currentImages;
                    product.UpdatedBy = updatedBy;
                    product.UpdatedOn = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing product image: {ProductId}", productId);
                throw;
            }
        }

        #endregion

        #region Pricing

        public async Task<bool> UpdatePriceAsync(Guid productId, decimal newPrice, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.Price = newPrice;
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product price: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> ApplyDiscountAsync(Guid productId, decimal discount, string updatedBy)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (product == null) return false;

                product.Discount = discount;
                product.UpdatedBy = updatedBy;
                product.UpdatedOn = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying discount to product: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> BulkUpdatePricesAsync(List<Guid> productIds, decimal priceAdjustment, bool isPercentage, string updatedBy)
        {
            try
            {
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                foreach (var product in products)
                {
                    if (isPercentage)
                    {
                        product.Price = product.Price * (1 + (priceAdjustment / 100));
                    }
                    else
                    {
                        product.Price = Math.Max(0.01m, product.Price + priceAdjustment);
                    }

                    product.UpdatedBy = updatedBy;
                    product.UpdatedOn = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Bulk price update completed for {Count} products by {UpdatedBy}", 
                    products.Count, updatedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk price update");
                throw;
            }
        }

        #endregion

        #region Duplicate and Copy

        public async Task<ProductResponseDto> DuplicateProductAsync(Guid productId, string newProductName, string createdBy)
        {
            try
            {
                var originalProduct = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == productId && !p.IsDeleted);

                if (originalProduct == null)
                {
                    throw new ArgumentException($"Product with ID {productId} not found.");
                }

                var duplicateProduct = new Product
                {
                    ProductId = Guid.NewGuid(),
                    ProductName = newProductName,
                    Description = originalProduct.Description,
                    ProductDescription = originalProduct.ProductDescription,
                    Price = originalProduct.Price,
                    Discount = originalProduct.Discount,
                    StockQuantity = 0, // New products start with 0 stock
                    SKU = $"{originalProduct.SKU}-COPY", // Ensure unique SKU
                    CategoryId = originalProduct.CategoryId,
                    CategoryName = originalProduct.CategoryName,
                    SubCategoryId = originalProduct.SubCategoryId,
                    SubCategoryName = originalProduct.SubCategoryName,
                    SubSubCategoryId = originalProduct.SubSubCategoryId,
                    SubSubCategoryName = originalProduct.SubSubCategoryName,
                    ProductSpecification = originalProduct.ProductSpecification,
                    Features = originalProduct.Features,
                    BoxContents = originalProduct.BoxContents,
                    ProductType = originalProduct.ProductType,
                    IsActive = false, // Duplicates start as inactive
                    IsFeatured = false,
                    Status = "pending",
                    ImageUrls = originalProduct.ImageUrls,
                    MerchantID = originalProduct.MerchantID,
                    CreatedBy = createdBy,
                    CreatedOn = DateTime.UtcNow
                };

                _context.Products.Add(duplicateProduct);
                await _context.SaveChangesAsync();

                return await GetByIdAsync(duplicateProduct.ProductId) ?? 
                    throw new InvalidOperationException("Failed to retrieve duplicated product");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error duplicating product: {ProductId}", productId);
                throw;
            }
        }

        public async Task<List<ProductResponseDto>> CopyProductsToMerchantAsync(List<Guid> productIds, Guid targetMerchantId, string createdBy)
        {
            try
            {
                var originalProducts = await _context.Products
                    .Where(p => productIds.Contains(p.ProductId) && !p.IsDeleted)
                    .ToListAsync();

                var copiedProducts = new List<ProductResponseDto>();

                foreach (var originalProduct in originalProducts)
                {
                    var copiedProduct = new Product
                    {
                        ProductId = Guid.NewGuid(),
                        ProductName = originalProduct.ProductName,
                        Description = originalProduct.Description,
                        ProductDescription = originalProduct.ProductDescription,
                        Price = originalProduct.Price,
                        Discount = originalProduct.Discount,
                        StockQuantity = 0, // New products start with 0 stock
                        SKU = $"{originalProduct.SKU}-MERCHANT-COPY",
                        CategoryId = originalProduct.CategoryId,
                        CategoryName = originalProduct.CategoryName,
                        SubCategoryId = originalProduct.SubCategoryId,
                        SubCategoryName = originalProduct.SubCategoryName,
                        SubSubCategoryId = originalProduct.SubSubCategoryId,
                        SubSubCategoryName = originalProduct.SubSubCategoryName,
                        ProductSpecification = originalProduct.ProductSpecification,
                        Features = originalProduct.Features,
                        BoxContents = originalProduct.BoxContents,
                        ProductType = originalProduct.ProductType,
                        IsActive = false, // Copied products start as inactive
                        IsFeatured = false,
                        Status = "pending",
                        ImageUrls = originalProduct.ImageUrls,
                        MerchantID = targetMerchantId,
                        CreatedBy = createdBy,
                        CreatedOn = DateTime.UtcNow
                    };

                    _context.Products.Add(copiedProduct);
                    await _context.SaveChangesAsync();

                    var copiedProductDto = await GetByIdAsync(copiedProduct.ProductId);
                    if (copiedProductDto != null)
                    {
                        copiedProducts.Add(copiedProductDto);
                    }
                }

                _logger.LogInformation("Copied {Count} products to merchant {TargetMerchantId}", 
                    copiedProducts.Count, targetMerchantId);

                return copiedProducts;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error copying products to merchant: {TargetMerchantId}", targetMerchantId);
                throw;
            }
        }

        #endregion

        #region Helper Methods

        private IQueryable<Product> ApplyFilters(IQueryable<Product> query, ProductFilterDto filter)
        {
            if (filter.MerchantId.HasValue)
            {
                query = query.Where(p => p.MerchantID == filter.MerchantId.Value);
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            if (filter.SubCategoryId.HasValue)
            {
                query = query.Where(p => p.SubCategoryId == filter.SubCategoryId.Value);
            }

            if (filter.SubSubCategoryId.HasValue)
            {
                query = query.Where(p => p.SubSubCategoryId == filter.SubSubCategoryId.Value);
            }

            if (!string.IsNullOrEmpty(filter.ProductName))
            {
                query = query.Where(p => p.ProductName.Contains(filter.ProductName));
            }

            if (!string.IsNullOrEmpty(filter.SKU))
            {
                query = query.Where(p => p.SKU.Contains(filter.SKU));
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(p => p.IsActive == filter.IsActive.Value);
            }

            if (filter.IsFeatured.HasValue)
            {
                query = query.Where(p => p.IsFeatured == filter.IsFeatured.Value);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(p => p.Status == filter.Status);
            }

            if (!string.IsNullOrEmpty(filter.ProductType))
            {
                query = query.Where(p => p.ProductType.Contains(filter.ProductType));
            }

            if (filter.CreatedFrom.HasValue)
            {
                query = query.Where(p => p.CreatedOn >= filter.CreatedFrom.Value);
            }

            if (filter.CreatedTo.HasValue)
            {
                query = query.Where(p => p.CreatedOn <= filter.CreatedTo.Value);
            }

            if (filter.MinStock.HasValue)
            {
                query = query.Where(p => p.StockQuantity >= filter.MinStock.Value);
            }

            if (filter.MaxStock.HasValue)
            {
                query = query.Where(p => p.StockQuantity <= filter.MaxStock.Value);
            }

            // Apply sorting
            query = filter.SortBy.ToLower() switch
            {
                "productname" => filter.SortDirection.ToUpper() == "ASC" ? 
                    query.OrderBy(p => p.ProductName) : query.OrderByDescending(p => p.ProductName),
                "price" => filter.SortDirection.ToUpper() == "ASC" ? 
                    query.OrderBy(p => p.Price) : query.OrderByDescending(p => p.Price),
                "stockquantity" => filter.SortDirection.ToUpper() == "ASC" ? 
                    query.OrderBy(p => p.StockQuantity) : query.OrderByDescending(p => p.StockQuantity),
                "updatedon" => filter.SortDirection.ToUpper() == "ASC" ? 
                    query.OrderBy(p => p.UpdatedOn) : query.OrderByDescending(p => p.UpdatedOn),
                _ => filter.SortDirection.ToUpper() == "ASC" ? 
                    query.OrderBy(p => p.CreatedOn) : query.OrderByDescending(p => p.CreatedOn)
            };

            return query;
        }

        private async Task<PagedResultDto<ProductListDto>> GetPagedResultAsync(IQueryable<Product> query, ProductFilterDto filter)
        {
            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

            var products = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var productDtos = _mapper.Map<List<ProductListDto>>(products);

            return new PagedResultDto<ProductListDto>
            {
                Data = productDtos,
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = totalPages,
                HasNextPage = filter.Page < totalPages,
                HasPreviousPage = filter.Page > 1
            };
        }

        #endregion
    }
}