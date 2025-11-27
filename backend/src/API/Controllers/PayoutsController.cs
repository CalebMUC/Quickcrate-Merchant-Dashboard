using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickCrate.Services;
using QuickCrate.Shared.DTOs;

namespace QuickCrate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication
    public class PayoutsController : ControllerBase
    {
        private readonly IPayoutService _payoutService;
        private readonly IMerchantPaymentMethodService _paymentMethodService;

        public PayoutsController(
            IPayoutService payoutService,
            IMerchantPaymentMethodService paymentMethodService)
        {
            _payoutService = payoutService;
            _paymentMethodService = paymentMethodService;
        }

        /// <summary>
        /// Get payout statistics for the authenticated merchant
        /// </summary>
        /// <returns>Payout statistics including total earnings, pending payouts, growth, etc.</returns>
        [HttpGet("stats")]
        public async Task<ActionResult<PayoutStatsDto>> GetPayoutStats()
        {
            try
            {
                var merchantId = GetMerchantIdFromToken();
                var stats = await _payoutService.GetMerchantPayoutStatsAsync(merchantId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payout stats", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all payouts for the authenticated merchant
        /// </summary>
        /// <param name="status">Optional status filter (Pending, Scheduled, Completed, Failed)</param>
        /// <returns>List of payouts</returns>
        [HttpGet]
        public async Task<ActionResult<List<PayoutDto>>> GetMerchantPayouts([FromQuery] string status = null)
        {
            try
            {
                var merchantId = GetMerchantIdFromToken();
                var payouts = await _payoutService.GetMerchantPayoutsAsync(merchantId, status);
                return Ok(payouts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payouts", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific payout by ID with full details
        /// </summary>
        /// <param name="id">Payout ID</param>
        /// <returns>Payout details including transactions</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<PayoutDto>> GetPayoutById(Guid id)
        {
            try
            {
                var payout = await _payoutService.GetPayoutByIdAsync(id);
                
                if (payout == null)
                {
                    return NotFound(new { message = "Payout not found" });
                }

                // Verify the payout belongs to the authenticated merchant
                var merchantId = GetMerchantIdFromToken();
                if (payout.MerchantId != merchantId)
                {
                    return Forbid();
                }

                return Ok(payout);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payout", error = ex.Message });
            }
        }

        /// <summary>
        /// Get transaction history for the authenticated merchant
        /// </summary>
        /// <param name="startDate">Optional start date filter</param>
        /// <param name="endDate">Optional end date filter</param>
        /// <param name="status">Optional status filter</param>
        /// <returns>List of transactions</returns>
        [HttpGet("transactions")]
        public async Task<ActionResult<List<MerchantTransactionDto>>> GetMerchantTransactions(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string status = null)
        {
            try
            {
                var merchantId = GetMerchantIdFromToken();
                var transactions = await _payoutService.GetMerchantTransactionsAsync(
                    merchantId, startDate, endDate, status);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving transactions", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate weekly payouts (Admin only)
        /// </summary>
        /// <param name="request">Payout generation parameters</param>
        /// <returns>Summary of generated payouts</returns>
        [HttpPost("generate")]
        [Authorize(Roles = "Admin")] // Only admins can generate payouts
        public async Task<ActionResult<GeneratePayoutsResponse>> GenerateWeeklyPayouts(
            [FromBody] GeneratePayoutsRequest request)
        {
            try
            {
                var response = await _payoutService.GenerateWeeklyPayoutsAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating payouts", error = ex.Message });
            }
        }

        /// <summary>
        /// Update payout status (Admin only)
        /// </summary>
        /// <param name="id">Payout ID</param>
        /// <param name="request">Status update request</param>
        /// <returns>Updated payout</returns>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PayoutDto>> UpdatePayoutStatus(
            Guid id,
            [FromBody] UpdatePayoutStatusRequest request)
        {
            try
            {
                var payout = await _payoutService.UpdatePayoutStatusAsync(
                    id, request.Status, request.Reference, request.FailureReason);

                if (payout == null)
                {
                    return NotFound(new { message = "Payout not found" });
                }

                return Ok(payout);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating payout status", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all payment methods for the authenticated merchant
        /// </summary>
        /// <returns>List of payment methods</returns>
        [HttpGet("payment-methods")]
        public async Task<ActionResult<List<MerchantPaymentMethodDto>>> GetPaymentMethods()
        {
            try
            {
                var merchantId = GetMerchantIdFromToken();
                var methods = await _paymentMethodService.GetMerchantPaymentMethodsAsync(merchantId);
                return Ok(methods);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payment methods", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific payment method by ID
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <returns>Payment method details</returns>
        [HttpGet("payment-methods/{id}")]
        public async Task<ActionResult<MerchantPaymentMethodDto>> GetPaymentMethodById(Guid id)
        {
            try
            {
                var method = await _paymentMethodService.GetPaymentMethodByIdAsync(id);
                
                if (method == null)
                {
                    return NotFound(new { message = "Payment method not found" });
                }

                return Ok(method);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving payment method", error = ex.Message });
            }
        }

        /// <summary>
        /// Add a new payment method for the authenticated merchant
        /// </summary>
        /// <param name="request">Payment method details</param>
        /// <returns>Created payment method</returns>
        [HttpPost("payment-methods")]
        public async Task<ActionResult<MerchantPaymentMethodDto>> CreatePaymentMethod(
            [FromBody] CreatePaymentMethodRequest request)
        {
            try
            {
                var merchantId = GetMerchantIdFromToken();
                var method = await _paymentMethodService.CreatePaymentMethodAsync(merchantId, request);
                return CreatedAtAction(nameof(GetPaymentMethodById), new { id = method.PaymentMethodId }, method);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating payment method", error = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <param name="request">Updated payment method details</param>
        /// <returns>Updated payment method</returns>
        [HttpPut("payment-methods/{id}")]
        public async Task<ActionResult<MerchantPaymentMethodDto>> UpdatePaymentMethod(
            Guid id,
            [FromBody] CreatePaymentMethodRequest request)
        {
            try
            {
                var method = await _paymentMethodService.UpdatePaymentMethodAsync(id, request);
                
                if (method == null)
                {
                    return NotFound(new { message = "Payment method not found" });
                }

                return Ok(method);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating payment method", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a payment method
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("payment-methods/{id}")]
        public async Task<ActionResult> DeletePaymentMethod(Guid id)
        {
            try
            {
                var success = await _paymentMethodService.DeletePaymentMethodAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = "Payment method not found" });
                }

                return Ok(new { message = "Payment method deleted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting payment method", error = ex.Message });
            }
        }

        /// <summary>
        /// Set a payment method as primary
        /// </summary>
        /// <param name="id">Payment method ID</param>
        /// <returns>Updated payment method</returns>
        [HttpPost("payment-methods/{id}/set-primary")]
        public async Task<ActionResult<MerchantPaymentMethodDto>> SetPrimaryPaymentMethod(Guid id)
        {
            try
            {
                var merchantId = GetMerchantIdFromToken();
                var method = await _paymentMethodService.SetPrimaryPaymentMethodAsync(merchantId, id);
                
                if (method == null)
                {
                    return NotFound(new { message = "Payment method not found" });
                }

                return Ok(method);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error setting primary payment method", error = ex.Message });
            }
        }

        // Helper method to extract merchant ID from JWT token
        private Guid GetMerchantIdFromToken()
        {
            var merchantIdClaim = User.FindFirst("MerchantId")?.Value 
                ?? User.FindFirst("merchantId")?.Value
                ?? User.FindFirst("merchant_id")?.Value;

            if (string.IsNullOrEmpty(merchantIdClaim))
            {
                throw new UnauthorizedAccessException("Merchant ID not found in token");
            }

            return Guid.Parse(merchantIdClaim);
        }
    }

    /// <summary>
    /// Request DTO for updating payout status
    /// </summary>
    public class UpdatePayoutStatusRequest
    {
        public string Status { get; set; }
        public string Reference { get; set; }
        public string FailureReason { get; set; }
    }
}
