using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MerchantService.Model
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(255)]
        public string Slug { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CompareAtPrice { get; set; }

        [Required]
        public int StockQuantity { get; set; } = 0;

        [MaxLength(50)]
        public string? SKU { get; set; }

        [MaxLength(50)]
        public string? Barcode { get; set; }

        public bool TrackQuantity { get; set; } = true;

        public bool ContinueSellingWhenOutOfStock { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        [Required]
        public int MerchantId { get; set; }

        // Category relationships
        public int? CategoryId { get; set; }
        public int? SubCategoryId { get; set; }
        public int? SubSubCategoryId { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedOn { get; set; }

        [Required]
        [MaxLength(255)]
        public string CreatedBy { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? UpdatedBy { get; set; }

        // Additional product attributes
        [MaxLength(100)]
        public string? Brand { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(50)]
        public string? Size { get; set; }

        [Column(TypeName = "decimal(10,2)")]
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

        // Navigation Properties
        [ForeignKey("MerchantId")]
        public virtual Merchants? Merchant { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }

        [ForeignKey("SubCategoryId")]
        public virtual SubCategory? SubCategory { get; set; }

        [ForeignKey("SubSubCategoryId")]
        public virtual SubSubCategory? SubSubCategory { get; set; }
    }
}