using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MerchantService.Model.DTOs;
using MerchantService.Services;
using System.Security.Claims;

namespace MerchantService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(
            IProductService productService, 
            ICurrentUserService currentUserService,
            ILogger<ProductsController> logger)
        {
            _productService = productService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        #region Basic CRUD Operations

        /// <summary>
        /// Get a specific product by ID
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Product details</returns>
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ProductResponseDto>> GetById(Guid id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product {ProductId}", id);
                return StatusCode(500, "An error occurred while retrieving the product.");
            }
        }

        /// <summary>
        /// Get all products with filtering and pagination
        /// </summary>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated list of products</returns>
        [HttpPost("search")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetAll([FromBody] ProductFilterDto filter)
        {
            try
            {
                var result = await _productService.GetAllAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all products");
                return StatusCode(500, "An error occurred while retrieving products.");
            }
        }

        /// <summary>
        /// Get products by merchant ID
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated list of merchant's products</returns>
        [HttpPost("merchant/{merchantId:guid}")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetByMerchantId(
            Guid merchantId, 
            [FromBody] ProductFilterDto filter)
        {
            try
            {
                // Ensure merchants can only access their own products (unless admin)
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own products.");
                }

                var result = await _productService.GetProductsByMerchantIdAsync(merchantId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving merchant products.");
            }
        }

        /// <summary>
        /// Get products by category ID
        /// </summary>
        /// <param name="categoryId">Category ID</param>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated list of products in the category</returns>
        [HttpPost("category/{categoryId:guid}")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetByCategory(
            Guid categoryId, 
            [FromBody] ProductFilterDto filter)
        {
            try
            {
                var result = await _productService.GetProductsByCategoryAsync(categoryId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for category {CategoryId}", categoryId);
                return StatusCode(500, "An error occurred while retrieving category products.");
            }
        }

        /// <summary>
        /// Create a new product
        /// </summary>
        /// <param name="createProductDto">Product creation data</param>
        /// <returns>Created product details</returns>
        [HttpPost]
        public async Task<ActionResult<ProductResponseDto>> Create([FromBody] CreateProductDto createProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Ensure merchants can only create products for themselves (unless admin)
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (createProductDto.MerchantID != currentMerchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only create products for your own merchant account.");
                }

                var createdBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.CreateAsync(createProductDto, createdBy);

                return CreatedAtAction(nameof(GetById), new { id = result.ProductId }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, "An error occurred while creating the product.");
            }
        }

        /// <summary>
        /// Update an existing product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="updateProductDto">Product update data</param>
        /// <returns>Updated product details</returns>
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<ProductResponseDto>> Update(Guid id, [FromBody] UpdateProductDto updateProductDto)
        {
            try
            {
                if (id != updateProductDto.ProductId)
                {
                    return BadRequest("Product ID in URL does not match the ID in the request body.");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check if product exists and belongs to current merchant (unless admin)
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.UpdateAsync(updateProductDto, updatedBy);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", id);
                return StatusCode(500, "An error occurred while updating the product.");
            }
        }

        /// <summary>
        /// Permanently delete a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                // Check if product exists and belongs to current merchant (unless admin)
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only delete your own products.");
                    }
                }

                var deletedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.DeleteAsync(id, deletedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {ProductId}", id);
                return StatusCode(500, "An error occurred while deleting the product.");
            }
        }

        #endregion

        #region Advanced Operations

        /// <summary>
        /// Soft delete a product (mark as deleted without removing from database)
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Success status</returns>
        [HttpPost("{id:guid}/soft-delete")]
        public async Task<IActionResult> SoftDelete(Guid id)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only delete your own products.");
                    }
                }

                var deletedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.SoftDeleteAsync(id, deletedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product successfully soft deleted." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting product {ProductId}", id);
                return StatusCode(500, "An error occurred while soft deleting the product.");
            }
        }

        /// <summary>
        /// Restore a soft-deleted product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Success status</returns>
        [HttpPost("{id:guid}/restore")]
        public async Task<IActionResult> Restore(Guid id)
        {
            try
            {
                var restoredBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.RestoreAsync(id, restoredBy);

                if (!result)
                {
                    return NotFound($"Deleted product with ID {id} not found.");
                }

                return Ok(new { message = "Product successfully restored." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring product {ProductId}", id);
                return StatusCode(500, "An error occurred while restoring the product.");
            }
        }

        /// <summary>
        /// Get deleted products for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated list of deleted products</returns>
        [HttpPost("merchant/{merchantId:guid}/deleted")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetDeletedProducts(
            Guid merchantId, 
            [FromBody] ProductFilterDto filter)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own deleted products.");
                }

                var result = await _productService.GetDeletedProductsAsync(merchantId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving deleted products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving deleted products.");
            }
        }

        #endregion

        #region Bulk Operations

        /// <summary>
        /// Bulk update product status
        /// </summary>
        /// <param name="bulkUpdateDto">Bulk update data</param>
        /// <returns>Success status</returns>
        [HttpPost("bulk/update-status")]
        public async Task<IActionResult> BulkUpdateStatus([FromBody] BulkUpdateProductStatusDto bulkUpdateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.BulkUpdateStatusAsync(bulkUpdateDto, updatedBy);

                if (!result)
                {
                    return BadRequest("Bulk status update failed.");
                }

                return Ok(new { message = $"Successfully updated status for {bulkUpdateDto.ProductIds.Count} products." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk status update");
                return StatusCode(500, "An error occurred during bulk status update.");
            }
        }

        /// <summary>
        /// Bulk delete products (permanent)
        /// </summary>
        /// <param name="bulkDeleteDto">Bulk delete data</param>
        /// <returns>Success status</returns>
        [HttpPost("bulk/delete")]
        public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteProductDto bulkDeleteDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var deletedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.BulkDeleteAsync(bulkDeleteDto, deletedBy);

                if (!result)
                {
                    return BadRequest("Bulk delete failed.");
                }

                return Ok(new { message = $"Successfully deleted {bulkDeleteDto.ProductIds.Count} products." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk delete");
                return StatusCode(500, "An error occurred during bulk delete.");
            }
        }

        /// <summary>
        /// Bulk soft delete products
        /// </summary>
        /// <param name="bulkDeleteDto">Bulk delete data</param>
        /// <returns>Success status</returns>
        [HttpPost("bulk/soft-delete")]
        public async Task<IActionResult> BulkSoftDelete([FromBody] BulkDeleteProductDto bulkDeleteDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var deletedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.BulkSoftDeleteAsync(bulkDeleteDto, deletedBy);

                if (!result)
                {
                    return BadRequest("Bulk soft delete failed.");
                }

                return Ok(new { message = $"Successfully soft deleted {bulkDeleteDto.ProductIds.Count} products." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk soft delete");
                return StatusCode(500, "An error occurred during bulk soft delete.");
            }
        }

        #endregion

        #region Status Management

        /// <summary>
        /// Update product status
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="status">New status</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            try
            {
                if (string.IsNullOrEmpty(status))
                {
                    return BadRequest("Status is required.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.UpdateStatusAsync(id, status, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product status updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product status {ProductId}", id);
                return StatusCode(500, "An error occurred while updating product status.");
            }
        }

        /// <summary>
        /// Toggle product active status
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/toggle-active")]
        public async Task<IActionResult> ToggleActiveStatus(Guid id)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.ToggleActiveStatusAsync(id, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product active status toggled successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active status {ProductId}", id);
                return StatusCode(500, "An error occurred while toggling active status.");
            }
        }

        /// <summary>
        /// Toggle product featured status
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/toggle-featured")]
        public async Task<IActionResult> ToggleFeaturedStatus(Guid id)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.ToggleFeaturedStatusAsync(id, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product featured status toggled successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling featured status {ProductId}", id);
                return StatusCode(500, "An error occurred while toggling featured status.");
            }
        }

        #endregion

        #region Stock Management

        /// <summary>
        /// Update product stock quantity
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="newStock">New stock quantity</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/stock")]
        public async Task<IActionResult> UpdateStock(Guid id, [FromBody] int newStock)
        {
            try
            {
                if (newStock < 0)
                {
                    return BadRequest("Stock quantity cannot be negative.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.UpdateStockAsync(id, newStock, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product stock updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock {ProductId}", id);
                return StatusCode(500, "An error occurred while updating stock.");
            }
        }

        /// <summary>
        /// Adjust product stock (add or subtract)
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="adjustment">Stock adjustment (positive to add, negative to subtract)</param>
        /// <param name="reason">Reason for adjustment</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/stock/adjust")]
        public async Task<IActionResult> AdjustStock(Guid id, [FromBody] StockAdjustmentDto adjustmentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.AdjustStockAsync(id, adjustmentDto.Adjustment, updatedBy, adjustmentDto.Reason);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product stock adjusted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adjusting stock {ProductId}", id);
                return StatusCode(500, "An error occurred while adjusting stock.");
            }
        }

        /// <summary>
        /// Get low stock products for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="threshold">Stock threshold (default: 10)</param>
        /// <returns>List of low stock products</returns>
        [HttpGet("merchant/{merchantId:guid}/low-stock")]
        public async Task<ActionResult<List<ProductSummaryDto>>> GetLowStockProducts(Guid merchantId, [FromQuery] int threshold = 10)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own product data.");
                }

                var result = await _productService.GetLowStockProductsAsync(merchantId, threshold);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving low stock products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving low stock products.");
            }
        }

        /// <summary>
        /// Get out of stock products for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <returns>List of out of stock products</returns>
        [HttpGet("merchant/{merchantId:guid}/out-of-stock")]
        public async Task<ActionResult<List<ProductSummaryDto>>> GetOutOfStockProducts(Guid merchantId)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own product data.");
                }

                var result = await _productService.GetOutOfStockProductsAsync(merchantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving out of stock products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving out of stock products.");
            }
        }

        #endregion

        #region Category-based Queries

        /// <summary>
        /// Get products by subcategory ID
        /// </summary>
        /// <param name="subCategoryId">SubCategory ID</param>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated list of products in the subcategory</returns>
        [HttpPost("subcategory/{subCategoryId:guid}")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetBySubCategory(
            Guid subCategoryId, 
            [FromBody] ProductFilterDto filter)
        {
            try
            {
                var result = await _productService.GetProductsBySubCategoryAsync(subCategoryId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for subcategory {SubCategoryId}", subCategoryId);
                return StatusCode(500, "An error occurred while retrieving subcategory products.");
            }
        }

        /// <summary>
        /// Get products by sub-subcategory ID
        /// </summary>
        /// <param name="subSubCategoryId">SubSubCategory ID</param>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated list of products in the sub-subcategory</returns>
        [HttpPost("subsubcategory/{subSubCategoryId:guid}")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> GetBySubSubCategory(
            Guid subSubCategoryId, 
            [FromBody] ProductFilterDto filter)
        {
            try
            {
                var result = await _productService.GetProductsBySubSubCategoryAsync(subSubCategoryId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for sub-subcategory {SubSubCategoryId}", subSubCategoryId);
                return StatusCode(500, "An error occurred while retrieving sub-subcategory products.");
            }
        }

        #endregion

        #region Search and Filtering

        /// <summary>
        /// Search products by text
        /// </summary>
        /// <param name="searchTerm">Search term</param>
        /// <param name="merchantId">Optional merchant ID filter</param>
        /// <param name="filter">Filter and pagination parameters</param>
        /// <returns>Paginated search results</returns>
        [HttpPost("search/{searchTerm}")]
        public async Task<ActionResult<PagedResultDto<ProductListDto>>> SearchProducts(
            string searchTerm,
            [FromQuery] Guid? merchantId,
            [FromBody] ProductFilterDto filter)
        {
            try
            {
                var result = await _productService.SearchProductsAsync(searchTerm, merchantId, filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products with term {SearchTerm}", searchTerm);
                return StatusCode(500, "An error occurred while searching products.");
            }
        }

        /// <summary>
        /// Get featured products for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="count">Number of products to return (default: 10)</param>
        /// <returns>List of featured products</returns>
        [HttpGet("merchant/{merchantId:guid}/featured")]
        public async Task<ActionResult<List<ProductSummaryDto>>> GetFeaturedProducts(Guid merchantId, [FromQuery] int count = 10)
        {
            try
            {
                var result = await _productService.GetFeaturedProductsAsync(merchantId, count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving featured products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving featured products.");
            }
        }

        /// <summary>
        /// Get recent products for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="count">Number of products to return (default: 10)</param>
        /// <returns>List of recent products</returns>
        [HttpGet("merchant/{merchantId:guid}/recent")]
        public async Task<ActionResult<List<ProductSummaryDto>>> GetRecentProducts(Guid merchantId, [FromQuery] int count = 10)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own product data.");
                }

                var result = await _productService.GetRecentProductsAsync(merchantId, count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving recent products.");
            }
        }

        #endregion

        #region Analytics and Statistics

        /// <summary>
        /// Get product statistics for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <returns>Product statistics</returns>
        [HttpGet("merchant/{merchantId:guid}/statistics")]
        public async Task<ActionResult<ProductStatisticsDto>> GetProductStatistics(Guid merchantId)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own product statistics.");
                }

                var result = await _productService.GetProductStatisticsAsync(merchantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product statistics for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving product statistics.");
            }
        }

        /// <summary>
        /// Get product count by category for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <returns>Product count by category</returns>
        [HttpGet("merchant/{merchantId:guid}/category-counts")]
        public async Task<ActionResult<Dictionary<string, int>>> GetProductCountByCategory(Guid merchantId)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own product data.");
                }

                var result = await _productService.GetProductCountByCategoryAsync(merchantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product count by category for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving category counts.");
            }
        }

        /// <summary>
        /// Get inventory value by category for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <returns>Inventory value by category</returns>
        [HttpGet("merchant/{merchantId:guid}/inventory-value")]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetInventoryValueByCategory(Guid merchantId)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only access your own product data.");
                }

                var result = await _productService.GetInventoryValueByCategoryAsync(merchantId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving inventory value by category for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while retrieving inventory values.");
            }
        }

        #endregion

        #region Validation

        /// <summary>
        /// Check if SKU is unique for a merchant
        /// </summary>
        /// <param name="sku">SKU to check</param>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="excludeProductId">Optional product ID to exclude from check</param>
        /// <returns>True if SKU is unique</returns>
        [HttpGet("validate/sku")]
        public async Task<ActionResult<bool>> ValidateSkuUnique(
            [FromQuery] string sku, 
            [FromQuery] Guid merchantId, 
            [FromQuery] Guid? excludeProductId = null)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only validate SKUs for your own merchant account.");
                }

                var result = await _productService.IsSkuUniqueAsync(sku, merchantId, excludeProductId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating SKU uniqueness");
                return StatusCode(500, "An error occurred while validating SKU.");
            }
        }

        #endregion

        #region Import/Export

        /// <summary>
        /// Import products from a list
        /// </summary>
        /// <param name="products">List of products to import</param>
        /// <returns>List of successfully imported products</returns>
        [HttpPost("import")]
        public async Task<ActionResult<List<ProductResponseDto>>> ImportProducts([FromBody] List<CreateProductDto> products)
        {
            try
            {
                if (!products.Any())
                {
                    return BadRequest("No products provided for import.");
                }

                var createdBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.ImportProductsAsync(products, createdBy);

                return Ok(new { 
                    message = $"Import completed: {result.Count}/{products.Count} products imported successfully.",
                    importedProducts = result 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during product import");
                return StatusCode(500, "An error occurred during product import.");
            }
        }

        /// <summary>
        /// Export products for a merchant
        /// </summary>
        /// <param name="merchantId">Merchant ID</param>
        /// <param name="filter">Filter parameters</param>
        /// <returns>CSV file of products</returns>
        [HttpPost("merchant/{merchantId:guid}/export")]
        public async Task<IActionResult> ExportProducts(Guid merchantId, [FromBody] ProductFilterDto filter)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (currentMerchantId != merchantId && !User.IsInRole("Admin"))
                {
                    return Forbid("You can only export your own products.");
                }

                var csvData = await _productService.ExportProductsAsync(merchantId, filter);
                return File(csvData, "text/csv", $"products-{merchantId}-{DateTime.UtcNow:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting products for merchant {MerchantId}", merchantId);
                return StatusCode(500, "An error occurred while exporting products.");
            }
        }

        #endregion

        #region Image Management

        /// <summary>
        /// Update product images
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="imageUrls">List of image URLs</param>
        /// <returns>Success status</returns>
        [HttpPut("{id:guid}/images")]
        public async Task<IActionResult> UpdateProductImages(Guid id, [FromBody] List<string> imageUrls)
        {
            try
            {
                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.UpdateProductImagesAsync(id, imageUrls, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product images updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product images {ProductId}", id);
                return StatusCode(500, "An error occurred while updating product images.");
            }
        }

        /// <summary>
        /// Add an image to a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="imageUrl">Image URL to add</param>
        /// <returns>Success status</returns>
        [HttpPost("{id:guid}/images")]
        public async Task<IActionResult> AddProductImage(Guid id, [FromBody] string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return BadRequest("Image URL is required.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.AddProductImageAsync(id, imageUrl, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Image added to product successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding image to product {ProductId}", id);
                return StatusCode(500, "An error occurred while adding image to product.");
            }
        }

        /// <summary>
        /// Remove an image from a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="imageUrl">Image URL to remove</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id:guid}/images")]
        public async Task<IActionResult> RemoveProductImage(Guid id, [FromBody] string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return BadRequest("Image URL is required.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.RemoveProductImageAsync(id, imageUrl, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found or image not found.");
                }

                return Ok(new { message = "Image removed from product successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing image from product {ProductId}", id);
                return StatusCode(500, "An error occurred while removing image from product.");
            }
        }

        #endregion

        #region Pricing

        /// <summary>
        /// Update product price
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="newPrice">New price</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/price")]
        public async Task<IActionResult> UpdatePrice(Guid id, [FromBody] decimal newPrice)
        {
            try
            {
                if (newPrice <= 0)
                {
                    return BadRequest("Price must be greater than 0.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.UpdatePriceAsync(id, newPrice, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Product price updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating price for product {ProductId}", id);
                return StatusCode(500, "An error occurred while updating product price.");
            }
        }

        /// <summary>
        /// Apply discount to a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="discount">Discount percentage</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/discount")]
        public async Task<IActionResult> ApplyDiscount(Guid id, [FromBody] decimal discount)
        {
            try
            {
                if (discount < 0 || discount > 100)
                {
                    return BadRequest("Discount must be between 0 and 100.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only update your own products.");
                    }
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.ApplyDiscountAsync(id, discount, updatedBy);

                if (!result)
                {
                    return NotFound($"Product with ID {id} not found.");
                }

                return Ok(new { message = "Discount applied to product successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying discount to product {ProductId}", id);
                return StatusCode(500, "An error occurred while applying discount.");
            }
        }

        /// <summary>
        /// Bulk update product prices
        /// </summary>
        /// <param name="bulkPriceUpdateDto">Bulk price update data</param>
        /// <returns>Success status</returns>
        [HttpPost("bulk/update-prices")]
        public async Task<IActionResult> BulkUpdatePrices([FromBody] BulkPriceUpdateDto bulkPriceUpdateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.BulkUpdatePricesAsync(
                    bulkPriceUpdateDto.ProductIds, 
                    bulkPriceUpdateDto.PriceAdjustment, 
                    bulkPriceUpdateDto.IsPercentage, 
                    updatedBy);

                if (!result)
                {
                    return BadRequest("Bulk price update failed.");
                }

                return Ok(new { message = $"Successfully updated prices for {bulkPriceUpdateDto.ProductIds.Count} products." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk price update");
                return StatusCode(500, "An error occurred during bulk price update.");
            }
        }

        #endregion

        #region Duplicate and Copy

        /// <summary>
        /// Duplicate a product
        /// </summary>
        /// <param name="id">Product ID to duplicate</param>
        /// <param name="newProductName">Name for the duplicated product</param>
        /// <returns>Duplicated product details</returns>
        [HttpPost("{id:guid}/duplicate")]
        public async Task<ActionResult<ProductResponseDto>> DuplicateProduct(Guid id, [FromBody] string newProductName)
        {
            try
            {
                if (string.IsNullOrEmpty(newProductName))
                {
                    return BadRequest("New product name is required.");
                }

                var currentMerchantId = _currentUserService.GetMerchantId();
                if (!User.IsInRole("Admin"))
                {
                    var belongsToMerchant = await _productService.ProductBelongsToMerchantAsync(id, currentMerchantId);
                    if (!belongsToMerchant)
                    {
                        return Forbid("You can only duplicate your own products.");
                    }
                }

                var createdBy = _currentUserService.GetCurrentUserName() ?? "system";
                var result = await _productService.DuplicateProductAsync(id, newProductName, createdBy);

                return CreatedAtAction(nameof(GetById), new { id = result.ProductId }, result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error duplicating product {ProductId}", id);
                return StatusCode(500, "An error occurred while duplicating the product.");
            }
        }

        #endregion
    }

    #region Supporting DTOs

    public class StockAdjustmentDto
    {
        public int Adjustment { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class BulkPriceUpdateDto
    {
        public List<Guid> ProductIds { get; set; } = new();
        public decimal PriceAdjustment { get; set; }
        public bool IsPercentage { get; set; }
    }

    #endregion
}