using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Get user's notifications
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _notificationService.GetUserNotificationsAsync(userId.Value, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _notificationService.GetUnreadCountAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid notificationId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _notificationService.MarkAsReadAsync(notificationId, userId.Value);
            
            if (!result.Success)
                return NotFound(result);
                
            return Ok(result);
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _notificationService.MarkAllAsReadAsync(userId.Value);
            return Ok(result);
        }

        private Guid? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return null;
            return userId;
        }
    }
}
