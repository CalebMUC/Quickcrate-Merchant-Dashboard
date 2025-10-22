using MerchantService.Model.Auth;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MerchantService.Model
{
    public class Merchants
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string BusinessName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? LegalName { get; set; }

        [MaxLength(100)]
        public string? BusinessType { get; set; }

        [MaxLength(50)]
        public string? TaxId { get; set; }

        [MaxLength(50)]
        public string? RegistrationNumber { get; set; }

        [Required]
        [MaxLength(255)]
        public string ContactEmail { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(500)]
        public string? Website { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "pending"; // pending, active, suspended, inactive

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedOn { get; set; }

        [MaxLength(450)]
        public string? UserId { get; set; }

        // Business Details
        [Column(TypeName = "decimal(18,2)")]
        public decimal? MonthlyVolume { get; set; }

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(100)]
        public string? TimeZone { get; set; }

        [MaxLength(10)]
        public string? Currency { get; set; } = "USD";

        [MaxLength(10)]
        public string? Language { get; set; } = "en";

        // Subscription & Billing
        [MaxLength(50)]
        public string? SubscriptionPlan { get; set; } = "basic";

        public DateTime? SubscriptionStartDate { get; set; }

        public DateTime? SubscriptionEndDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SubscriptionAmount { get; set; }

        // Settings
        public bool EmailNotifications { get; set; } = true;

        public bool SmsNotifications { get; set; } = false;

        public bool MarketingEmails { get; set; } = true;

        // Analytics
        public int TotalOrders { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalRevenue { get; set; } = 0;

        public int TotalProducts { get; set; } = 0;

        public int TotalCustomers { get; set; } = 0;

        public DateTime? LastLoginDate { get; set; }

        public DateTime? LastActivityDate { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }

        public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}