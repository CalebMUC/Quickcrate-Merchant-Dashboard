using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuickCrate.Shared.Models;
using QuickCrate.Shared.DTOs;

namespace QuickCrate.Services
{
    public interface IPayoutService
    {
        Task<PayoutStatsDto> GetMerchantPayoutStatsAsync(Guid merchantId);
        Task<List<PayoutDto>> GetMerchantPayoutsAsync(Guid merchantId, string status = null);
        Task<PayoutDto> GetPayoutByIdAsync(Guid payoutId);
        Task<List<MerchantTransactionDto>> GetMerchantTransactionsAsync(Guid merchantId, DateTime? startDate, DateTime? endDate, string status = null);
        Task<GeneratePayoutsResponse> GenerateWeeklyPayoutsAsync(GeneratePayoutsRequest request);
        Task<PayoutDto> UpdatePayoutStatusAsync(Guid payoutId, string status, string reference = null, string failureReason = null);
    }

    public class PayoutService : IPayoutService
    {
        private readonly ApplicationDbContext _context;
        private readonly decimal _defaultCommissionRate = 0.05m; // 5% default platform commission

        public PayoutService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get payout statistics for a merchant
        /// </summary>
        public async Task<PayoutStatsDto> GetMerchantPayoutStatsAsync(Guid merchantId)
        {
            var now = DateTime.UtcNow;
            var thisMonthStart = new DateTime(now.Year, now.Month, 1);
            var lastMonthStart = thisMonthStart.AddMonths(-1);

            // Get all payouts for the merchant
            var payouts = await _context.Payouts
                .Where(p => p.MerchantId == merchantId)
                .ToListAsync();

            // Calculate statistics
            var totalEarnings = payouts
                .Where(p => p.Status == PayoutStatus.Completed)
                .Sum(p => p.NetAmount);

            var pendingPayout = payouts
                .Where(p => p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Scheduled)
                .Sum(p => p.NetAmount);

            var thisMonthEarnings = payouts
                .Where(p => p.Status == PayoutStatus.Completed && p.CompletedDate >= thisMonthStart)
                .Sum(p => p.NetAmount);

            var lastMonthEarnings = payouts
                .Where(p => p.Status == PayoutStatus.Completed && 
                           p.CompletedDate >= lastMonthStart && 
                           p.CompletedDate < thisMonthStart)
                .Sum(p => p.NetAmount);

            var growthPercentage = lastMonthEarnings > 0 
                ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
                : 0;

            var nextPayout = payouts
                .Where(p => p.Status == PayoutStatus.Scheduled || p.Status == PayoutStatus.Pending)
                .OrderBy(p => p.ScheduledDate)
                .FirstOrDefault();

            var lastPayout = payouts
                .Where(p => p.Status == PayoutStatus.Completed)
                .OrderByDescending(p => p.CompletedDate)
                .FirstOrDefault();

            return new PayoutStatsDto
            {
                TotalEarnings = totalEarnings,
                PendingPayout = pendingPayout,
                ThisMonthEarnings = thisMonthEarnings,
                LastMonthEarnings = lastMonthEarnings,
                GrowthPercentage = Math.Round(growthPercentage, 2),
                CompletedPayouts = payouts.Count(p => p.Status == PayoutStatus.Completed),
                PendingPayouts = payouts.Count(p => p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Scheduled),
                FailedPayouts = payouts.Count(p => p.Status == PayoutStatus.Failed),
                NextPayoutDate = nextPayout?.ScheduledDate,
                NextPayoutAmount = nextPayout?.NetAmount ?? 0,
                LastPayoutDate = lastPayout?.CompletedDate,
                LastPayoutAmount = lastPayout?.NetAmount ?? 0
            };
        }

        /// <summary>
        /// Get all payouts for a merchant with optional status filter
        /// </summary>
        public async Task<List<PayoutDto>> GetMerchantPayoutsAsync(Guid merchantId, string status = null)
        {
            var query = _context.Payouts
                .Include(p => p.PaymentMethod)
                .Include(p => p.Transactions)
                    .ThenInclude(t => t.Order)
                .Where(p => p.MerchantId == merchantId);

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<PayoutStatus>(status, true, out var payoutStatus))
                {
                    query = query.Where(p => p.Status == payoutStatus);
                }
            }

            var payouts = await query.OrderByDescending(p => p.CreatedOn).ToListAsync();

            return payouts.Select(MapToPayoutDto).ToList();
        }

        /// <summary>
        /// Get a specific payout by ID with full details
        /// </summary>
        public async Task<PayoutDto> GetPayoutByIdAsync(Guid payoutId)
        {
            var payout = await _context.Payouts
                .Include(p => p.PaymentMethod)
                .Include(p => p.Transactions)
                    .ThenInclude(t => t.Order)
                .FirstOrDefaultAsync(p => p.PayoutId == payoutId);

            return payout != null ? MapToPayoutDto(payout) : null;
        }

        /// <summary>
        /// Get merchant transaction history with optional filters
        /// </summary>
        public async Task<List<MerchantTransactionDto>> GetMerchantTransactionsAsync(
            Guid merchantId, 
            DateTime? startDate, 
            DateTime? endDate, 
            string status = null)
        {
            var query = _context.PayoutTransactions
                .Include(pt => pt.Order)
                .Include(pt => pt.Payout)
                .Where(pt => pt.Payout.MerchantId == merchantId);

            if (startDate.HasValue)
            {
                query = query.Where(pt => pt.OrderCompletedDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(pt => pt.OrderCompletedDate <= endDate.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<PayoutStatus>(status, true, out var payoutStatus))
                {
                    query = query.Where(pt => pt.Payout.Status == payoutStatus);
                }
            }

            var transactions = await query
                .OrderByDescending(pt => pt.OrderCompletedDate)
                .ToListAsync();

            return transactions.Select(MapToTransactionDto).ToList();
        }

        /// <summary>
        /// Generate weekly payouts for all merchants or specific merchants
        /// </summary>
        public async Task<GeneratePayoutsResponse> GenerateWeeklyPayoutsAsync(GeneratePayoutsRequest request)
        {
            var periodEnd = request.PeriodEndDate ?? DateTime.UtcNow;
            var periodStart = request.PeriodStartDate ?? periodEnd.AddDays(-7);

            // Get completed orders in the period
            var ordersQuery = _context.Orders
                .Where(o => o.Status == "Delivered" || o.Status == "Completed")
                .Where(o => o.CompletedDate >= periodStart && o.CompletedDate <= periodEnd);

            // Filter by specific merchants if provided
            if (request.MerchantIds != null && request.MerchantIds.Any())
            {
                ordersQuery = ordersQuery.Where(o => request.MerchantIds.Contains(o.MerchantId));
            }

            var orders = await ordersQuery
                .Include(o => o.OrderItems)
                .ToListAsync();

            // Group orders by merchant
            var merchantOrders = orders.GroupBy(o => o.MerchantId);

            var generatedPayouts = new List<PayoutSummaryDto>();
            decimal totalAmount = 0;

            foreach (var merchantGroup in merchantOrders)
            {
                var merchantId = merchantGroup.Key;
                var merchantOrdersList = merchantGroup.ToList();

                // Calculate totals
                var grossAmount = merchantOrdersList.Sum(o => o.SubTotal);
                var commissionAmount = grossAmount * _defaultCommissionRate;
                var netAmount = grossAmount - commissionAmount;

                // Get merchant's primary payment method
                var paymentMethod = await _context.MerchantPaymentMethods
                    .Where(pm => pm.MerchantId == merchantId && pm.IsPrimary && pm.IsActive)
                    .FirstOrDefaultAsync();

                // Create payout
                var payout = new Payout
                {
                    PayoutId = Guid.NewGuid(),
                    MerchantId = merchantId,
                    GrossAmount = grossAmount,
                    CommissionAmount = commissionAmount,
                    CommissionRate = _defaultCommissionRate * 100, // Store as percentage
                    NetAmount = netAmount,
                    Status = request.ProcessImmediately ? PayoutStatus.Processing : PayoutStatus.Pending,
                    PeriodStartDate = periodStart,
                    PeriodEndDate = periodEnd,
                    ScheduledDate = periodEnd.AddDays(2), // Schedule 2 days after period end
                    OrderCount = merchantOrdersList.Count,
                    ProductCount = merchantOrdersList.Sum(o => o.OrderItems?.Count ?? 0),
                    PaymentMethodId = paymentMethod?.PaymentMethodId,
                    CreatedOn = DateTime.UtcNow
                };

                _context.Payouts.Add(payout);

                // Create payout transactions for each order
                foreach (var order in merchantOrdersList)
                {
                    var orderCommission = order.SubTotal * _defaultCommissionRate;
                    var orderNet = order.SubTotal - orderCommission;

                    var payoutTransaction = new PayoutTransaction
                    {
                        PayoutTransactionId = Guid.NewGuid(),
                        PayoutId = payout.PayoutId,
                        OrderId = order.OrderId,
                        OrderAmount = order.SubTotal,
                        CommissionAmount = orderCommission,
                        NetAmount = orderNet,
                        OrderCompletedDate = order.CompletedDate ?? order.UpdatedOn ?? order.CreatedOn,
                        CreatedOn = DateTime.UtcNow
                    };

                    _context.PayoutTransactions.Add(payoutTransaction);
                }

                var merchant = await _context.Merchants.FindAsync(merchantId);

                generatedPayouts.Add(new PayoutSummaryDto
                {
                    PayoutId = payout.PayoutId,
                    MerchantId = merchantId,
                    MerchantName = merchant?.BusinessName ?? "Unknown Merchant",
                    NetAmount = netAmount,
                    Status = payout.Status.ToString(),
                    ScheduledDate = payout.ScheduledDate,
                    OrderCount = payout.OrderCount
                });

                totalAmount += netAmount;
            }

            await _context.SaveChangesAsync();

            return new GeneratePayoutsResponse
            {
                Success = true,
                Message = $"Generated {generatedPayouts.Count} payouts successfully",
                PayoutsGenerated = generatedPayouts.Count,
                TotalAmount = totalAmount,
                Payouts = generatedPayouts
            };
        }

        /// <summary>
        /// Update payout status (for payment processing)
        /// </summary>
        public async Task<PayoutDto> UpdatePayoutStatusAsync(
            Guid payoutId, 
            string status, 
            string reference = null, 
            string failureReason = null)
        {
            var payout = await _context.Payouts
                .Include(p => p.PaymentMethod)
                .FirstOrDefaultAsync(p => p.PayoutId == payoutId);

            if (payout == null)
            {
                return null;
            }

            if (Enum.TryParse<PayoutStatus>(status, true, out var payoutStatus))
            {
                payout.Status = payoutStatus;
            }

            if (payoutStatus == PayoutStatus.Completed)
            {
                payout.CompletedDate = DateTime.UtcNow;
            }

            if (!string.IsNullOrEmpty(reference))
            {
                payout.PaymentReference = reference;
            }

            if (!string.IsNullOrEmpty(failureReason))
            {
                payout.FailureReason = failureReason;
            }

            payout.UpdatedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToPayoutDto(payout);
        }

        // Helper methods
        private PayoutDto MapToPayoutDto(Payout payout)
        {
            return new PayoutDto
            {
                PayoutId = payout.PayoutId,
                MerchantId = payout.MerchantId,
                GrossAmount = payout.GrossAmount,
                CommissionAmount = payout.CommissionAmount,
                CommissionRate = payout.CommissionRate,
                NetAmount = payout.NetAmount,
                Status = payout.Status.ToString(),
                PeriodStartDate = payout.PeriodStartDate,
                PeriodEndDate = payout.PeriodEndDate,
                ScheduledDate = payout.ScheduledDate,
                CompletedDate = payout.CompletedDate,
                PaymentReference = payout.PaymentReference,
                FailureReason = payout.FailureReason,
                OrderCount = payout.OrderCount,
                ProductCount = payout.ProductCount,
                Notes = payout.Notes,
                CreatedOn = payout.CreatedOn,
                PaymentMethod = payout.PaymentMethod != null ? new PaymentMethodSummaryDto
                {
                    PaymentMethodId = payout.PaymentMethod.PaymentMethodId,
                    Type = payout.PaymentMethod.Type.ToString(),
                    Name = payout.PaymentMethod.Name,
                    MaskedDetails = GetMaskedDetails(payout.PaymentMethod)
                } : null,
                Transactions = payout.Transactions?.Select(MapToPayoutTransactionDto).ToList()
            };
        }

        private PayoutTransactionDto MapToPayoutTransactionDto(PayoutTransaction transaction)
        {
            return new PayoutTransactionDto
            {
                PayoutTransactionId = transaction.PayoutTransactionId,
                OrderId = transaction.OrderId,
                OrderNumber = transaction.Order?.OrderId.ToString() ?? "N/A",
                OrderAmount = transaction.OrderAmount,
                CommissionAmount = transaction.CommissionAmount,
                NetAmount = transaction.NetAmount,
                OrderCompletedDate = transaction.OrderCompletedDate,
                CustomerName = "Customer", // Add customer name if available in Order model
                ItemCount = transaction.Order?.OrderItems?.Count ?? 0
            };
        }

        private MerchantTransactionDto MapToTransactionDto(PayoutTransaction transaction)
        {
            return new MerchantTransactionDto
            {
                TransactionId = transaction.PayoutTransactionId,
                OrderId = transaction.OrderId,
                OrderNumber = transaction.Order?.OrderId.ToString() ?? "N/A",
                CustomerName = "Customer", // Add customer name if available
                OrderAmount = transaction.OrderAmount,
                CommissionAmount = transaction.CommissionAmount,
                NetAmount = transaction.NetAmount,
                PaymentMethod = transaction.Payout?.PaymentMethod?.Type.ToString() ?? "N/A",
                PayoutStatus = transaction.Payout?.Status.ToString() ?? "Unknown",
                OrderDate = transaction.OrderCompletedDate,
                PayoutDate = transaction.Payout?.CompletedDate,
                PayoutReference = transaction.Payout?.PaymentReference,
                ItemCount = transaction.Order?.OrderItems?.Count ?? 0
            };
        }

        private string GetMaskedDetails(MerchantPaymentMethod method)
        {
            return method.Type switch
            {
                PaymentMethodType.BankTransfer => $"****{method.AccountNumber?.Substring(Math.Max(0, method.AccountNumber.Length - 4))}",
                PaymentMethodType.MobileMoney => $"****{method.MobileNumber?.Substring(Math.Max(0, method.MobileNumber.Length - 4))}",
                PaymentMethodType.PayPal => method.PayPalEmail,
                PaymentMethodType.DebitCard => $"****{method.CardLast4}",
                _ => "****"
            };
        }
    }
}
