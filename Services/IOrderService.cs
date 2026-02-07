using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;

namespace FarmerConsumerAPI.Services
{
    public interface IOrderService
    {
        Task<ApiResponse<OrderResponseDto>> CreateOrderAsync(Guid consumerId, CreateOrderDto dto);
        Task<ApiResponse<List<OrderResponseDto>>> GetConsumerOrdersAsync(Guid consumerId);
        Task<ApiResponse<List<FarmerOrderDto>>> GetFarmerOrdersAsync(Guid farmerId);
        Task<ApiResponse<OrderResponseDto>> GetOrderByIdAsync(Guid orderId, Guid userId);
        Task<ApiResponse<object>> UpdateOrderStatusAsync(Guid orderId, Guid userId, UpdateOrderStatusDto dto);
        Task<ApiResponse<object>> UpdateOrderItemStatusAsync(Guid orderItemId, Guid farmerId, UpdateOrderItemStatusDto dto);
    }
}
