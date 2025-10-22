using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MerchantService.Model.Auth;

namespace MerchantService.Model
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(255)]
        public string Slug { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        [Required]
        public int MerchantId { get; set; }

        public int? ParentId { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [MaxLength(255)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        public int ProductCount { get; set; } = 0;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedOn { get; set; }

        [Required]
        [MaxLength(255)]
        public string CreatedBy { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("MerchantId")]
        public virtual Merchants? Merchant { get; set; }

        [ForeignKey("ParentId")]
        public virtual Category? Parent { get; set; }

        public virtual ICollection<Category> Children { get; set; } = new List<Category>();

        public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }

    public class SubCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(255)]
        public string Slug { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int MerchantId { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int ProductCount { get; set; } = 0;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedOn { get; set; }

        [Required]
        [MaxLength(255)]
        public string CreatedBy { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;

        [ForeignKey("MerchantId")]
        public virtual Merchants? Merchant { get; set; }

        public virtual ICollection<SubSubCategory> SubSubCategories { get; set; } = new List<SubSubCategory>();

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }

    public class SubSubCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(255)]
        public string Slug { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        [Required]
        public int SubCategoryId { get; set; }

        [Required]
        public int MerchantId { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int ProductCount { get; set; } = 0;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedOn { get; set; }

        [Required]
        [MaxLength(255)]
        public string CreatedBy { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("SubCategoryId")]
        public virtual SubCategory SubCategory { get; set; } = null!;

        [ForeignKey("MerchantId")]
        public virtual Merchants? Merchant { get; set; }

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}