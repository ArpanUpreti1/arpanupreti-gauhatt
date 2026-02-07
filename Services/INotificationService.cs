using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Services
{
    public interface INotificationService
    {
        Task<ApiResponse<NotificationListResponseDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20);
        Task<ApiResponse<int>> GetUnreadCountAsync(Guid userId);
        Task<ApiResponse<object>> MarkAsReadAsync(Guid notificationId, Guid userId);
        Task<ApiResponse<object>> MarkAllAsReadAsync(Guid userId);
        Task CreateNotificationAsync(Guid userId, string title, string message, string type = "info", 
            string? relatedEntityId = null, string? relatedEntityType = null);
    }
}
