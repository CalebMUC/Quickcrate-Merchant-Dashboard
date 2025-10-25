using System.ComponentModel.DataAnnotations;

namespace MerchantService.Model.DTOs
{
    public class CategoryQueryDto
    {
        /// <summary>
        /// Search term for category name or description
        /// </summary>
        public string? Search { get; set; }

        /// <summary>
        /// Filter by active status (true/false)
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Sort field (name, sortOrder, createdOn, updatedOn)
        /// </summary>
        public string? SortBy { get; set; } = "sortOrder";

        /// <summary>
        /// Sort order (asc or desc)
        /// </summary>
        public string? SortOrder { get; set; } = "asc";

        /// <summary>
        /// Page number (starts from 1)
        /// </summary>
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0")]
        public int Page { get; set; } = 1;

        /// <summary>
        /// Number of items per page
        /// </summary>
        [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100")]
        public int PageSize { get; set; } = 20;

        /// <summary>
        /// Include subcategories in the response
        /// </summary>
        public bool IncludeSubCategories { get; set; } = true;

        /// <summary>
        /// Include sub-subcategories in the response
        /// </summary>
        public bool IncludeSubSubCategories { get; set; } = true;

        /// <summary>
        /// Filter by parent category ID (for hierarchical filtering)
        /// </summary>
        public int? ParentId { get; set; }

        /// <summary>
        /// Minimum sort order for filtering
        /// </summary>
        public int? MinSortOrder { get; set; }

        /// <summary>
        /// Maximum sort order for filtering
        /// </summary>
        public int? MaxSortOrder { get; set; }

        /// <summary>
        /// Filter by creation date range - start date
        /// </summary>
        public DateTime? CreatedAfter { get; set; }

        /// <summary>
        /// Filter by creation date range - end date
        /// </summary>
        public DateTime? CreatedBefore { get; set; }

        /// <summary>
        /// Filter categories that have products
        /// </summary>
        public bool? HasProducts { get; set; }

        /// <summary>
        /// Minimum product count for filtering
        /// </summary>
        public int? MinProductCount { get; set; }

        /// <summary>
        /// Maximum product count for filtering
        /// </summary>
        public int? MaxProductCount { get; set; }
    }

    public class SubCategoryQueryDto
    {
        /// <summary>
        /// Search term for subcategory name or description
        /// </summary>
        public string? Search { get; set; }

        /// <summary>
        /// Filter by active status (true/false)
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Sort field (name, sortOrder, createdOn, updatedOn)
        /// </summary>
        public string? SortBy { get; set; } = "sortOrder";

        /// <summary>
        /// Sort order (asc or desc)
        /// </summary>
        public string? SortOrder { get; set; } = "asc";

        /// <summary>
        /// Include sub-subcategories in the response
        /// </summary>
        public bool IncludeSubSubCategories { get; set; } = true;

        /// <summary>
        /// Filter by creation date range - start date
        /// </summary>
        public DateTime? CreatedAfter { get; set; }

        /// <summary>
        /// Filter by creation date range - end date
        /// </summary>
        public DateTime? CreatedBefore { get; set; }

        /// <summary>
        /// Filter subcategories that have products
        /// </summary>
        public bool? HasProducts { get; set; }

        /// <summary>
        /// Minimum product count for filtering
        /// </summary>
        public int? MinProductCount { get; set; }

        /// <summary>
        /// Maximum product count for filtering
        /// </summary>
        public int? MaxProductCount { get; set; }
    }

    public class SubSubCategoryQueryDto
    {
        /// <summary>
        /// Search term for sub-subcategory name or description
        /// </summary>
        public string? Search { get; set; }

        /// <summary>
        /// Filter by active status (true/false)
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Sort field (name, sortOrder, createdOn, updatedOn)
        /// </summary>
        public string? SortBy { get; set; } = "sortOrder";

        /// <summary>
        /// Sort order (asc or desc)
        /// </summary>
        public string? SortOrder { get; set; } = "asc";

        /// <summary>
        /// Filter by creation date range - start date
        /// </summary>
        public DateTime? CreatedAfter { get; set; }

        /// <summary>
        /// Filter by creation date range - end date
        /// </summary>
        public DateTime? CreatedBefore { get; set; }

        /// <summary>
        /// Filter sub-subcategories that have products
        /// </summary>
        public bool? HasProducts { get; set; }

        /// <summary>
        /// Minimum product count for filtering
        /// </summary>
        public int? MinProductCount { get; set; }

        /// <summary>
        /// Maximum product count for filtering
        /// </summary>
        public int? MaxProductCount { get; set; }
    }
}