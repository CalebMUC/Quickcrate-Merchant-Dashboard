# Database Schema Design for QuickCrate Backend

## 🗄️ **Database Architecture Overview**

This document provides the complete database schema design for all QuickCrate microservices using PostgreSQL with Entity Framework Core migrations.

## 📊 **Database-per-Service Pattern**

Each microservice has its own dedicated database to ensure loose coupling and independent deployments:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   Identity DB       │  │   Catalog DB        │  │   Ordering DB       │
│  (Authentication)   │  │   (Products)        │  │   (Orders)          │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   Payment DB        │  │ Notification DB     │  │  Analytics DB       │
│ (Transactions)      │  │ (Notifications)     │  │  (Reports)          │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## 🔐 **1. Identity Database (quickcrate_identity)**

### **Users Table**
```sql
CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email VARCHAR(255) UNIQUE NOT NULL,
    Name VARCHAR(200) NOT NULL,
    PasswordHash VARCHAR(500) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'Merchant',
    MerchantId UUID NULL,
    Avatar VARCHAR(500) NULL,
    IsActive BOOLEAN DEFAULT true,
    EmailConfirmed BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_merchant_id ON Users(MerchantId);
```

### **Roles Table**
```sql
CREATE TABLE Roles (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(100) UNIQUE NOT NULL,
    Description VARCHAR(500) NULL,
    IsActive BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO Roles (Name, Description) VALUES 
('Admin', 'System Administrator'),
('Merchant', 'Merchant User'),
('Staff', 'Staff Member');
```

### **Permissions Table**
```sql
CREATE TABLE Permissions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(100) UNIQUE NOT NULL,
    Description VARCHAR(500) NULL,
    Module VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default permissions
INSERT INTO Permissions (Name, Description, Module) VALUES 
('products.read', 'View products', 'Products'),
('products.write', 'Create/Edit products', 'Products'),
('products.delete', 'Delete products', 'Products'),
('orders.read', 'View orders', 'Orders'),
('orders.write', 'Modify orders', 'Orders'),
('payments.read', 'View payments', 'Payments'),
('analytics.read', 'View analytics', 'Analytics');
```

### **UserPermissions Table (Many-to-Many)**
```sql
CREATE TABLE UserPermissions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    PermissionId UUID NOT NULL REFERENCES Permissions(Id) ON DELETE CASCADE,
    GrantedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    GrantedBy UUID REFERENCES Users(Id),
    UNIQUE(UserId, PermissionId)
);

CREATE INDEX idx_user_permissions_user_id ON UserPermissions(UserId);
```

### **RefreshTokens Table**
```sql
CREATE TABLE RefreshTokens (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Token VARCHAR(500) UNIQUE NOT NULL,
    ExpiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    IsRevoked BOOLEAN DEFAULT false,
    RevokedAt TIMESTAMP WITH TIME ZONE NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON RefreshTokens(UserId);
CREATE INDEX idx_refresh_tokens_token ON RefreshTokens(Token);
```

## 🛍️ **2. Catalog Database (quickcrate_catalog)**

### **Categories Table**
```sql
CREATE TABLE Categories (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(200) UNIQUE NOT NULL,
    Description TEXT NULL,
    ParentId UUID NULL REFERENCES Categories(Id),
    ImageUrl VARCHAR(500) NULL,
    IsActive BOOLEAN DEFAULT true,
    DisplayOrder INTEGER DEFAULT 0,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON Categories(ParentId);
CREATE INDEX idx_categories_active ON Categories(IsActive);
```

### **Products Table**
```sql
CREATE TABLE Products (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(200) NOT NULL,
    Description TEXT NULL,
    ShortDescription VARCHAR(500) NULL,
    SKU VARCHAR(100) UNIQUE NOT NULL,
    CategoryId UUID NOT NULL REFERENCES Categories(Id),
    Price DECIMAL(18,2) NOT NULL,
    ComparePrice DECIMAL(18,2) NULL,
    CostPerItem DECIMAL(18,2) NULL,
    Stock INTEGER DEFAULT 0,
    LowStockThreshold INTEGER DEFAULT 10,
    Status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    MerchantId UUID NOT NULL,
    Rating DECIMAL(3,2) DEFAULT 0.0,
    ReviewCount INTEGER DEFAULT 0,
    SalesCount INTEGER DEFAULT 0,
    Weight DECIMAL(10,3) NULL,
    Dimensions VARCHAR(100) NULL, -- JSON: {"length": 10, "width": 5, "height": 3}
    IsActive BOOLEAN DEFAULT true,
    IsFeatured BOOLEAN DEFAULT false,
    MetaTitle VARCHAR(200) NULL,
    MetaDescription VARCHAR(500) NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON Products(CategoryId);
CREATE INDEX idx_products_merchant_id ON Products(MerchantId);
CREATE INDEX idx_products_status ON Products(Status);
CREATE INDEX idx_products_active ON Products(IsActive);
CREATE INDEX idx_products_price ON Products(Price);
CREATE INDEX idx_products_sales_count ON Products(SalesCount DESC);
CREATE INDEX idx_products_created_at ON Products(CreatedAt DESC);
```

### **ProductImages Table**
```sql
CREATE TABLE ProductImages (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ProductId UUID NOT NULL REFERENCES Products(Id) ON DELETE CASCADE,
    ImageUrl VARCHAR(500) NOT NULL,
    AltText VARCHAR(200) NULL,
    DisplayOrder INTEGER DEFAULT 0,
    IsPrimary BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON ProductImages(ProductId);
CREATE INDEX idx_product_images_display_order ON ProductImages(DisplayOrder);
```

### **ProductVariants Table (for size, color, etc.)**
```sql
CREATE TABLE ProductVariants (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ProductId UUID NOT NULL REFERENCES Products(Id) ON DELETE CASCADE,
    Name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
    Value VARCHAR(100) NOT NULL, -- e.g., "Large", "Red"
    Price DECIMAL(18,2) NULL, -- Additional price for variant
    Stock INTEGER DEFAULT 0,
    SKU VARCHAR(100) UNIQUE NOT NULL,
    IsActive BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON ProductVariants(ProductId);
CREATE UNIQUE INDEX idx_product_variants_sku ON ProductVariants(SKU);
```

### **ProductReviews Table**
```sql
CREATE TABLE ProductReviews (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ProductId UUID NOT NULL REFERENCES Products(Id) ON DELETE CASCADE,
    CustomerId UUID NOT NULL,
    CustomerName VARCHAR(200) NOT NULL,
    Rating INTEGER CHECK (Rating >= 1 AND Rating <= 5),
    Title VARCHAR(200) NULL,
    Comment TEXT NULL,
    IsVerifiedPurchase BOOLEAN DEFAULT false,
    IsApproved BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_reviews_product_id ON ProductReviews(ProductId);
CREATE INDEX idx_product_reviews_rating ON ProductReviews(Rating);
CREATE INDEX idx_product_reviews_approved ON ProductReviews(IsApproved);
```

## 📦 **3. Ordering Database (quickcrate_ordering)**

### **Orders Table**
```sql
CREATE TABLE Orders (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderNumber VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number
    CustomerId UUID NOT NULL,
    CustomerName VARCHAR(200) NOT NULL,
    CustomerEmail VARCHAR(255) NOT NULL,
    MerchantId UUID NOT NULL,
    Status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled, Refunded
    SubTotal DECIMAL(18,2) NOT NULL,
    TaxAmount DECIMAL(18,2) DEFAULT 0,
    ShippingAmount DECIMAL(18,2) DEFAULT 0,
    DiscountAmount DECIMAL(18,2) DEFAULT 0,
    Total DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'USD',
    PaymentStatus VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid, Failed, Refunded
    PaymentMethod VARCHAR(50) NULL,
    Notes TEXT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON Orders(CustomerId);
CREATE INDEX idx_orders_merchant_id ON Orders(MerchantId);
CREATE INDEX idx_orders_status ON Orders(Status);
CREATE INDEX idx_orders_payment_status ON Orders(PaymentStatus);
CREATE INDEX idx_orders_created_at ON Orders(CreatedAt DESC);
CREATE UNIQUE INDEX idx_orders_order_number ON Orders(OrderNumber);
```

### **OrderItems Table**
```sql
CREATE TABLE OrderItems (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderId UUID NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    ProductId UUID NOT NULL,
    ProductName VARCHAR(200) NOT NULL,
    ProductSKU VARCHAR(100) NOT NULL,
    VariantId UUID NULL, -- Reference to ProductVariant if applicable
    Quantity INTEGER NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    ProductSnapshot JSONB NULL, -- Store product data at time of order
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON OrderItems(OrderId);
CREATE INDEX idx_order_items_product_id ON OrderItems(ProductId);
```

### **Addresses Table**
```sql
CREATE TABLE Addresses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderId UUID NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    Type VARCHAR(20) NOT NULL, -- 'Shipping' or 'Billing'
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Company VARCHAR(200) NULL,
    Street VARCHAR(500) NOT NULL,
    Street2 VARCHAR(500) NULL,
    City VARCHAR(100) NOT NULL,
    State VARCHAR(100) NOT NULL,
    PostalCode VARCHAR(20) NOT NULL,
    Country VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_order_id ON Addresses(OrderId);
```

### **OrderHistory Table**
```sql
CREATE TABLE OrderHistory (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderId UUID NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    Status VARCHAR(50) NOT NULL,
    Comment TEXT NULL,
    UpdatedBy UUID NULL, -- User who made the change
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_history_order_id ON OrderHistory(OrderId);
CREATE INDEX idx_order_history_created_at ON OrderHistory(CreatedAt DESC);
```

### **Shipments Table**
```sql
CREATE TABLE Shipments (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OrderId UUID NOT NULL REFERENCES Orders(Id) ON DELETE CASCADE,
    TrackingNumber VARCHAR(100) NULL,
    Carrier VARCHAR(100) NULL,
    ShippingMethod VARCHAR(100) NULL,
    ShippedAt TIMESTAMP WITH TIME ZONE NULL,
    EstimatedDelivery TIMESTAMP WITH TIME ZONE NULL,
    DeliveredAt TIMESTAMP WITH TIME ZONE NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipments_order_id ON Shipments(OrderId);
CREATE INDEX idx_shipments_tracking_number ON Shipments(TrackingNumber);
```

## 💳 **4. Payment Database (quickcrate_payment)**

### **Transactions Table**
```sql
CREATE TABLE Transactions (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TransactionNumber VARCHAR(50) UNIQUE NOT NULL,
    OrderId UUID NOT NULL,
    MerchantId UUID NOT NULL,
    CustomerId UUID NOT NULL,
    CustomerEmail VARCHAR(255) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'USD',
    Fee DECIMAL(18,2) DEFAULT 0, -- Platform/Payment processor fee
    NetAmount DECIMAL(18,2) NOT NULL, -- Amount - Fee
    Status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Failed, Refunded
    PaymentMethod VARCHAR(50) NOT NULL, -- CreditCard, PayPal, BankTransfer, etc.
    PaymentProvider VARCHAR(50) NULL, -- Stripe, Square, PayPal, etc.
    PaymentIntentId VARCHAR(200) NULL, -- External payment provider reference
    FailureReason TEXT NULL,
    Metadata JSONB NULL, -- Additional payment data
    ProcessedAt TIMESTAMP WITH TIME ZONE NULL,
    CompletedAt TIMESTAMP WITH TIME ZONE NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_order_id ON Transactions(OrderId);
CREATE INDEX idx_transactions_merchant_id ON Transactions(MerchantId);
CREATE INDEX idx_transactions_customer_id ON Transactions(CustomerId);
CREATE INDEX idx_transactions_status ON Transactions(Status);
CREATE INDEX idx_transactions_created_at ON Transactions(CreatedAt DESC);
CREATE UNIQUE INDEX idx_transactions_number ON Transactions(TransactionNumber);
```

### **PaymentMethods Table**
```sql
CREATE TABLE PaymentMethods (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    MerchantId UUID NOT NULL,
    Type VARCHAR(50) NOT NULL, -- CreditCard, BankAccount, PayPal
    Name VARCHAR(200) NOT NULL,
    Last4 VARCHAR(10) NULL, -- Last 4 digits for cards
    ExpiryMonth INTEGER NULL, -- For credit cards
    ExpiryYear INTEGER NULL, -- For credit cards
    Brand VARCHAR(50) NULL, -- Visa, MasterCard, etc.
    IsPrimary BOOLEAN DEFAULT false,
    IsActive BOOLEAN DEFAULT true,
    ExternalId VARCHAR(200) NULL, -- Reference to payment provider
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_merchant_id ON PaymentMethods(MerchantId);
CREATE INDEX idx_payment_methods_primary ON PaymentMethods(IsPrimary);
```

### **Payouts Table**
```sql
CREATE TABLE Payouts (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    PayoutNumber VARCHAR(50) UNIQUE NOT NULL,
    MerchantId UUID NOT NULL,
    PaymentMethodId UUID NOT NULL REFERENCES PaymentMethods(Id),
    Amount DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'USD',
    Status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Failed
    ScheduledFor TIMESTAMP WITH TIME ZONE NOT NULL,
    ProcessedAt TIMESTAMP WITH TIME ZONE NULL,
    CompletedAt TIMESTAMP WITH TIME ZONE NULL,
    FailureReason TEXT NULL,
    ExternalId VARCHAR(200) NULL,
    TransactionCount INTEGER DEFAULT 0,
    PeriodStart TIMESTAMP WITH TIME ZONE NOT NULL,
    PeriodEnd TIMESTAMP WITH TIME ZONE NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payouts_merchant_id ON Payouts(MerchantId);
CREATE INDEX idx_payouts_status ON Payouts(Status);
CREATE INDEX idx_payouts_scheduled_for ON Payouts(ScheduledFor);
```

### **Refunds Table**
```sql
CREATE TABLE Refunds (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    RefundNumber VARCHAR(50) UNIQUE NOT NULL,
    TransactionId UUID NOT NULL REFERENCES Transactions(Id),
    Amount DECIMAL(18,2) NOT NULL,
    Reason VARCHAR(500) NULL,
    Status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Failed
    ProcessedAt TIMESTAMP WITH TIME ZONE NULL,
    CompletedAt TIMESTAMP WITH TIME ZONE NULL,
    ExternalId VARCHAR(200) NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refunds_transaction_id ON Refunds(TransactionId);
CREATE INDEX idx_refunds_status ON Refunds(Status);
```

## 🔔 **5. Notification Database (quickcrate_notification)**

### **Notifications Table**
```sql
CREATE TABLE Notifications (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    Type VARCHAR(50) NOT NULL, -- Order, Payment, Inventory, Approval, System
    Priority VARCHAR(20) DEFAULT 'Normal', -- Low, Normal, High, Urgent
    ActionUrl VARCHAR(500) NULL,
    IsRead BOOLEAN DEFAULT false,
    ReadAt TIMESTAMP WITH TIME ZONE NULL,
    ExpiresAt TIMESTAMP WITH TIME ZONE NULL,
    Metadata JSONB NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON Notifications(UserId);
CREATE INDEX idx_notifications_type ON Notifications(Type);
CREATE INDEX idx_notifications_is_read ON Notifications(IsRead);
CREATE INDEX idx_notifications_created_at ON Notifications(CreatedAt DESC);
```

### **NotificationPreferences Table**
```sql
CREATE TABLE NotificationPreferences (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID UNIQUE NOT NULL,
    EmailEnabled BOOLEAN DEFAULT true,
    PushEnabled BOOLEAN DEFAULT true,
    SmsEnabled BOOLEAN DEFAULT false,
    OrderUpdates BOOLEAN DEFAULT true,
    PaymentAlerts BOOLEAN DEFAULT true,
    InventoryAlerts BOOLEAN DEFAULT true,
    MarketingEmails BOOLEAN DEFAULT false,
    WeeklyReports BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_notification_preferences_user_id ON NotificationPreferences(UserId);
```

### **NotificationTemplates Table**
```sql
CREATE TABLE NotificationTemplates (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(100) UNIQUE NOT NULL,
    Type VARCHAR(50) NOT NULL, -- Email, Push, SMS
    Subject VARCHAR(200) NULL,
    Body TEXT NOT NULL,
    Variables JSONB NULL, -- Template variables
    IsActive BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_name ON NotificationTemplates(Name);
CREATE INDEX idx_notification_templates_type ON NotificationTemplates(Type);
```

## 📊 **6. Analytics Database (quickcrate_analytics)**

### **SalesMetrics Table**
```sql
CREATE TABLE SalesMetrics (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    MerchantId UUID NOT NULL,
    Date DATE NOT NULL,
    Revenue DECIMAL(18,2) DEFAULT 0,
    Orders INTEGER DEFAULT 0,
    Customers INTEGER DEFAULT 0,
    NewCustomers INTEGER DEFAULT 0,
    AverageOrderValue DECIMAL(18,2) DEFAULT 0,
    ConversionRate DECIMAL(5,4) DEFAULT 0,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_sales_metrics_merchant_date ON SalesMetrics(MerchantId, Date);
CREATE INDEX idx_sales_metrics_date ON SalesMetrics(Date DESC);
```

### **ProductMetrics Table**
```sql
CREATE TABLE ProductMetrics (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ProductId UUID NOT NULL,
    MerchantId UUID NOT NULL,
    Date DATE NOT NULL,
    Views INTEGER DEFAULT 0,
    Sales INTEGER DEFAULT 0,
    Revenue DECIMAL(18,2) DEFAULT 0,
    ConversionRate DECIMAL(5,4) DEFAULT 0,
    ReturnRate DECIMAL(5,4) DEFAULT 0,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_product_metrics_product_date ON ProductMetrics(ProductId, Date);
CREATE INDEX idx_product_metrics_merchant_id ON ProductMetrics(MerchantId);
CREATE INDEX idx_product_metrics_date ON ProductMetrics(Date DESC);
```

### **CustomerMetrics Table**
```sql
CREATE TABLE CustomerMetrics (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    MerchantId UUID NOT NULL,
    Date DATE NOT NULL,
    TotalCustomers INTEGER DEFAULT 0,
    NewCustomers INTEGER DEFAULT 0,
    ReturningCustomers INTEGER DEFAULT 0,
    ChurnRate DECIMAL(5,4) DEFAULT 0,
    LifetimeValue DECIMAL(18,2) DEFAULT 0,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_customer_metrics_merchant_date ON CustomerMetrics(MerchantId, Date);
CREATE INDEX idx_customer_metrics_date ON CustomerMetrics(Date DESC);
```

### **RevenueReports Table**
```sql
CREATE TABLE RevenueReports (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    MerchantId UUID NOT NULL,
    ReportType VARCHAR(50) NOT NULL, -- Daily, Weekly, Monthly, Yearly
    PeriodStart DATE NOT NULL,
    PeriodEnd DATE NOT NULL,
    GrossRevenue DECIMAL(18,2) DEFAULT 0,
    NetRevenue DECIMAL(18,2) DEFAULT 0,
    Fees DECIMAL(18,2) DEFAULT 0,
    Refunds DECIMAL(18,2) DEFAULT 0,
    Orders INTEGER DEFAULT 0,
    Growth DECIMAL(8,4) DEFAULT 0, -- Growth percentage compared to previous period
    Metadata JSONB NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_revenue_reports_merchant_id ON RevenueReports(MerchantId);
CREATE INDEX idx_revenue_reports_type ON RevenueReports(ReportType);
CREATE INDEX idx_revenue_reports_period ON RevenueReports(PeriodStart, PeriodEnd);
```

## 🔧 **Entity Framework Configuration Examples**

### **DbContext Configuration**
```csharp
// Example for Identity DbContext
public class IdentityDbContext : DbContext
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<UserPermission> UserPermissions { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Email).IsUnique();
            
            // Set default values
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        // Many-to-Many relationship
        modelBuilder.Entity<UserPermission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne<User>().WithMany().HasForeignKey(e => e.UserId);
            entity.HasOne<Permission>().WithMany().HasForeignKey(e => e.PermissionId);
            entity.HasIndex(e => new { e.UserId, e.PermissionId }).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
```

### **Connection Strings Configuration**
```json
{
  "ConnectionStrings": {
    "IdentityConnection": "Host=localhost;Database=quickcrate_identity;Username=postgres;Password=password",
    "CatalogConnection": "Host=localhost;Database=quickcrate_catalog;Username=postgres;Password=password",
    "OrderingConnection": "Host=localhost;Database=quickcrate_ordering;Username=postgres;Password=password",
    "PaymentConnection": "Host=localhost;Database=quickcrate_payment;Username=postgres;Password=password",
    "NotificationConnection": "Host=localhost;Database=quickcrate_notification;Username=postgres;Password=password",
    "AnalyticsConnection": "Host=localhost;Database=quickcrate_analytics;Username=postgres;Password=password"
  }
}
```

This comprehensive database schema provides a solid foundation for the QuickCrate backend services, ensuring data integrity, performance, and scalability while maintaining the microservices architecture principles.