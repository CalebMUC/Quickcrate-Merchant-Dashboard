# 📡 Merchant Payout API Documentation

## Base URL
```
https://api.yourapp.com/api/payouts
```

All endpoints require authentication via JWT Bearer token.

---

## 🔐 Authentication

Include JWT token in all requests:
```http
Authorization: Bearer <your-jwt-token>
```

Token must contain:
- `MerchantId` claim (for merchant endpoints)
- `Role` claim with "Admin" (for admin endpoints)

---

## 📊 Endpoints

### 1. Get Payout Statistics

Get dashboard statistics for the authenticated merchant.

**Endpoint:** `GET /stats`  
**Auth:** Merchant  
**Response:**

```json
{
  "totalEarnings": 45231.89,
  "pendingPayout": 2847.50,
  "thisMonthEarnings": 12456.78,
  "lastMonthEarnings": 10820.45,
  "growthPercentage": 15.12,
  "completedPayouts": 18,
  "pendingPayouts": 2,
  "failedPayouts": 1,
  "nextPayoutDate": "2024-01-20T00:00:00Z",
  "nextPayoutAmount": 2847.50,
  "lastPayoutDate": "2024-01-13T00:00:00Z",
  "lastPayoutAmount": 4521.30
}
```

---

### 2. List Payouts

Get all payouts for the authenticated merchant with optional filtering.

**Endpoint:** `GET /`  
**Auth:** Merchant  
**Query Parameters:**
- `status` (optional): Filter by status (Pending, Scheduled, Processing, Completed, Failed, Cancelled)

**Example:** `GET /api/payouts?status=Completed`

**Response:**

```json
[
  {
    "payoutId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "merchantId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "grossAmount": 450.00,
    "commissionAmount": 22.50,
    "commissionRate": 5.00,
    "netAmount": 427.50,
    "status": "Completed",
    "periodStartDate": "2024-01-08T00:00:00Z",
    "periodEndDate": "2024-01-14T00:00:00Z",
    "scheduledDate": "2024-01-16T00:00:00Z",
    "completedDate": "2024-01-16T10:30:00Z",
    "paymentReference": "PAY-REF-123456",
    "orderCount": 12,
    "productCount": 45,
    "paymentMethod": {
      "paymentMethodId": "8b9c6479-8521-50fe-a5fc-3d973f66bfa7",
      "type": "BankTransfer",
      "name": "Primary Business Account",
      "maskedDetails": "****1234"
    },
    "createdOn": "2024-01-15T00:00:00Z"
  }
]
```

---

### 3. Get Payout Details

Get detailed information about a specific payout including all transactions.

**Endpoint:** `GET /{id}`  
**Auth:** Merchant (must own the payout)  
**Path Parameters:**
- `id`: Payout ID (GUID)

**Response:**

```json
{
  "payoutId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "merchantId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "grossAmount": 450.00,
  "commissionAmount": 22.50,
  "commissionRate": 5.00,
  "netAmount": 427.50,
  "status": "Completed",
  "periodStartDate": "2024-01-08T00:00:00Z",
  "periodEndDate": "2024-01-14T00:00:00Z",
  "scheduledDate": "2024-01-16T00:00:00Z",
  "completedDate": "2024-01-16T10:30:00Z",
  "paymentReference": "PAY-REF-123456",
  "orderCount": 12,
  "productCount": 45,
  "notes": "Weekly payout for period Jan 8-14",
  "paymentMethod": {
    "paymentMethodId": "8b9c6479-8521-50fe-a5fc-3d973f66bfa7",
    "type": "BankTransfer",
    "name": "Primary Business Account",
    "maskedDetails": "****1234"
  },
  "transactions": [
    {
      "payoutTransactionId": "1ab85f64-6827-5672-c4gd-3d084g77bgb8",
      "orderId": "9cd96489-9631-61gf-b6gd-4e184g88chc9",
      "orderNumber": "ORD-001",
      "orderAmount": 100.00,
      "commissionAmount": 5.00,
      "netAmount": 95.00,
      "orderCompletedDate": "2024-01-10T14:30:00Z",
      "customerName": "John Doe",
      "itemCount": 3
    }
  ],
  "createdOn": "2024-01-15T00:00:00Z"
}
```

---

### 4. Get Transaction History

Get all order transactions for the authenticated merchant with filtering.

**Endpoint:** `GET /transactions`  
**Auth:** Merchant  
**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `status` (optional): Filter by payout status

**Example:** `GET /api/payouts/transactions?startDate=2024-01-01&endDate=2024-01-31&status=Completed`

**Response:**

```json
[
  {
    "transactionId": "1ab85f64-6827-5672-c4gd-3d084g77bgb8",
    "orderId": "9cd96489-9631-61gf-b6gd-4e184g88chc9",
    "orderNumber": "ORD-001",
    "customerName": "John Doe",
    "orderAmount": 100.00,
    "commissionAmount": 5.00,
    "netAmount": 95.00,
    "paymentMethod": "BankTransfer",
    "payoutStatus": "Completed",
    "orderDate": "2024-01-10T14:30:00Z",
    "payoutDate": "2024-01-16T10:30:00Z",
    "payoutReference": "PAY-REF-123456",
    "itemCount": 3
  }
]
```

---

### 5. Generate Weekly Payouts (Admin)

Generate payouts for all merchants or specific merchants for a given period.

**Endpoint:** `POST /generate`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "periodStartDate": "2024-01-08T00:00:00Z",
  "periodEndDate": "2024-01-14T00:00:00Z",
  "merchantIds": [
    "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  ],
  "processImmediately": false
}
```

**Fields:**
- `periodStartDate` (optional): Start of payout period (defaults to 7 days ago)
- `periodEndDate` (optional): End of payout period (defaults to now)
- `merchantIds` (optional): Specific merchants to generate payouts for (defaults to all)
- `processImmediately` (optional): If true, sets status to Processing instead of Pending

**Response:**

```json
{
  "success": true,
  "message": "Generated 25 payouts successfully",
  "payoutsGenerated": 25,
  "totalAmount": 125430.50,
  "payouts": [
    {
      "payoutId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "merchantId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "merchantName": "ABC Store",
      "netAmount": 427.50,
      "status": "Pending",
      "scheduledDate": "2024-01-16T00:00:00Z",
      "orderCount": 12
    }
  ]
}
```

---

### 6. Update Payout Status (Admin)

Update the status of a payout (e.g., mark as completed, failed).

**Endpoint:** `PATCH /{id}/status`  
**Auth:** Admin only  
**Path Parameters:**
- `id`: Payout ID (GUID)

**Request Body:**

```json
{
  "status": "Completed",
  "reference": "PAY-REF-123456",
  "failureReason": null
}
```

**Fields:**
- `status`: New status (Pending, Scheduled, Processing, Completed, Failed, Cancelled)
- `reference` (optional): Payment reference number
- `failureReason` (optional): Reason if status is Failed

**Response:**

```json
{
  "payoutId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "Completed",
  "completedDate": "2024-01-16T10:30:00Z",
  "paymentReference": "PAY-REF-123456"
}
```

---

### 7. List Payment Methods

Get all payment methods for the authenticated merchant.

**Endpoint:** `GET /payment-methods`  
**Auth:** Merchant  

**Response:**

```json
[
  {
    "paymentMethodId": "8b9c6479-8521-50fe-a5fc-3d973f66bfa7",
    "type": "BankTransfer",
    "name": "Primary Business Account",
    "isPrimary": true,
    "isActive": true,
    "isVerified": true,
    "bankName": "Chase Bank",
    "maskedAccountNumber": "****1234",
    "accountHolderName": "John Doe",
    "createdOn": "2024-01-01T00:00:00Z",
    "lastUsedOn": "2024-01-16T10:30:00Z"
  },
  {
    "paymentMethodId": "9c0d7580-9632-61gf-b6gd-4e184g88chc9",
    "type": "MobileMoney",
    "name": "M-Pesa Account",
    "isPrimary": false,
    "isActive": true,
    "isVerified": false,
    "maskedMobileNumber": "****5678",
    "mobileMoneyProvider": "M-Pesa",
    "createdOn": "2024-01-05T00:00:00Z",
    "lastUsedOn": null
  }
]
```

---

### 8. Get Payment Method

Get details of a specific payment method.

**Endpoint:** `GET /payment-methods/{id}`  
**Auth:** Merchant (must own the payment method)  
**Path Parameters:**
- `id`: Payment Method ID (GUID)

**Response:** Same as single item in list above

---

### 9. Add Payment Method

Add a new payment method for the authenticated merchant.

**Endpoint:** `POST /payment-methods`  
**Auth:** Merchant  

**Request Body (Bank Transfer):**

```json
{
  "type": "BankTransfer",
  "name": "Primary Business Account",
  "isPrimary": true,
  "bankName": "Chase Bank",
  "accountNumber": "1234567890",
  "accountHolderName": "John Doe",
  "routingNumber": "021000021",
  "swiftCode": "CHASUS33"
}
```

**Request Body (Mobile Money):**

```json
{
  "type": "MobileMoney",
  "name": "M-Pesa Account",
  "isPrimary": false,
  "mobileNumber": "+254712345678",
  "mobileMoneyProvider": "M-Pesa"
}
```

**Request Body (PayPal):**

```json
{
  "type": "PayPal",
  "name": "PayPal Business",
  "isPrimary": false,
  "payPalEmail": "business@example.com"
}
```

**Request Body (Debit Card):**

```json
{
  "type": "DebitCard",
  "name": "Business Debit Card",
  "isPrimary": false,
  "cardNumber": "4111111111111111",
  "cardHolderName": "John Doe",
  "expiryDate": "12/25"
}
```

**Response:** Created payment method object (see #7)

---

### 10. Update Payment Method

Update an existing payment method.

**Endpoint:** `PUT /payment-methods/{id}`  
**Auth:** Merchant (must own the payment method)  
**Path Parameters:**
- `id`: Payment Method ID (GUID)

**Request Body:**

```json
{
  "name": "Updated Account Name",
  "isPrimary": true,
  "bankName": "New Bank Name",
  "accountHolderName": "Updated Name"
}
```

**Note:** Sensitive fields like account numbers cannot be updated. Only metadata fields can be changed.

**Response:** Updated payment method object

---

### 11. Delete Payment Method

Delete a payment method.

**Endpoint:** `DELETE /payment-methods/{id}`  
**Auth:** Merchant (must own the payment method)  
**Path Parameters:**
- `id`: Payment Method ID (GUID)

**Restrictions:**
- Cannot delete the only active payment method
- Cannot delete if payment method has pending payouts

**Response:**

```json
{
  "message": "Payment method deleted successfully"
}
```

**Error Response:**

```json
{
  "message": "Cannot delete payment method with pending payouts"
}
```

---

### 12. Set Primary Payment Method

Set a payment method as the primary method for payouts.

**Endpoint:** `POST /payment-methods/{id}/set-primary`  
**Auth:** Merchant (must own the payment method)  
**Path Parameters:**
- `id`: Payment Method ID (GUID)

**Response:** Updated payment method object with `isPrimary: true`

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid payment method type: InvalidType"
}
```

### 401 Unauthorized
```json
{
  "message": "Merchant ID not found in token"
}
```

### 403 Forbidden
```json
{
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "message": "Payout not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error retrieving payouts",
  "error": "Detailed error message"
}
```

---

## 📝 Data Models

### Payout Status Values
- `Pending`: Payout created, awaiting scheduling
- `Scheduled`: Scheduled for payment
- `Processing`: Payment in progress
- `Completed`: Payment successful
- `Failed`: Payment failed
- `Cancelled`: Payout cancelled

### Payment Method Types
- `BankTransfer`: Bank account
- `MobileMoney`: Mobile money (M-Pesa, Airtel, MTN, etc.)
- `PayPal`: PayPal account
- `DebitCard`: Debit card
- `Cryptocurrency`: Crypto wallet

---

## 🔄 Typical Workflow

### For Merchants:

1. **Setup** (One-time)
   ```
   POST /payment-methods (Add payment method)
   POST /payment-methods/{id}/set-primary (Set as primary)
   ```

2. **Weekly Routine**
   ```
   GET /stats (Check dashboard)
   GET / (View payout history)
   GET /transactions (Review transactions)
   ```

3. **When Payout Completes**
   ```
   GET /{id} (View payout details)
   (Download receipt)
   ```

### For Admins:

1. **Weekly Job** (Automated)
   ```
   POST /generate (Generate all payouts)
   ```

2. **Payment Processing**
   ```
   PATCH /{id}/status (Update to Processing)
   (Process payment via provider)
   PATCH /{id}/status (Update to Completed with reference)
   ```

3. **Handle Failures**
   ```
   PATCH /{id}/status (Update to Failed with reason)
   (Retry or resolve issue)
   ```

---

## 🧪 Testing with cURL

### Get Stats
```bash
curl -X GET "https://api.yourapp.com/api/payouts/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add Payment Method
```bash
curl -X POST "https://api.yourapp.com/api/payouts/payment-methods" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BankTransfer",
    "name": "Test Account",
    "isPrimary": true,
    "bankName": "Test Bank",
    "accountNumber": "1234567890",
    "accountHolderName": "Test User"
  }'
```

### Generate Payouts (Admin)
```bash
curl -X POST "https://api.yourapp.com/api/payouts/generate" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "processImmediately": false
  }'
```

---

## 📚 Additional Resources

- **Full Documentation**: See `MERCHANT_PAYOUT_SYSTEM.md`
- **Quick Start Guide**: See `PAYOUT_QUICK_START.md`
- **Source Code**: `/backend/src/API/Controllers/PayoutsController.cs`

---

**API Version**: 1.0.0  
**Last Updated**: November 25, 2025
