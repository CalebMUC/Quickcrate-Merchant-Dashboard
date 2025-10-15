# QuickCrate Backend - Visual Studio 2022 Project Templates

## 🎯 **Quick Start Templates for Each Service**

This document provides ready-to-use project templates and code snippets for rapidly setting up each microservice in Visual Studio 2022.

## 🔧 **1. Identity Service Template**

### **Project Structure**
```
QuickCrate.Identity.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── UsersController.cs
│   └── RolesController.cs
├── Models/
│   ├── DTOs/
│   │   ├── LoginRequestDto.cs
│   │   ├── LoginResponseDto.cs
│   │   └── UserDto.cs
│   └── Entities/
│       ├── User.cs
│       ├── Role.cs
│       └── RefreshToken.cs
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IJwtService.cs
│   └── JwtService.cs
├── Data/
│   ├── IdentityDbContext.cs
│   └── Repositories/
├── Migrations/
└── Program.cs
```

### **Program.cs Template**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuickCrate.Identity.API.Data;
using QuickCrate.Identity.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3002")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### **AuthController.cs Template**
```csharp
using Microsoft.AspNetCore.Mvc;
using QuickCrate.Identity.API.Models.DTOs;
using QuickCrate.Identity.API.Services;

namespace QuickCrate.Identity.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequestDto request)
        {
            try
            {
                var user = await _authService.RegisterAsync(request);
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<LoginResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid refresh token" });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequestDto request)
        {
            await _authService.LogoutAsync(request);
            return Ok(new { message = "Logged out successfully" });
        }
    }
}
```

## 🛍️ **2. Catalog Service Template**

### **Product Entity**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCrate.Catalog.API.Models.Entities
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid CategoryId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int Stock { get; set; }

        public ProductStatus Status { get; set; } = ProductStatus.Pending;

        public List<string> Images { get; set; } = new();

        [Column(TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; }

        public int SalesCount { get; set; }

        [Required]
        public Guid MerchantId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Category Category { get; set; } = null!;
    }

    public enum ProductStatus
    {
        Pending,
        Approved,
        Rejected
    }
}
```

### **ProductsController.cs Template**
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickCrate.Catalog.API.Models.DTOs;
using QuickCrate.Catalog.API.Services;

namespace QuickCrate.Catalog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResult<ProductDto>>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? search = null,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] string? status = null)
        {
            var result = await _productService.GetProductsAsync(page, limit, search, categoryId, status);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound();

            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createDto)
        {
            var product = await _productService.CreateProductAsync(createDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductDto updateDto)
        {
            var product = await _productService.UpdateProductAsync(id, updateDto);
            if (product == null)
                return NotFound();

            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var deleted = await _productService.DeleteProductAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> ApproveProduct(Guid id)
        {
            var product = await _productService.ApproveProductAsync(id);
            if (product == null)
                return NotFound();

            return Ok(product);
        }
    }
}
```

## 📦 **3. Ordering Service Template**

### **Order Entity**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCrate.Ordering.API.Models.Entities
{
    public class Order
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CustomerId { get; set; }

        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public string CustomerEmail { get; set; } = string.Empty;

        public List<OrderItem> Items { get; set; } = new();

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Required]
        public Address ShippingAddress { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class OrderItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public Guid ProductId { get; set; }

        [Required]
        public string ProductName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        // Navigation Properties
        public Order Order { get; set; } = null!;
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }
}
```

## 💳 **4. Payment Service Template**

### **Transaction Entity**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCrate.Payment.API.Models.Entities
{
    public class Transaction
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public Guid MerchantId { get; set; }

        [Required]
        public string CustomerEmail { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Fee { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; }

        public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

        public PaymentMethod Method { get; set; }

        public string? PaymentIntentId { get; set; }

        public string? FailureReason { get; set; }

        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }

    public enum TransactionStatus
    {
        Pending,
        Processing,
        Completed,
        Failed,
        Refunded
    }

    public enum PaymentMethod
    {
        CreditCard,
        PayPal,
        BankTransfer,
        Stripe,
        Square
    }
}
```

### **PaymentsController.cs Template**
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickCrate.Payment.API.Models.DTOs;
using QuickCrate.Payment.API.Services;

namespace QuickCrate.Payment.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("process")]
        public async Task<ActionResult<PaymentResultDto>> ProcessPayment([FromBody] ProcessPaymentDto request)
        {
            try
            {
                var result = await _paymentService.ProcessPaymentAsync(request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<PaginatedResult<TransactionDto>>> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10,
            [FromQuery] string? status = null)
        {
            var transactions = await _paymentService.GetTransactionsAsync(page, limit, status);
            return Ok(transactions);
        }

        [HttpGet("transactions/{id}")]
        public async Task<ActionResult<TransactionDto>> GetTransaction(Guid id)
        {
            var transaction = await _paymentService.GetTransactionByIdAsync(id);
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpPost("refund/{transactionId}")]
        public async Task<ActionResult<RefundResultDto>> RefundTransaction(Guid transactionId, [FromBody] RefundRequestDto request)
        {
            try
            {
                var result = await _paymentService.RefundTransactionAsync(transactionId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
```

## 🔔 **5. Notification Service Template**

### **SignalR Hub**
```csharp
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace QuickCrate.Notification.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task JoinMerchantGroup(string merchantId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"merchant_{merchantId}");
        }

        public async Task LeaveMerchantGroup(string merchantId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"merchant_{merchantId}");
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
```

### **Notification Service**
```csharp
using Microsoft.AspNetCore.SignalR;
using QuickCrate.Notification.API.Hubs;
using QuickCrate.Notification.API.Models.Entities;
using QuickCrate.Notification.API.Models.DTOs;

namespace QuickCrate.Notification.API.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto);
        Task SendRealTimeNotificationAsync(Guid userId, NotificationDto notification);
        Task<PaginatedResult<NotificationDto>> GetNotificationsAsync(Guid userId, int page, int limit);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<NotificationDto?> MarkAsReadAsync(Guid notificationId, Guid userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly INotificationRepository _repository;

        public NotificationService(
            IHubContext<NotificationHub> hubContext,
            INotificationRepository repository)
        {
            _hubContext = hubContext;
            _repository = repository;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            var notification = new Notification
            {
                UserId = createDto.UserId,
                Title = createDto.Title,
                Message = createDto.Message,
                Type = createDto.Type,
                ActionUrl = createDto.ActionUrl
            };

            await _repository.AddAsync(notification);

            var notificationDto = MapToDto(notification);
            await SendRealTimeNotificationAsync(createDto.UserId, notificationDto);

            return notificationDto;
        }

        public async Task SendRealTimeNotificationAsync(Guid userId, NotificationDto notification)
        {
            await _hubContext.Clients.Group($"user_{userId}")
                .SendAsync("ReceiveNotification", notification);
        }

        // Other methods...
    }
}
```

## 📊 **6. Analytics Service Template**

### **AnalyticsController.cs Template**
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickCrate.Analytics.API.Models.DTOs;
using QuickCrate.Analytics.API.Services;

namespace QuickCrate.Analytics.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardAnalyticsDto>> GetDashboardAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var analytics = await _analyticsService.GetDashboardAnalyticsAsync(startDate, endDate);
            return Ok(analytics);
        }

        [HttpGet("sales")]
        public async Task<ActionResult<SalesMetricDto>> GetSalesMetrics(
            [FromQuery] string period = "30d")
        {
            var metrics = await _analyticsService.GetSalesMetricsAsync(period);
            return Ok(metrics);
        }

        [HttpGet("top-products")]
        public async Task<ActionResult<List<TopProductDto>>> GetTopProducts(
            [FromQuery] int limit = 10)
        {
            var products = await _analyticsService.GetTopProductsAsync(limit);
            return Ok(products);
        }

        [HttpGet("revenue-trends")]
        public async Task<ActionResult<List<RevenueTrendDto>>> GetRevenueTrends(
            [FromQuery] string period = "30d")
        {
            var trends = await _analyticsService.GetRevenueTrendsAsync(period);
            return Ok(trends);
        }
    }
}
```

## 🚪 **7. API Gateway Template (Ocelot)**

### **ocelot.json Configuration**
```json
{
  "Routes": [
    // Identity Service Routes
    {
      "UpstreamPathTemplate": "/api/auth/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "DownstreamPathTemplate": "/api/auth/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPort": {
        "Host": "identity-service",
        "Port": 80
      }
    },
    // Catalog Service Routes
    {
      "UpstreamPathTemplate": "/api/products/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "DownstreamPathTemplate": "/api/products/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPort": {
        "Host": "catalog-service",
        "Port": 80
      },
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    },
    // Ordering Service Routes
    {
      "UpstreamPathTemplate": "/api/orders/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "DownstreamPathTemplate": "/api/orders/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPort": {
        "Host": "ordering-service",
        "Port": 80
      },
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    },
    // Payment Service Routes
    {
      "UpstreamPathTemplate": "/api/payments/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
      "DownstreamPathTemplate": "/api/payments/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPort": {
        "Host": "payment-service",
        "Port": 80
      },
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    },
    // Analytics Service Routes
    {
      "UpstreamPathTemplate": "/api/analytics/{everything}",
      "UpstreamHttpMethod": [ "GET", "POST" ],
      "DownstreamPathTemplate": "/api/analytics/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPort": {
        "Host": "analytics-service",
        "Port": 80
      },
      "AuthenticationOptions": {
        "AuthenticationProviderKey": "Bearer"
      }
    }
  ],
  "GlobalConfiguration": {
    "BaseUrl": "http://localhost:5000"
  }
}
```

### **API Gateway Program.cs**
```csharp
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add Ocelot
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3002")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");
await app.UseOcelot();

app.Run();
```

## 🗃️ **Database Migration Commands**

### **Entity Framework Commands for Each Service**
```bash
# Identity Service
dotnet ef migrations add InitialCreate --project QuickCrate.Identity.API
dotnet ef database update --project QuickCrate.Identity.API

# Catalog Service
dotnet ef migrations add InitialCreate --project QuickCrate.Catalog.API
dotnet ef database update --project QuickCrate.Catalog.API

# Ordering Service
dotnet ef migrations add InitialCreate --project QuickCrate.Ordering.API
dotnet ef database update --project QuickCrate.Ordering.API

# Payment Service
dotnet ef migrations add InitialCreate --project QuickCrate.Payment.API
dotnet ef database update --project QuickCrate.Payment.API

# Notification Service
dotnet ef migrations add InitialCreate --project QuickCrate.Notification.API
dotnet ef database update --project QuickCrate.Notification.API

# Analytics Service
dotnet ef migrations add InitialCreate --project QuickCrate.Analytics.API
dotnet ef database update --project QuickCrate.Analytics.API
```

## 🧪 **Unit Test Templates**

### **Service Unit Test Example**
```csharp
using Xunit;
using Moq;
using QuickCrate.Identity.API.Services;
using QuickCrate.Identity.API.Repositories;
using QuickCrate.Identity.API.Models.DTOs;

namespace QuickCrate.Identity.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IJwtService> _jwtServiceMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _jwtServiceMock = new Mock<IJwtService>();
            _authService = new AuthService(_userRepositoryMock.Object, _jwtServiceMock.Object);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsLoginResponse()
        {
            // Arrange
            var loginRequest = new LoginRequestDto
            {
                Email = "test@example.com",
                Password = "password123"
            };

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = loginRequest.Email,
                PasswordHash = "hashedpassword"
            };

            _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginRequest.Email))
                .ReturnsAsync(user);

            _jwtServiceMock.Setup(x => x.GenerateToken(user))
                .Returns("mock-jwt-token");

            // Act
            var result = await _authService.LoginAsync(loginRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("mock-jwt-token", result.Token);
            Assert.Equal(user.Email, result.User.Email);
        }
    }
}
```

This template collection provides you with ready-to-use code structures for rapidly implementing each microservice in Visual Studio 2022. Each template includes the essential components needed to get started quickly while maintaining best practices and proper architecture patterns.