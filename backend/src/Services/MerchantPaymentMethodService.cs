using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuickCrate.Shared.Models;
using QuickCrate.Shared.DTOs;

namespace QuickCrate.Services
{
    public interface IMerchantPaymentMethodService
    {
        Task<List<MerchantPaymentMethodDto>> GetMerchantPaymentMethodsAsync(Guid merchantId);
        Task<MerchantPaymentMethodDto> GetPaymentMethodByIdAsync(Guid paymentMethodId);
        Task<MerchantPaymentMethodDto> CreatePaymentMethodAsync(Guid merchantId, CreatePaymentMethodRequest request);
        Task<MerchantPaymentMethodDto> UpdatePaymentMethodAsync(Guid paymentMethodId, CreatePaymentMethodRequest request);
        Task<bool> DeletePaymentMethodAsync(Guid paymentMethodId);
        Task<MerchantPaymentMethodDto> SetPrimaryPaymentMethodAsync(Guid merchantId, Guid paymentMethodId);
        Task<MerchantPaymentMethodDto> VerifyPaymentMethodAsync(Guid paymentMethodId);
    }

    public class MerchantPaymentMethodService : IMerchantPaymentMethodService
    {
        private readonly ApplicationDbContext _context;

        public MerchantPaymentMethodService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all payment methods for a merchant
        /// </summary>
        public async Task<List<MerchantPaymentMethodDto>> GetMerchantPaymentMethodsAsync(Guid merchantId)
        {
            var methods = await _context.MerchantPaymentMethods
                .Where(pm => pm.MerchantId == merchantId)
                .OrderByDescending(pm => pm.IsPrimary)
                .ThenByDescending(pm => pm.CreatedOn)
                .ToListAsync();

            return methods.Select(MapToDto).ToList();
        }

        /// <summary>
        /// Get a specific payment method by ID
        /// </summary>
        public async Task<MerchantPaymentMethodDto> GetPaymentMethodByIdAsync(Guid paymentMethodId)
        {
            var method = await _context.MerchantPaymentMethods
                .FirstOrDefaultAsync(pm => pm.PaymentMethodId == paymentMethodId);

            return method != null ? MapToDto(method) : null;
        }

        /// <summary>
        /// Create a new payment method for a merchant
        /// </summary>
        public async Task<MerchantPaymentMethodDto> CreatePaymentMethodAsync(
            Guid merchantId, 
            CreatePaymentMethodRequest request)
        {
            // If this is set as primary, unset other primary methods
            if (request.IsPrimary)
            {
                var existingPrimary = await _context.MerchantPaymentMethods
                    .Where(pm => pm.MerchantId == merchantId && pm.IsPrimary)
                    .ToListAsync();

                foreach (var method in existingPrimary)
                {
                    method.IsPrimary = false;
                }
            }

            // Parse payment method type
            if (!Enum.TryParse<PaymentMethodType>(request.Type, true, out var methodType))
            {
                throw new ArgumentException($"Invalid payment method type: {request.Type}");
            }

            var paymentMethod = new MerchantPaymentMethod
            {
                PaymentMethodId = Guid.NewGuid(),
                MerchantId = merchantId,
                Type = methodType,
                Name = request.Name,
                IsPrimary = request.IsPrimary,
                IsActive = true,
                IsVerified = false, // Requires verification
                CreatedOn = DateTime.UtcNow
            };

            // Set type-specific fields
            switch (methodType)
            {
                case PaymentMethodType.BankTransfer:
                    paymentMethod.BankName = request.BankName;
                    paymentMethod.AccountNumber = request.AccountNumber;
                    paymentMethod.AccountHolderName = request.AccountHolderName;
                    paymentMethod.RoutingNumber = request.RoutingNumber;
                    paymentMethod.SwiftCode = request.SwiftCode;
                    break;

                case PaymentMethodType.MobileMoney:
                    paymentMethod.MobileNumber = request.MobileNumber;
                    paymentMethod.MobileMoneyProvider = request.MobileMoneyProvider;
                    break;

                case PaymentMethodType.PayPal:
                    paymentMethod.PayPalEmail = request.PayPalEmail;
                    break;

                case PaymentMethodType.DebitCard:
                    // In production, use a payment processor API (Stripe, etc.)
                    // Never store full card numbers!
                    paymentMethod.CardLast4 = request.CardNumber?.Substring(Math.Max(0, request.CardNumber.Length - 4));
                    paymentMethod.CardBrand = DetermineCardBrand(request.CardNumber);
                    break;
            }

            _context.MerchantPaymentMethods.Add(paymentMethod);
            await _context.SaveChangesAsync();

            return MapToDto(paymentMethod);
        }

        /// <summary>
        /// Update an existing payment method
        /// </summary>
        public async Task<MerchantPaymentMethodDto> UpdatePaymentMethodAsync(
            Guid paymentMethodId, 
            CreatePaymentMethodRequest request)
        {
            var paymentMethod = await _context.MerchantPaymentMethods
                .FirstOrDefaultAsync(pm => pm.PaymentMethodId == paymentMethodId);

            if (paymentMethod == null)
            {
                return null;
            }

            // If setting as primary, unset others
            if (request.IsPrimary && !paymentMethod.IsPrimary)
            {
                var existingPrimary = await _context.MerchantPaymentMethods
                    .Where(pm => pm.MerchantId == paymentMethod.MerchantId && pm.IsPrimary)
                    .ToListAsync();

                foreach (var method in existingPrimary)
                {
                    method.IsPrimary = false;
                }
            }

            paymentMethod.Name = request.Name ?? paymentMethod.Name;
            paymentMethod.IsPrimary = request.IsPrimary;
            paymentMethod.UpdatedOn = DateTime.UtcNow;

            // Update type-specific fields based on method type
            switch (paymentMethod.Type)
            {
                case PaymentMethodType.BankTransfer:
                    if (!string.IsNullOrEmpty(request.BankName))
                        paymentMethod.BankName = request.BankName;
                    if (!string.IsNullOrEmpty(request.AccountHolderName))
                        paymentMethod.AccountHolderName = request.AccountHolderName;
                    break;

                case PaymentMethodType.MobileMoney:
                    if (!string.IsNullOrEmpty(request.MobileMoneyProvider))
                        paymentMethod.MobileMoneyProvider = request.MobileMoneyProvider;
                    break;
            }

            await _context.SaveChangesAsync();

            return MapToDto(paymentMethod);
        }

        /// <summary>
        /// Delete a payment method
        /// </summary>
        public async Task<bool> DeletePaymentMethodAsync(Guid paymentMethodId)
        {
            var paymentMethod = await _context.MerchantPaymentMethods
                .FirstOrDefaultAsync(pm => pm.PaymentMethodId == paymentMethodId);

            if (paymentMethod == null)
            {
                return false;
            }

            // Don't allow deleting if it's the only active method
            var activeMethodsCount = await _context.MerchantPaymentMethods
                .CountAsync(pm => pm.MerchantId == paymentMethod.MerchantId && pm.IsActive);

            if (activeMethodsCount <= 1)
            {
                throw new InvalidOperationException("Cannot delete the only active payment method");
            }

            // Don't allow deleting if it has pending payouts
            var hasPendingPayouts = await _context.Payouts
                .AnyAsync(p => p.PaymentMethodId == paymentMethodId && 
                              (p.Status == PayoutStatus.Pending || p.Status == PayoutStatus.Scheduled));

            if (hasPendingPayouts)
            {
                throw new InvalidOperationException("Cannot delete payment method with pending payouts");
            }

            _context.MerchantPaymentMethods.Remove(paymentMethod);
            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Set a payment method as primary
        /// </summary>
        public async Task<MerchantPaymentMethodDto> SetPrimaryPaymentMethodAsync(Guid merchantId, Guid paymentMethodId)
        {
            var paymentMethod = await _context.MerchantPaymentMethods
                .FirstOrDefaultAsync(pm => pm.PaymentMethodId == paymentMethodId && pm.MerchantId == merchantId);

            if (paymentMethod == null)
            {
                return null;
            }

            // Unset other primary methods
            var existingPrimary = await _context.MerchantPaymentMethods
                .Where(pm => pm.MerchantId == merchantId && pm.IsPrimary)
                .ToListAsync();

            foreach (var method in existingPrimary)
            {
                method.IsPrimary = false;
            }

            paymentMethod.IsPrimary = true;
            paymentMethod.UpdatedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(paymentMethod);
        }

        /// <summary>
        /// Verify a payment method (admin function or automated verification)
        /// </summary>
        public async Task<MerchantPaymentMethodDto> VerifyPaymentMethodAsync(Guid paymentMethodId)
        {
            var paymentMethod = await _context.MerchantPaymentMethods
                .FirstOrDefaultAsync(pm => pm.PaymentMethodId == paymentMethodId);

            if (paymentMethod == null)
            {
                return null;
            }

            paymentMethod.IsVerified = true;
            paymentMethod.UpdatedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(paymentMethod);
        }

        // Helper methods
        private MerchantPaymentMethodDto MapToDto(MerchantPaymentMethod method)
        {
            return new MerchantPaymentMethodDto
            {
                PaymentMethodId = method.PaymentMethodId,
                Type = method.Type.ToString(),
                Name = method.Name,
                IsPrimary = method.IsPrimary,
                IsActive = method.IsActive,
                IsVerified = method.IsVerified,
                BankName = method.BankName,
                MaskedAccountNumber = MaskAccountNumber(method.AccountNumber),
                AccountHolderName = method.AccountHolderName,
                MaskedMobileNumber = MaskPhoneNumber(method.MobileNumber),
                MobileMoneyProvider = method.MobileMoneyProvider,
                PayPalEmail = method.PayPalEmail,
                CardLast4 = method.CardLast4,
                CardBrand = method.CardBrand,
                CreatedOn = method.CreatedOn,
                LastUsedOn = method.LastUsedOn
            };
        }

        private string MaskAccountNumber(string accountNumber)
        {
            if (string.IsNullOrEmpty(accountNumber) || accountNumber.Length <= 4)
            {
                return accountNumber;
            }

            return $"****{accountNumber.Substring(accountNumber.Length - 4)}";
        }

        private string MaskPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber) || phoneNumber.Length <= 4)
            {
                return phoneNumber;
            }

            return $"****{phoneNumber.Substring(phoneNumber.Length - 4)}";
        }

        private string DetermineCardBrand(string cardNumber)
        {
            if (string.IsNullOrEmpty(cardNumber))
            {
                return "Unknown";
            }

            // Simple card brand detection (in production, use a proper library)
            if (cardNumber.StartsWith("4"))
            {
                return "Visa";
            }
            else if (cardNumber.StartsWith("5"))
            {
                return "Mastercard";
            }
            else if (cardNumber.StartsWith("3"))
            {
                return "Amex";
            }

            return "Unknown";
        }
    }
}
