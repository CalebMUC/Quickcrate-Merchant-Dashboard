using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCrate.Shared.Models
{
    /// <summary>
    /// Merchant's preferred payment methods for receiving payouts
    /// </summary>
    public class MerchantPaymentMethod
    {
        [Key]
        public Guid PaymentMethodId { get; set; }

        [Required]
        public Guid MerchantId { get; set; }

        [ForeignKey("MerchantId")]
        public virtual Merchant Merchant { get; set; }

        /// <summary>
        /// Type of payment method
        /// </summary>
        [Required]
        [MaxLength(50)]
        public PaymentMethodType Type { get; set; }

        /// <summary>
        /// Display name for the payment method
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// Whether this is the primary/default method
        /// </summary>
        public bool IsPrimary { get; set; }

        /// <summary>
        /// Whether the method is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Whether the method has been verified
        /// </summary>
        public bool IsVerified { get; set; }

        // Bank Account Details (for Bank Transfer)
        [MaxLength(100)]
        public string BankName { get; set; }

        [MaxLength(50)]
        public string AccountNumber { get; set; }

        [MaxLength(50)]
        public string AccountHolderName { get; set; }

        [MaxLength(50)]
        public string RoutingNumber { get; set; }

        [MaxLength(20)]
        public string SwiftCode { get; set; }

        // Mobile Money Details (for M-Pesa, etc.)
        [MaxLength(20)]
        public string MobileNumber { get; set; }

        [MaxLength(50)]
        public string MobileMoneyProvider { get; set; }

        // PayPal Details
        [MaxLength(100)]
        public string PayPalEmail { get; set; }

        // Card Details (for debit cards)
        [MaxLength(4)]
        public string CardLast4 { get; set; }

        [MaxLength(50)]
        public string CardBrand { get; set; }

        /// <summary>
        /// Additional metadata stored as JSON
        /// </summary>
        [Column(TypeName = "nvarchar(max)")]
        public string Metadata { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedOn { get; set; }
        public DateTime? LastUsedOn { get; set; }
    }

    public enum PaymentMethodType
    {
        BankTransfer,
        MobileMoney,
        PayPal,
        DebitCard,
        Cryptocurrency
    }
}
