using MerchantService.Model;
using MerchantService.Model.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace MerchantService.Data
{
    public interface IApplicationDbContext
    {
        // Identity tables
        DbSet<ApplicationUser> Users { get; }
        DbSet<ApplicationRole> Roles { get; }
        
        // Application tables
        DbSet<Merchants> Merchants { get; }
        DbSet<RefreshToken> RefreshTokens { get; }
        DbSet<UserLoginAttempt> UserLoginAttempts { get; }
        
        // Categories tables
        DbSet<Category> Categories { get; }
        DbSet<SubCategory> SubCategories { get; }
        DbSet<SubSubCategory> SubSubCategories { get; }
        DbSet<Product> Products { get; }

        // Entity Framework methods
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        int SaveChanges();
        EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
        DbSet<TEntity> Set<TEntity>() where TEntity : class;
        
        // Database operations
        Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade Database { get; }
    }
}