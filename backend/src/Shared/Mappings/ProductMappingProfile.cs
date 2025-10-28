using AutoMapper;
using MerchantService.Model;
using MerchantService.Model.DTOs;
using System.Text.Json;

namespace MerchantService.Mappings
{
    public class ProductMappingProfile : Profile
    {
        public ProductMappingProfile()
        {
            // Product to ProductResponseDto
            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.ImageUrls) ? new List<string>() : 
                    JsonSerializer.Deserialize<List<string>>(src.ImageUrls) ?? new List<string>()))
                .ForMember(dest => dest.Merchant, opt => opt.MapFrom(src => src.Merchant))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.SubCategory, opt => opt.MapFrom(src => src.SubCategory))
                .ForMember(dest => dest.SubSubCategory, opt => opt.MapFrom(src => src.SubSubCategory));

            // Product to ProductListDto
            CreateMap<Product, ProductListDto>()
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.ImageUrls) ? new List<string>() : 
                    JsonSerializer.Deserialize<List<string>>(src.ImageUrls) ?? new List<string>()));

            // Product to ProductSummaryDto
            CreateMap<Product, ProductSummaryDto>();

            // CreateProductDto to Product
            CreateMap<CreateProductDto, Product>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => JsonSerializer.Serialize(src.ImageUrls)))
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.SubSubCategory, opt => opt.Ignore());

            // UpdateProductDto to Product
            CreateMap<UpdateProductDto, Product>()
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => JsonSerializer.Serialize(src.ImageUrls)))
                .ForMember(dest => dest.UpdatedOn, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.SubSubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantID, opt => opt.Ignore());

            // Supporting entity mappings
            CreateMap<Merchants, MerchantDto>()
                .ForMember(dest => dest.MerchantId, opt => opt.MapFrom(src => src.MerchantId))
                .ForMember(dest => dest.MerchantName, opt => opt.MapFrom(src => src.MerchantName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.Id));

            CreateMap<SubCategory, SubCategoryDto>()
                .ForMember(dest => dest.SubCategoryId, opt => opt.MapFrom(src => src.Id));

            CreateMap<SubSubCategory, SubSubCategoryDto>()
                .ForMember(dest => dest.SubSubCategoryId, opt => opt.MapFrom(src => src.Id));
        }
    }
}