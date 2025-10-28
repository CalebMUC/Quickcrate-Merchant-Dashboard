using AutoMapper;
using MerchantService.Data;
using MerchantService.Mappings;
using MerchantService.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MerchantService.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Add DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // Register DbContext Interface
            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

            // Add AutoMapper with all profiles
            services.AddAutoMapper(typeof(CategoryMappingProfile), typeof(ProductMappingProfile));

            // Add HttpContextAccessor for CurrentUserService
            services.AddHttpContextAccessor();

            // Add Application Services
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IProductService, ProductService>();

            return services;
        }

        public static IServiceCollection AddAutoMapperProfiles(this IServiceCollection services)
        {
            var mapperConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new CategoryMappingProfile());
                mc.AddProfile(new ProductMappingProfile());
                // Add other profiles here as needed
            });

            IMapper mapper = mapperConfig.CreateMapper();
            services.AddSingleton(mapper);

            return services;
        }

        public static IServiceCollection AddCategoriesServices(this IServiceCollection services)
        {
            // Add categories-specific services here when implemented
            // services.AddScoped<ICategoryService, CategoryService>();
            // services.AddScoped<ICategoryRepository, CategoryRepository>();

            return services;
        }

        public static IServiceCollection AddProductServices(this IServiceCollection services)
        {
            // Product service is already added in AddApplicationServices
            // Add additional product-related services here if needed
            return services;
        }
    }
}