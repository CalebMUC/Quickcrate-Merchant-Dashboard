using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace MerchantService.Model.Auth
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [MaxLength(450)]
        public string MerchantId { get; set; } = string.Empty;

        public bool IsTemporaryPassword { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public virtual Merchants? Merchant { get; set; }
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }

    public class ApplicationRole : IdentityRole
    {
        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MaxLength(450)]
        public string JwtId { get; set; } = string.Empty;

        [Required]
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public DateTime ExpiryDate { get; set; }

        public bool Used { get; set; } = false;

        public bool Invalidated { get; set; } = false;

        // Navigation Properties
        public virtual ApplicationUser? User { get; set; }
    }

    public class UserLoginAttempt
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        public DateTime AttemptDate { get; set; } = DateTime.UtcNow;

        public bool Success { get; set; } = false;

        [MaxLength(1000)]
        public string? UserAgent { get; set; }

        [MaxLength(500)]
        public string? FailureReason { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }
    }
}