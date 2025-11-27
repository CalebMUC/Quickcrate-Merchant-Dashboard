using System;
using System.Collections.Generic;

namespace QuickCrate.Shared.DTOs
{
    /// <summary>
    /// DTO for payout response
    /// </summary>
    public class PayoutDto
    {
        public Guid PayoutId { get; set; }
        public Guid MerchantId { get; set; }
        public decimal GrossAmount { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal CommissionRate { get; set; }
        public decimal NetAmount { get; set; }
        public string Status { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        public DateTime ScheduledDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string PaymentReference { get; set; }
        public string FailureReason { get; set; }
        public int OrderCount { get; set; }
        public int ProductCount { get; set; }
        public string Notes { get; set; }
        public PaymentMethodSummaryDto PaymentMethod { get; set; }
        public DateTime CreatedOn { get; set; }
        public List<PayoutTransactionDto> Transactions { get; set; }
    }

    /// <summary>
    /// DTO for payout transaction detail
    /// </summary>
    public class PayoutTransactionDto
    {
        public Guid PayoutTransactionId { get; set; }
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; }
        public decimal OrderAmount { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal NetAmount { get; set; }
        public DateTime OrderCompletedDate { get; set; }
        public string CustomerName { get; set; }
        public int ItemCount { get; set; }
    }

    /// <summary>
    /// DTO for payment method summary in payout
    /// </summary>
    public class PaymentMethodSummaryDto
    {
        public Guid PaymentMethodId { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public string MaskedDetails { get; set; } // e.g., "****1234"
    }

    /// <summary>
    /// DTO for merchant payment method
    /// </summary>
    public class MerchantPaymentMethodDto
    {
        public Guid PaymentMethodId { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsActive { get; set; }
        public bool IsVerified { get; set; }
        
        // Masked/safe details for display
        public string BankName { get; set; }
        public string MaskedAccountNumber { get; set; }
        public string AccountHolderName { get; set; }
        public string MaskedMobileNumber { get; set; }
        public string MobileMoneyProvider { get; set; }
        public string PayPalEmail { get; set; }
        public string CardLast4 { get; set; }
        public string CardBrand { get; set; }

        public DateTime CreatedOn { get; set; }
        public DateTime? LastUsedOn { get; set; }
    }

    /// <summary>
    /// Request DTO for adding/updating payment method
    /// </summary>
    public class CreatePaymentMethodRequest
    {
        public string Type { get; set; } // BankTransfer, MobileMoney, PayPal, etc.
        public string Name { get; set; }
        public bool IsPrimary { get; set; }

        // Bank Transfer fields
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string AccountHolderName { get; set; }
        public string RoutingNumber { get; set; }
        public string SwiftCode { get; set; }

        // Mobile Money fields
        public string MobileNumber { get; set; }
        public string MobileMoneyProvider { get; set; }

        // PayPal fields
        public string PayPalEmail { get; set; }

        // Card fields
        public string CardNumber { get; set; }
        public string CardHolderName { get; set; }
        public string ExpiryDate { get; set; }
    }

    /// <summary>
    /// DTO for payout statistics
    /// </summary>
    public class PayoutStatsDto
    {
        public decimal TotalEarnings { get; set; }
        public decimal PendingPayout { get; set; }
        public decimal ThisMonthEarnings { get; set; }
        public decimal LastMonthEarnings { get; set; }
        public decimal GrowthPercentage { get; set; }
        public int CompletedPayouts { get; set; }
        public int PendingPayouts { get; set; }
        public int FailedPayouts { get; set; }
        public DateTime? NextPayoutDate { get; set; }
        public decimal NextPayoutAmount { get; set; }
        public DateTime? LastPayoutDate { get; set; }
        public decimal LastPayoutAmount { get; set; }
    }

    /// <summary>
    /// DTO for merchant transaction history
    /// </summary>
    public class MerchantTransactionDto
    {
        public Guid TransactionId { get; set; }
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; }
        public string CustomerName { get; set; }
        public decimal OrderAmount { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal NetAmount { get; set; }
        public string PaymentMethod { get; set; }
        public string PayoutStatus { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? PayoutDate { get; set; }
        public string PayoutReference { get; set; }
        public int ItemCount { get; set; }
    }

    /// <summary>
    /// Request DTO for generating weekly payouts (admin use)
    /// </summary>
    public class GeneratePayoutsRequest
    {
        public DateTime? PeriodStartDate { get; set; }
        public DateTime? PeriodEndDate { get; set; }
        public List<Guid> MerchantIds { get; set; } // Optional: specific merchants only
        public bool ProcessImmediately { get; set; } // If true, set status to Processing
    }

    /// <summary>
    /// Response DTO for payout generation
    /// </summary>
    public class GeneratePayoutsResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int PayoutsGenerated { get; set; }
        public decimal TotalAmount { get; set; }
        public List<PayoutSummaryDto> Payouts { get; set; }
    }

    /// <summary>
    /// Summary DTO for payout in lists
    /// </summary>
    public class PayoutSummaryDto
    {
        public Guid PayoutId { get; set; }
        public Guid MerchantId { get; set; }
        public string MerchantName { get; set; }
        public decimal NetAmount { get; set; }
        public string Status { get; set; }
        public DateTime ScheduledDate { get; set; }
        public int OrderCount { get; set; }
    }
}
