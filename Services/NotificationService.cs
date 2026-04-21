using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(ApplicationDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ApiResponse<NotificationListResponseDto>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationDto
                {
                    Id = n.Id.ToString(),
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    RelatedEntityId = n.RelatedEntityId,
                    RelatedEntityType = n.RelatedEntityType,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                    ReadAt = n.ReadAt
                })
                .ToListAsync();

            var unreadCount = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();

            var response = new NotificationListResponseDto
            {
                Notifications = notifications,
                UnreadCount = unreadCount
            };

            return ApiResponse<NotificationListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<int>> GetUnreadCountAsync(Guid userId)
        {
            var count = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();

            return ApiResponse<int>.SuccessResponse(count);
        }

        public async Task<ApiResponse<object>> MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
            {
                return ApiResponse<object>.ErrorResponse("Notification not found");
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<object>.SuccessResponse(null!, "Notification marked as read");
        }

        public async Task<ApiResponse<object>> MarkAllAsReadAsync(Guid userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return ApiResponse<object>.SuccessResponse(null!, $"Marked {unreadNotifications.Count} notifications as read");
        }

        public async Task CreateNotificationAsync(Guid userId, string title, string message, string type = "info",
            string? relatedEntityId = null, string? relatedEntityType = null)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                RelatedEntityId = relatedEntityId,
                RelatedEntityType = relatedEntityType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Notification created for user {UserId}: {Title}", userId, title);
        }
    }
}
