# QuickCrate Merchant Dashboard

A modern, feature-rich merchant dashboard built with Next.js 14, TypeScript, and Tailwind CSS. This dashboard provides comprehensive e-commerce management capabilities with a microservices-ready architecture.

## 🚀 Features

### ✅ **Implemented**
- **🎨 Modern UI/UX** - Built with shadcn/ui components and Tailwind CSS
- **🔐 Authentication System** - JWT-based auth with login/logout functionality
- **📱 Responsive Design** - Mobile-first approach with adaptive layouts
- **🗂️ Modular Architecture** - Organized feature-based folder structure
- **🧭 Advanced Navigation** - Collapsible sidebar with module/submodule organization
- **🔌 API Integration** - Ready for backend microservices integration
- **📊 Dashboard Analytics** - Revenue, orders, and performance metrics
- **🛍️ Product Management** - CRUD operations, approval workflows, inventory tracking
- **📋 Order Management** - Order tracking, status updates, fulfillment
- **💳 Payment Systems** - Transaction history, payout management
- **🔔 Notifications** - Real-time alerts and notification center
- **🎛️ Settings Management** - Profile, business, and security settings
- **🎯 Mock API** - Development-ready with mock data and services

### 🚧 **In Development**
- Real backend microservices integration
- File upload and media management
- Advanced analytics and reporting
- Real-time WebSocket connections
- Multi-tenant support

## 📁 Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── login/                    # Authentication pages
│   ├── products/                 # Product management pages
│   ├── orders/                   # Order management pages
│   ├── payments/                 # Payment and billing pages
│   └── ...
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── auth/                 # Authentication components
│   │   ├── products/             # Product management components
│   │   ├── orders/               # Order management components
│   │   ├── payments/             # Payment components
│   │   ├── notifications/        # Notification components
│   │   ├── analytics/            # Analytics components
│   │   ├── support/              # Support components
│   │   └── settings/             # Settings components
│   ├── layout/                   # Layout components
│   │   ├── ModularSidebar.tsx    # Advanced sidebar with modules
│   │   └── DashboardLayout.tsx   # Main layout wrapper
│   ├── auth/                     # Authentication guards
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── api/                      # API service layer
│   │   ├── client.ts             # HTTP client configuration
│   │   ├── auth.ts               # Authentication services
│   │   ├── products.ts           # Product services
│   │   ├── orders.ts             # Order services
│   │   ├── payments.ts           # Payment services
│   │   ├── notifications.ts      # Notification services
│   │   └── mock.ts               # Mock API for development
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/                    # Custom React hooks
│   └── utils.ts                  # Utility functions
├── types/
│   └── index.ts                  # TypeScript type definitions
└── ...
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "QuickCrate Merchant Dashboard"
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with demo credentials:
     - **Email:** admin@quickcrate.com
     - **Password:** admin123

## 🔐 Authentication

### Demo Credentials
- **Email:** admin@quickcrate.com
- **Password:** admin123

### Features
- JWT-based authentication
- Automatic token refresh
- Route protection
- Role-based access control
- Secure logout

## 🏗️ Architecture

### Frontend Architecture
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Modular structure** for scalability

### API Layer
- Centralized HTTP client
- Service-based organization
- Mock API for development
- Error handling and retry logic
- Type-safe responses

### State Management
- React Context for global state
- Local state with React hooks
- Optimistic updates
- Error boundaries

## 📊 Features Overview

### Dashboard
- **Revenue Analytics** - Total earnings, growth metrics
- **Order Tracking** - Order counts, status distribution  
- **Product Metrics** - Total products, approval rates
- **Performance Charts** - Sales trends, top products

### Product Management
- **Product Catalog** - View, search, and filter products
- **Inventory Management** - Stock tracking, low inventory alerts
- **Approval Workflow** - Review and approve new products
- **Category Management** - Organize products by categories
- **Bulk Operations** - Mass updates and exports

### Order Management  
- **Order Processing** - View and manage all orders
- **Status Tracking** - Update order statuses and shipping
- **Customer Information** - Detailed customer profiles
- **Order Analytics** - Performance metrics and trends

### Payment Systems
- **Transaction History** - Complete payment records
- **Payout Management** - Automated payout scheduling
- **Payment Methods** - Manage connected payment accounts
- **Financial Reports** - Revenue, fees, and net earnings

### Notifications
- **Real-time Alerts** - Order updates, payment notifications
- **Notification Center** - Centralized message management
- **Preferences** - Customizable notification settings
- **Action Items** - Quick access to important tasks

### Settings & Configuration
- **Profile Management** - User account settings
- **Business Settings** - Company information and branding
- **Security** - Password changes, 2FA setup
- **Integrations** - Third-party service connections

## 🔌 API Integration

### Backend Services
The frontend is designed to work with a microservices backend:

- **Identity Service** (Port 7001) - Authentication & user management
- **Catalog Service** (Port 7002) - Product management
- **Order Service** (Port 7003) - Order processing
- **Payment Service** (Port 7004) - Payment processing
- **Notification Service** (Port 7005) - Real-time notifications
- **Analytics Service** (Port 7006) - Business intelligence
- **Support Service** (Port 7007) - Customer support
- **File Service** (Port 7008) - Media management

### API Services Usage

```typescript
import { productsService, ordersService, authService } from '@/lib';

// Authentication
await authService.login(credentials);
await authService.logout();

// Products
const products = await productsService.getProducts({ page: 1, limit: 10 });
await productsService.createProduct(productData);

// Orders
const orders = await ordersService.getOrders({ status: 'pending' });
await ordersService.updateOrderStatus(orderId, 'shipped');
```

## 🔧 Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Environment Variables
Key environment variables in `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:7000/api
NEXT_PUBLIC_MOCK_API=true

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Development Features
- **Hot Reload** - Instant updates during development
- **Mock API** - Complete mock backend for development
- **Type Safety** - Full TypeScript support
- **Error Boundaries** - Graceful error handling
- **Debug Mode** - Enhanced logging and debugging

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet** optimized layouts
- **Desktop** full-featured experience
- **Touch-friendly** interfaces
- **Accessible** components

## 🚀 Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Environment Setup
1. Configure production API URLs
2. Set up authentication secrets
3. Enable production optimizations
4. Configure CDN and static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**QuickCrate** - Empowering merchants with modern e-commerce tools 🚀