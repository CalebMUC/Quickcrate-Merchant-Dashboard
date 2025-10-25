# Mock Authentication Guide

## Available Demo Accounts

The application now supports mock authentication with the following test accounts:

### 1. Admin Account
- **Email:** `admin@quickcrate.com`
- **Password:** `admin123`
- **Role:** Admin
- **Permissions:** Full access including user management

### 2. Merchant Account
- **Email:** `merchant@quickcrate.com`
- **Password:** `merchant123`
- **Role:** Merchant
- **Permissions:** Products, orders, and payments management

### 3. Staff Account
- **Email:** `staff@quickcrate.com`
- **Password:** `staff123`
- **Role:** Staff
- **Permissions:** Read-only access to products and orders

## How to Use

1. **Quick Login Buttons**: On the login page, use the "Admin", "Merchant", or "Staff" buttons to automatically fill in credentials
2. **Manual Login**: Enter any of the email/password combinations listed above
3. **Environment**: Mock API is enabled via `.env.local` file with `NEXT_PUBLIC_MOCK_API=true`

## Features

- Simulated network delay (1 second) for realistic testing
- JWT token simulation with refresh token support
- Role-based permissions system
- Persistent login state via localStorage
- Automatic redirect to dashboard on successful login

## Development

The mock authentication system is located in:
- `lib/api/mock.ts` - Mock API implementation
- `lib/contexts/AuthContext.tsx` - Authentication context
- `components/features/auth/LoginForm.tsx` - Login form with quick buttons