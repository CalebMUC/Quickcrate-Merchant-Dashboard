using MerchantService.Model;
using MerchantService.Model.Auth;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MerchantService.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Merchants> Merchants { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<UserLoginAttempt> UserLoginAttempts { get; set; }
        
        // Categories Management
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<SubSubCategory> SubSubCategories { get; set; }
        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Merchant-User relationship
            builder.Entity<Merchants>()
                .HasOne(m => m.User)
                .WithOne(u => u.Merchant)
                .HasForeignKey<Merchants>(m => m.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // RefreshToken configuration
            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Token)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.JwtId)
                    .IsRequired()
                    .HasMaxLength(450);

                entity.Property(e => e.UserId)
                    .IsRequired()
                    .HasMaxLength(450);

                entity.Property(e => e.CreationDate)
                    .HasDefaultValueSql("GETUTCDATE()");

                // RefreshToken-User relationship
                entity.HasOne(rt => rt.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Index for performance
                entity.HasIndex(e => e.Token)
                    .IsUnique();

                entity.HasIndex(e => e.UserId);

                entity.HasIndex(e => e.ExpiryDate);
            });

            // UserLoginAttempt configuration
            builder.Entity<UserLoginAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(256);

                entity.Property(e => e.IpAddress)
                    .IsRequired()
                    .HasMaxLength(45);

                entity.Property(e => e.AttemptDate)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UserAgent)
                    .HasMaxLength(1000);

                // Indexes for performance
                entity.HasIndex(e => new { e.Email, e.AttemptDate })
                    .HasDatabaseName("IX_UserLoginAttempts_Email_AttemptDate");

                entity.HasIndex(e => new { e.IpAddress, e.AttemptDate })
                    .HasDatabaseName("IX_UserLoginAttempts_IpAddress_AttemptDate");

                entity.HasIndex(e => e.Success);
            });

            // ApplicationUser configuration updates
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.MerchantId)
                    .IsRequired()
                    .HasMaxLength(450);

                entity.Property(e => e.IsTemporaryPassword)
                    .HasDefaultValue(true);

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                // Index for performance
                entity.HasIndex(e => e.MerchantId)
                    .IsUnique();

                entity.HasIndex(e => e.Email)
                    .IsUnique();
            });

            // ====================================
            // CATEGORIES CONFIGURATION
            // ====================================

            // Category configuration
            builder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.Slug)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.SortOrder)
                    .HasDefaultValue(0);

                entity.Property(e => e.ProductCount)
                    .HasDefaultValue(0);

                entity.Property(e => e.CreatedOn)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.UpdatedBy)
                    .HasMaxLength(255);

                entity.Property(e => e.ImageUrl)
                    .HasMaxLength(500);

                entity.Property(e => e.MetaTitle)
                    .HasMaxLength(255);

                entity.Property(e => e.MetaDescription)
                    .HasMaxLength(500);

                // Category-Merchant relationship
                entity.HasOne(c => c.Merchant)
                    .WithMany()
                    .HasForeignKey(c => c.MerchantId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Self-referencing relationship for hierarchical categories
                entity.HasOne(c => c.Parent)
                    .WithMany(c => c.Children)
                    .HasForeignKey(c => c.ParentId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indexes for performance
                entity.HasIndex(e => e.MerchantId)
                    .HasDatabaseName("IX_Categories_MerchantId");

                entity.HasIndex(e => e.IsActive)
                    .HasDatabaseName("IX_Categories_IsActive");

                entity.HasIndex(e => e.SortOrder)
                    .HasDatabaseName("IX_Categories_SortOrder");

                entity.HasIndex(e => new { e.Slug, e.MerchantId })
                    .IsUnique()
                    .HasDatabaseName("UQ_Categories_Slug_MerchantId");

                entity.HasIndex(e => new { e.MerchantId, e.IsActive, e.SortOrder })
                    .HasDatabaseName("IX_Categories_MerchantId_IsActive_SortOrder");

                entity.HasIndex(e => e.ParentId)
                    .HasDatabaseName("IX_Categories_ParentId");
            });

            // SubCategory configuration
            builder.Entity<SubCategory>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.Slug)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.SortOrder)
                    .HasDefaultValue(0);

                entity.Property(e => e.ProductCount)
                    .HasDefaultValue(0);

                entity.Property(e => e.CreatedOn)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.UpdatedBy)
                    .HasMaxLength(255);

                entity.Property(e => e.ImageUrl)
                    .HasMaxLength(500);

                // SubCategory-Category relationship
                entity.HasOne(sc => sc.Category)
                    .WithMany(c => c.SubCategories)
                    .HasForeignKey(sc => sc.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);

                // SubCategory-Merchant relationship
                entity.HasOne(sc => sc.Merchant)
                    .WithMany()
                    .HasForeignKey(sc => sc.MerchantId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indexes for performance
                entity.HasIndex(e => e.CategoryId)
                    .HasDatabaseName("IX_SubCategories_CategoryId");

                entity.HasIndex(e => e.MerchantId)
                    .HasDatabaseName("IX_SubCategories_MerchantId");

                entity.HasIndex(e => e.IsActive)
                    .HasDatabaseName("IX_SubCategories_IsActive");

                entity.HasIndex(e => e.SortOrder)
                    .HasDatabaseName("IX_SubCategories_SortOrder");

                entity.HasIndex(e => new { e.Slug, e.MerchantId })
                    .IsUnique()
                    .HasDatabaseName("UQ_SubCategories_Slug_MerchantId");

                entity.HasIndex(e => new { e.CategoryId, e.IsActive, e.SortOrder })
                    .HasDatabaseName("IX_SubCategories_CategoryId_IsActive_SortOrder");
            });

            // SubSubCategory configuration
            builder.Entity<SubSubCategory>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.Slug)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.SortOrder)
                    .HasDefaultValue(0);

                entity.Property(e => e.ProductCount)
                    .HasDefaultValue(0);

                entity.Property(e => e.CreatedOn)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.UpdatedBy)
                    .HasMaxLength(255);

                entity.Property(e => e.ImageUrl)
                    .HasMaxLength(500);

                // SubSubCategory-SubCategory relationship
                entity.HasOne(ssc => ssc.SubCategory)
                    .WithMany(sc => sc.SubSubCategories)
                    .HasForeignKey(ssc => ssc.SubCategoryId)
                    .OnDelete(DeleteBehavior.Cascade);

                // SubSubCategory-Merchant relationship
                entity.HasOne(ssc => ssc.Merchant)
                    .WithMany()
                    .HasForeignKey(ssc => ssc.MerchantId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Indexes for performance
                entity.HasIndex(e => e.SubCategoryId)
                    .HasDatabaseName("IX_SubSubCategories_SubCategoryId");

                entity.HasIndex(e => e.MerchantId)
                    .HasDatabaseName("IX_SubSubCategories_MerchantId");

                entity.HasIndex(e => e.IsActive)
                    .HasDatabaseName("IX_SubSubCategories_IsActive");

                entity.HasIndex(e => e.SortOrder)
                    .HasDatabaseName("IX_SubSubCategories_SortOrder");

                entity.HasIndex(e => new { e.Slug, e.MerchantId })
                    .IsUnique()
                    .HasDatabaseName("UQ_SubSubCategories_Slug_MerchantId");

                entity.HasIndex(e => new { e.SubCategoryId, e.IsActive, e.SortOrder })
                    .HasDatabaseName("IX_SubSubCategories_SubCategoryId_IsActive_SortOrder");
            });

            // ====================================
            // PRODUCT CONFIGURATION
            // ====================================

            // Product configuration
            builder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.ProductId);

                entity.Property(e => e.ProductName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description)
                    .HasMaxLength(2000);

                entity.Property(e => e.ProductDescription)
                    .HasMaxLength(2000);

                entity.Property(e => e.Price)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(e => e.Discount)
                    .HasColumnType("decimal(18,2)")
                    .HasDefaultValue(0);

                entity.Property(e => e.StockQuantity)
                    .HasDefaultValue(0);

                entity.Property(e => e.SKU)
                    .HasMaxLength(100);

                entity.Property(e => e.CategoryName)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.SubCategoryName)
                    .HasMaxLength(255);

                entity.Property(e => e.SubSubCategoryName)
                    .HasMaxLength(255);

                entity.Property(e => e.ProductSpecification)
                    .HasMaxLength(4000);

                entity.Property(e => e.Features)
                    .HasMaxLength(2000);

                entity.Property(e => e.BoxContents)
                    .HasMaxLength(1000);

                entity.Property(e => e.ProductType)
                    .HasMaxLength(100);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.IsFeatured)
                    .HasDefaultValue(false);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValue("pending");

                entity.Property(e => e.ImageUrls)
                    .HasMaxLength(4000)
                    .HasDefaultValue("[]");

                entity.Property(e => e.IsDeleted)
                    .HasDefaultValue(false);

                entity.Property(e => e.CreatedOn)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.UpdatedBy)
                    .HasMaxLength(255);

                entity.Property(e => e.DeletedBy)
                    .HasMaxLength(255);

                // Product-Merchant relationship
                entity.HasOne(p => p.Merchant)
                    .WithMany()
                    .HasForeignKey(p => p.MerchantID)
                    .OnDelete(DeleteBehavior.Cascade);

                // Product-Category relationships
                entity.HasOne(p => p.Category)
                    .WithMany()
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.SubCategory)
                    .WithMany()
                    .HasForeignKey(p => p.SubCategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.SubSubCategory)
                    .WithMany()
                    .HasForeignKey(p => p.SubSubCategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Indexes for performance
                entity.HasIndex(e => e.MerchantID)
                    .HasDatabaseName("IX_Products_MerchantID");

                entity.HasIndex(e => e.CategoryId)
                    .HasDatabaseName("IX_Products_CategoryId");

                entity.HasIndex(e => e.SubCategoryId)
                    .HasDatabaseName("IX_Products_SubCategoryId");

                entity.HasIndex(e => e.SubSubCategoryId)
                    .HasDatabaseName("IX_Products_SubSubCategoryId");

                entity.HasIndex(e => e.IsActive)
                    .HasDatabaseName("IX_Products_IsActive");

                entity.HasIndex(e => e.IsFeatured)
                    .HasDatabaseName("IX_Products_IsFeatured");

                entity.HasIndex(e => e.IsDeleted)
                    .HasDatabaseName("IX_Products_IsDeleted");

                entity.HasIndex(e => e.SKU)
                    .HasDatabaseName("IX_Products_SKU");

                entity.HasIndex(e => e.Status)
                    .HasDatabaseName("IX_Products_Status");

                entity.HasIndex(e => new { e.SKU, e.MerchantID })
                    .IsUnique()
                    .HasDatabaseName("UQ_Products_SKU_MerchantID")
                    .HasFilter("SKU IS NOT NULL AND SKU != ''");

                entity.HasIndex(e => new { e.MerchantID, e.IsActive, e.IsDeleted })
                    .HasDatabaseName("IX_Products_MerchantID_IsActive_IsDeleted");

                entity.HasIndex(e => new { e.MerchantID, e.CategoryId, e.IsActive, e.IsDeleted })
                    .HasDatabaseName("IX_Products_MerchantID_CategoryId_IsActive_IsDeleted");

                entity.HasIndex(e => new { e.CategoryId, e.IsActive, e.IsDeleted })
                    .HasDatabaseName("IX_Products_CategoryId_IsActive_IsDeleted");

                entity.HasIndex(e => e.CreatedOn)
                    .HasDatabaseName("IX_Products_CreatedOn");

                entity.HasIndex(e => e.UpdatedOn)
                    .HasDatabaseName("IX_Products_UpdatedOn");
            });

            // Seed default roles
            builder.Entity<ApplicationRole>().HasData(
                new ApplicationRole
                {
                    Id = "1",
                    Name = "Admin",
                    NormalizedName = "ADMIN",
                    Description = "System Administrator"
                },
                new ApplicationRole
                {
                    Id = "2",
                    Name = "Merchant",
                    NormalizedName = "MERCHANT",
                    Description = "Platform Merchant"
                }
            );

            // Seed sample categories (optional - remove in production)
            builder.Entity<Category>().HasData(
                new Category
                {
                    Id = 1,
                    Name = "Electronics",
                    Description = "Electronic devices and accessories",
                    Slug = "electronics",
                    MerchantId = 1,
                    CreatedBy = "system",
                    CreatedOn = DateTime.UtcNow
                },
                new Category
                {
                    Id = 2,
                    Name = "Clothing",
                    Description = "Apparel and fashion items",
                    Slug = "clothing",
                    MerchantId = 1,
                    CreatedBy = "system",
                    CreatedOn = DateTime.UtcNow
                },
                new Category
                {
                    Id = 3,
                    Name = "Home & Garden",
                    Description = "Home improvement and garden supplies",
                    Slug = "home-garden",
                    MerchantId = 1,
                    CreatedBy = "system",
                    CreatedOn = DateTime.UtcNow
                }
            );
        }
    }
}