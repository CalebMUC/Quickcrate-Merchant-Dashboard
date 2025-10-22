using AutoMapper;
using MerchantService.Model;
using MerchantService.Model.DTOs;

namespace MerchantService.Shared.Mappings
{
    public class CategoryMappingProfile : Profile
    {
        public CategoryMappingProfile()
        {
            // Category mappings
            CreateMap<Category, CategoryResponseDto>()
                .ForMember(dest => dest.SubCategories, opt => opt.MapFrom(src => src.SubCategories));

            CreateMap<CreateCategoryDto, Category>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Will be generated in service
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Parent, opt => opt.Ignore())
                .ForMember(dest => dest.Children, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategories, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            CreateMap<UpdateCategoryDto, Category>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Slug)))
                .ForMember(dest => dest.Name, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Name)))
                .ForMember(dest => dest.Description, opt => opt.Condition(src => src.Description != null))
                .ForMember(dest => dest.IsActive, opt => opt.Condition(src => src.IsActive.HasValue))
                .ForMember(dest => dest.SortOrder, opt => opt.Condition(src => src.SortOrder.HasValue))
                .ForMember(dest => dest.ParentId, opt => opt.Condition(src => src.ParentId.HasValue))
                .ForMember(dest => dest.ImageUrl, opt => opt.Condition(src => src.ImageUrl != null))
                .ForMember(dest => dest.MetaTitle, opt => opt.Condition(src => src.MetaTitle != null))
                .ForMember(dest => dest.MetaDescription, opt => opt.Condition(src => src.MetaDescription != null))
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Parent, opt => opt.Ignore())
                .ForMember(dest => dest.Children, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategories, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            // SubCategory mappings
            CreateMap<SubCategory, SubCategoryResponseDto>()
                .ForMember(dest => dest.SubSubCategories, opt => opt.MapFrom(src => src.SubSubCategories));

            CreateMap<CreateSubCategoryDto, SubCategory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Will be generated in service
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.SubSubCategories, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            CreateMap<UpdateSubCategoryDto, SubCategory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Slug)))
                .ForMember(dest => dest.Name, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Name)))
                .ForMember(dest => dest.Description, opt => opt.Condition(src => src.Description != null))
                .ForMember(dest => dest.IsActive, opt => opt.Condition(src => src.IsActive.HasValue))
                .ForMember(dest => dest.SortOrder, opt => opt.Condition(src => src.SortOrder.HasValue))
                .ForMember(dest => dest.CategoryId, opt => opt.Condition(src => src.CategoryId.HasValue))
                .ForMember(dest => dest.ImageUrl, opt => opt.Condition(src => src.ImageUrl != null))
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.SubSubCategories, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            // SubSubCategory mappings
            CreateMap<SubSubCategory, SubSubCategoryResponseDto>();

            CreateMap<CreateSubSubCategoryDto, SubSubCategory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Will be generated in service
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            CreateMap<UpdateSubSubCategoryDto, SubSubCategory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Slug)))
                .ForMember(dest => dest.Name, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Name)))
                .ForMember(dest => dest.Description, opt => opt.Condition(src => src.Description != null))
                .ForMember(dest => dest.IsActive, opt => opt.Condition(src => src.IsActive.HasValue))
                .ForMember(dest => dest.SortOrder, opt => opt.Condition(src => src.SortOrder.HasValue))
                .ForMember(dest => dest.SubCategoryId, opt => opt.Condition(src => src.SubCategoryId.HasValue))
                .ForMember(dest => dest.ImageUrl, opt => opt.Condition(src => src.ImageUrl != null))
                .ForMember(dest => dest.ProductCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore());

            // Product mappings
            CreateMap<Product, ProductResponseDto>();

            CreateMap<CreateProductDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Will be generated in service
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.SubSubCategory, opt => opt.Ignore());

            CreateMap<UpdateProductDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Slug, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Slug)))
                .ForMember(dest => dest.Name, opt => opt.Condition(src => !string.IsNullOrEmpty(src.Name)))
                .ForMember(dest => dest.Description, opt => opt.Condition(src => src.Description != null))
                .ForMember(dest => dest.Price, opt => opt.Condition(src => src.Price.HasValue))
                .ForMember(dest => dest.CompareAtPrice, opt => opt.Condition(src => src.CompareAtPrice.HasValue))
                .ForMember(dest => dest.StockQuantity, opt => opt.Condition(src => src.StockQuantity.HasValue))
                .ForMember(dest => dest.SKU, opt => opt.Condition(src => src.SKU != null))
                .ForMember(dest => dest.Barcode, opt => opt.Condition(src => src.Barcode != null))
                .ForMember(dest => dest.TrackQuantity, opt => opt.Condition(src => src.TrackQuantity.HasValue))
                .ForMember(dest => dest.ContinueSellingWhenOutOfStock, opt => opt.Condition(src => src.ContinueSellingWhenOutOfStock.HasValue))
                .ForMember(dest => dest.IsActive, opt => opt.Condition(src => src.IsActive.HasValue))
                .ForMember(dest => dest.IsFeatured, opt => opt.Condition(src => src.IsFeatured.HasValue))
                .ForMember(dest => dest.CategoryId, opt => opt.Condition(src => src.CategoryId.HasValue))
                .ForMember(dest => dest.SubCategoryId, opt => opt.Condition(src => src.SubCategoryId.HasValue))
                .ForMember(dest => dest.SubSubCategoryId, opt => opt.Condition(src => src.SubSubCategoryId.HasValue))
                .ForMember(dest => dest.ImageUrl, opt => opt.Condition(src => src.ImageUrl != null))
                .ForMember(dest => dest.MetaTitle, opt => opt.Condition(src => src.MetaTitle != null))
                .ForMember(dest => dest.MetaDescription, opt => opt.Condition(src => src.MetaDescription != null))
                .ForMember(dest => dest.Brand, opt => opt.Condition(src => src.Brand != null))
                .ForMember(dest => dest.Model, opt => opt.Condition(src => src.Model != null))
                .ForMember(dest => dest.Color, opt => opt.Condition(src => src.Color != null))
                .ForMember(dest => dest.Size, opt => opt.Condition(src => src.Size != null))
                .ForMember(dest => dest.Weight, opt => opt.Condition(src => src.Weight.HasValue))
                .ForMember(dest => dest.Dimensions, opt => opt.Condition(src => src.Dimensions != null))
                .ForMember(dest => dest.Material, opt => opt.Condition(src => src.Material != null))
                .ForMember(dest => dest.Tags, opt => opt.Condition(src => src.Tags != null))
                .ForMember(dest => dest.KeyFeatures, opt => opt.Condition(src => src.KeyFeatures != null))
                .ForMember(dest => dest.Specification, opt => opt.Condition(src => src.Specification != null))
                .ForMember(dest => dest.Status, opt => opt.Condition(src => src.Status != null))
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MerchantId, opt => opt.Ignore())
                .ForMember(dest => dest.Merchant, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.SubCategory, opt => opt.Ignore())
                .ForMember(dest => dest.SubSubCategory, opt => opt.Ignore());

            // Reverse mappings for frontend compatibility
            CreateMap<CategoryResponseDto, Category>();
            CreateMap<SubCategoryResponseDto, SubCategory>();
            CreateMap<SubSubCategoryResponseDto, SubSubCategory>();
            CreateMap<ProductResponseDto, Product>();
        }
    }
}