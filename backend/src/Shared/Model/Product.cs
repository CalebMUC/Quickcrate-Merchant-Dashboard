using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MerchantService.Model
{
    public class Product
    {
        [Key]
        public Guid ProductId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string ProductName { get; set; } = string.Empty;
        
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
        
        [MaxLength(2000)]
        public string ProductDescription { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }
        
        [Required]
        public int StockQuantity { get; set; }
        
        [MaxLength(100)]
        public string SKU { get; set; } = string.Empty;

        // Category Information
        public Guid CategoryId { get; set; }
        
        [MaxLength(255)]
        public string CategoryName { get; set; } = string.Empty;
        
        public Guid? SubCategoryId { get; set; }
        
        [MaxLength(255)]
        public string? SubCategoryName { get; set; }

        public Guid? SubSubCategoryId { get; set; }
        
        [MaxLength(255)]
        public string? SubSubCategoryName { get; set; }

        [MaxLength(4000)]
        public string ProductSpecification { get; set; } = string.Empty; //save as Json
        
        [MaxLength(2000)]
        public string Features { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string BoxContents { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string ProductType { get; set; } = string.Empty;

        // Status & Features
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        
        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        // Images - stored as JSON string
        [MaxLength(4000)]
        public string ImageUrls { get; set; } = "[]";

        // Merchant Relationship
        public Guid MerchantID { get; set; }

        // Audit Fields
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        
        [Required]
        [MaxLength(255)]
        public string CreatedBy { get; set; } = string.Empty;
        
        public DateTime? UpdatedOn { get; set; }
        
        [MaxLength(255)]
        public string? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedOn { get; set; }
        
        [MaxLength(255)]
        public string? DeletedBy { get; set; }

        // Navigation Properties
        [ForeignKey("MerchantID")]
        public virtual Merchants Merchant { get; set; } = null!;

        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;

        [ForeignKey("SubCategoryId")]
        public virtual SubCategory? SubCategory { get; set; }

        [ForeignKey("SubSubCategoryId")]
        public virtual SubSubCategory? SubSubCategory { get; set; }
        
        // Helper property to work with ImageUrls as List
        [NotMapped]
        public List<string> ImageUrlsList
        {
            get => string.IsNullOrEmpty(ImageUrls) ? new List<string>() : 
                   System.Text.Json.JsonSerializer.Deserialize<List<string>>(ImageUrls) ?? new List<string>();
            set => ImageUrls = System.Text.Json.JsonSerializer.Serialize(value);
        }
    }
}