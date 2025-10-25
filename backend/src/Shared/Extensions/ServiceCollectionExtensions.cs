using AutoMapper;
using MerchantService.Data;
using MerchantService.Shared.Mappings;
using MerchantService.Shared.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MerchantService.Shared.Extensions
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

            // Add AutoMapper
            services.AddAutoMapper(typeof(CategoryMappingProfile));

            // Add HttpContextAccessor for CurrentUserService
            services.AddHttpContextAccessor();

            // Add Application Services
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            return services;
        }

        public static IServiceCollection AddAutoMapperProfiles(this IServiceCollection services)
        {
            var mapperConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new CategoryMappingProfile());
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
    }
}