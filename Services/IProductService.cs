using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Services
{
    public interface IProductService
    {
        // Farmer operations
        Task<ApiResponse<ProductResponseDto>> CreateProductAsync(CreateProductDto dto, Guid farmerId);
        Task<ApiResponse<ProductResponseDto>> UpdateProductAsync(Guid productId, UpdateProductDto dto, Guid farmerId);
        Task<ApiResponse<object>> DeleteProductAsync(Guid productId, Guid farmerId);
        Task<ApiResponse<ProductListResponseDto>> GetFarmerProductsAsync(Guid farmerId, int page = 1, int pageSize = 10);
        
        // Consumer/Public operations
        Task<ApiResponse<ProductListResponseDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ApiResponse<ProductResponseDto>> GetProductByIdAsync(Guid productId);
        Task<ApiResponse<List<string>>> GetCategoriesAsync();
        
        // Delivery check operations
        Task<ApiResponse<DeliveryCheckResponseDto>> CheckDeliveryAsync(DeliveryCheckDto dto);
        
        // Rating operations
        Task<ApiResponse<RatingResponseDto>> AddOrUpdateRatingAsync(Guid productId, CreateRatingDto dto, Guid userId);
        Task<ApiResponse<RatingListResponseDto>> GetProductRatingsAsync(Guid productId, int page = 1, int pageSize = 10);
        Task<ApiResponse<ProductRatingSummaryDto>> GetProductRatingSummaryAsync(Guid productId);
        Task<ApiResponse<object>> DeleteRatingAsync(Guid productId, Guid userId);
    }
}
