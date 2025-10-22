using System.ComponentModel.DataAnnotations;

namespace MerchantService.Model.DTOs
{
    // ====================================
    // CATEGORY DTOs
    // ====================================

    public class CategoryResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public int MerchantId { get; set; }
        public int? ParentId { get; set; }
        public string? ImageUrl { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public int ProductCount { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? UpdatedBy { get; set; }
        public List<SubCategoryResponseDto>? SubCategories { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        public int? ParentId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }
    }

    public class UpdateCategoryDto
    {
        [MaxLength(255)]
        public string? Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        public bool? IsActive { get; set; }

        public int? SortOrder { get; set; }

        public int? ParentId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }
    }

    // ====================================
    // SUBCATEGORY DTOs
    // ====================================

    public class SubCategoryResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public int CategoryId { get; set; }
        public int MerchantId { get; set; }
        public string? ImageUrl { get; set; }
        public int ProductCount { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? UpdatedBy { get; set; }
        public List<SubSubCategoryResponseDto>? SubSubCategories { get; set; }
    }

    public class CreateSubCategoryDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        [Required]
        public int CategoryId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }
    }

    public class UpdateSubCategoryDto
    {
        [MaxLength(255)]
        public string? Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        public bool? IsActive { get; set; }

        public int? SortOrder { get; set; }

        public int? CategoryId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }
    }

    // ====================================
    // SUB-SUBCATEGORY DTOs
    // ====================================

    public class SubSubCategoryResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public int SubCategoryId { get; set; }
        public int MerchantId { get; set; }
        public string? ImageUrl { get; set; }
        public int ProductCount { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? UpdatedBy { get; set; }
    }

    public class CreateSubSubCategoryDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        [Required]
        public int SubCategoryId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }
    }

    public class UpdateSubSubCategoryDto
    {
        [MaxLength(255)]
        public string? Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        public bool? IsActive { get; set; }

        public int? SortOrder { get; set; }

        public int? SubCategoryId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }
    }

    // ====================================
    // PRODUCT DTOs
    // ====================================

    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Slug { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? CompareAtPrice { get; set; }
        public int StockQuantity { get; set; }
        public string? SKU { get; set; }
        public string? Barcode { get; set; }
        public bool TrackQuantity { get; set; }
        public bool ContinueSellingWhenOutOfStock { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public int MerchantId { get; set; }
        public int? CategoryId { get; set; }
        public int? SubCategoryId { get; set; }
        public int? SubSubCategoryId { get; set; }
        public string? ImageUrl { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public decimal? Weight { get; set; }
        public string? Dimensions { get; set; }
        public string? Material { get; set; }
        public string? Tags { get; set; }
        public string? KeyFeatures { get; set; }
        public string? Specification { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? UpdatedBy { get; set; }
    }

    public class CreateProductDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Compare at price must be greater than 0")]
        public decimal? CompareAtPrice { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; } = 0;

        [MaxLength(50)]
        public string? SKU { get; set; }

        [MaxLength(50)]
        public string? Barcode { get; set; }

        public bool TrackQuantity { get; set; } = true;

        public bool ContinueSellingWhenOutOfStock { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        public int? CategoryId { get; set; }

        public int? SubCategoryId { get; set; }

        public int? SubSubCategoryId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        [MaxLength(100)]
        public string? Brand { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(50)]
        public string? Size { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Weight cannot be negative")]
        public decimal? Weight { get; set; }

        [MaxLength(100)]
        public string? Dimensions { get; set; }

        [MaxLength(100)]
        public string? Material { get; set; }

        [MaxLength(1000)]
        public string? Tags { get; set; }

        [MaxLength(2000)]
        public string? KeyFeatures { get; set; }

        [MaxLength(2000)]
        public string? Specification { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; } = "active";
    }

    public class UpdateProductDto
    {
        [MaxLength(255)]
        public string? Name { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? Slug { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal? Price { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Compare at price must be greater than 0")]
        public decimal? CompareAtPrice { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
        public int? StockQuantity { get; set; }

        [MaxLength(50)]
        public string? SKU { get; set; }

        [MaxLength(50)]
        public string? Barcode { get; set; }

        public bool? TrackQuantity { get; set; }

        public bool? ContinueSellingWhenOutOfStock { get; set; }

        public bool? IsActive { get; set; }

        public bool? IsFeatured { get; set; }

        public int? CategoryId { get; set; }

        public int? SubCategoryId { get; set; }

        public int? SubSubCategoryId { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        [MaxLength(100)]
        public string? Brand { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(50)]
        public string? Size { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Weight cannot be negative")]
        public decimal? Weight { get; set; }

        [MaxLength(100)]
        public string? Dimensions { get; set; }

        [MaxLength(100)]
        public string? Material { get; set; }

        [MaxLength(1000)]
        public string? Tags { get; set; }

        [MaxLength(2000)]
        public string? KeyFeatures { get; set; }

        [MaxLength(2000)]
        public string? Specification { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }
    }

    // ====================================
    // PAGING DTOs
    // ====================================

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage => Page > 1;
        public bool HasNextPage => Page < TotalPages;
    }

    // ====================================
    // API RESPONSE DTOs
    // ====================================

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse<T> SuccessResult(T data, string? message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message ?? "Operation completed successfully",
                Data = data
            };
        }

        public static ApiResponse<T> ErrorResult(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }

        public static ApiResponse SuccessResult(string? message = null)
        {
            return new ApiResponse
            {
                Success = true,
                Message = message ?? "Operation completed successfully"
            };
        }

        public static ApiResponse ErrorResult(string message, List<string>? errors = null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }
}