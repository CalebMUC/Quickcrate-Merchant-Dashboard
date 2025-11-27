using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCrate.Shared.Models
{
    /// <summary>
    /// Represents a weekly payout to a merchant
    /// </summary>
    public class Payout
    {
        [Key]
        public Guid PayoutId { get; set; }

        [Required]
        public Guid MerchantId { get; set; }

        [ForeignKey("MerchantId")]
        public virtual Merchant Merchant { get; set; }

        /// <summary>
        /// Gross amount before commission (sum of all order totals)
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GrossAmount { get; set; }

        /// <summary>
        /// Platform commission amount
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CommissionAmount { get; set; }

        /// <summary>
        /// Commission rate applied (percentage)
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal CommissionRate { get; set; }

        /// <summary>
        /// Net payout amount (Gross - Commission)
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; }

        /// <summary>
        /// Status of the payout
        /// </summary>
        [Required]
        [MaxLength(20)]
        public PayoutStatus Status { get; set; }

        /// <summary>
        /// Start date of the payout period (weekly)
        /// </summary>
        [Required]
        public DateTime PeriodStartDate { get; set; }

        /// <summary>
        /// End date of the payout period (weekly)
        /// </summary>
        [Required]
        public DateTime PeriodEndDate { get; set; }

        /// <summary>
        /// Scheduled payment date
        /// </summary>
        [Required]
        public DateTime ScheduledDate { get; set; }

        /// <summary>
        /// Actual date when payment was completed
        /// </summary>
        public DateTime? CompletedDate { get; set; }

        /// <summary>
        /// Payment method ID used for this payout
        /// </summary>
        public Guid? PaymentMethodId { get; set; }

        [ForeignKey("PaymentMethodId")]
        public virtual MerchantPaymentMethod PaymentMethod { get; set; }

        /// <summary>
        /// Reference number from payment provider
        /// </summary>
        [MaxLength(100)]
        public string PaymentReference { get; set; }

        /// <summary>
        /// Reason for failure if status is Failed
        /// </summary>
        [MaxLength(500)]
        public string FailureReason { get; set; }

        /// <summary>
        /// Number of orders included in this payout
        /// </summary>
        public int OrderCount { get; set; }

        /// <summary>
        /// Number of products sold in the payout period
        /// </summary>
        public int ProductCount { get; set; }

        /// <summary>
        /// Additional notes or metadata
        /// </summary>
        [MaxLength(1000)]
        public string Notes { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedOn { get; set; }

        // Navigation properties
        public virtual ICollection<PayoutTransaction> Transactions { get; set; } = new List<PayoutTransaction>();
    }

    public enum PayoutStatus
    {
        Pending,      // Payout generated but not yet scheduled
        Scheduled,    // Scheduled for payment
        Processing,   // Payment in progress
        Completed,    // Payment successfully completed
        Failed,       // Payment failed
        Cancelled     // Payout cancelled
    }
}
