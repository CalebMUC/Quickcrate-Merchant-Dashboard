using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCrate.Shared.Models
{
    /// <summary>
    /// Links individual orders/transactions to a payout
    /// </summary>
    public class PayoutTransaction
    {
        [Key]
        public Guid PayoutTransactionId { get; set; }

        [Required]
        public Guid PayoutId { get; set; }

        [ForeignKey("PayoutId")]
        public virtual Payout Payout { get; set; }

        [Required]
        public Guid OrderId { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }

        /// <summary>
        /// Order subtotal included in payout
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal OrderAmount { get; set; }

        /// <summary>
        /// Commission deducted from this order
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal CommissionAmount { get; set; }

        /// <summary>
        /// Net amount for this order (OrderAmount - Commission)
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; }

        /// <summary>
        /// Date the order was completed
        /// </summary>
        [Required]
        public DateTime OrderCompletedDate { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    }
}
