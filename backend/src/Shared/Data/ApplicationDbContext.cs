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
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Description)
                    .HasMaxLength(2000);

                entity.Property(e => e.Slug)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Price)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(e => e.CompareAtPrice)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Weight)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.StockQuantity)
                    .HasDefaultValue(0);

                entity.Property(e => e.TrackQuantity)
                    .HasDefaultValue(true);

                entity.Property(e => e.ContinueSellingWhenOutOfStock)
                    .HasDefaultValue(false);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.IsFeatured)
                    .HasDefaultValue(false);

                entity.Property(e => e.CreatedOn)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.UpdatedBy)
                    .HasMaxLength(255);

                entity.Property(e => e.SKU)
                    .HasMaxLength(50);

                entity.Property(e => e.Barcode)
                    .HasMaxLength(50);

                entity.Property(e => e.Brand)
                    .HasMaxLength(100);

                entity.Property(e => e.Model)
                    .HasMaxLength(100);

                entity.Property(e => e.Color)
                    .HasMaxLength(50);

                entity.Property(e => e.Size)
                    .HasMaxLength(50);

                entity.Property(e => e.Dimensions)
                    .HasMaxLength(100);

                entity.Property(e => e.Material)
                    .HasMaxLength(100);

                entity.Property(e => e.Tags)
                    .HasMaxLength(1000);

                entity.Property(e => e.KeyFeatures)
                    .HasMaxLength(2000);

                entity.Property(e => e.Specification)
                    .HasMaxLength(2000);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .HasDefaultValue("active");

                entity.Property(e => e.ImageUrl)
                    .HasMaxLength(500);

                entity.Property(e => e.MetaTitle)
                    .HasMaxLength(255);

                entity.Property(e => e.MetaDescription)
                    .HasMaxLength(500);

                // Product-Merchant relationship
                entity.HasOne(p => p.Merchant)
                    .WithMany()
                    .HasForeignKey(p => p.MerchantId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Product-Category relationships
                entity.HasOne(p => p.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.SubCategory)
                    .WithMany(sc => sc.Products)
                    .HasForeignKey(p => p.SubCategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(p => p.SubSubCategory)
                    .WithMany(ssc => ssc.Products)
                    .HasForeignKey(p => p.SubSubCategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                // Indexes for performance
                entity.HasIndex(e => e.MerchantId)
                    .HasDatabaseName("IX_Products_MerchantId");

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

                entity.HasIndex(e => e.SKU)
                    .HasDatabaseName("IX_Products_SKU");

                entity.HasIndex(e => new { e.Slug, e.MerchantId })
                    .IsUnique()
                    .HasDatabaseName("UQ_Products_Slug_MerchantId");

                entity.HasIndex(e => new { e.MerchantId, e.IsActive })
                    .HasDatabaseName("IX_Products_MerchantId_IsActive");

                entity.HasIndex(e => new { e.MerchantId, e.CategoryId, e.IsActive })
                    .HasDatabaseName("IX_Products_MerchantId_CategoryId_IsActive");
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