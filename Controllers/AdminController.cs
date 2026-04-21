using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAuthService authService, ApplicationDbContext context, ILogger<AdminController> logger)
        {
            _authService = authService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard statistics for admin
        /// </summary>
        [HttpGet("dashboard/stats")]
        [ProducesResponseType(typeof(ApiResponse<AdminDashboardStats>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDashboardStats()
        {
            var today = DateTime.UtcNow.Date;
            var thisMonth = new DateTime(today.Year, today.Month, 1);
            var lastMonth = thisMonth.AddMonths(-1);

            var stats = new AdminDashboardStats
            {
                // User counts
                TotalUsers = await _context.Users.CountAsync(),
                TotalFarmers = await _context.Users.CountAsync(u => u.Role == UserRole.Farmer && u.ApprovalStatus == ApprovalStatus.Approved),
                TotalConsumers = await _context.Users.CountAsync(u => u.Role == UserRole.Consumer),
                PendingFarmers = await _context.Users.CountAsync(u => u.Role == UserRole.Farmer && u.ApprovalStatus == ApprovalStatus.Pending),
                
                // Product stats
                TotalProducts = await _context.Products.CountAsync(),
                ActiveProducts = await _context.Products.CountAsync(p => p.StockQuantity > 0),
                OutOfStockProducts = await _context.Products.CountAsync(p => p.StockQuantity == 0),
                OrganicProducts = await _context.Products.CountAsync(p => p.IsOrganic),
                
                // Order stats
                TotalOrders = await _context.Orders.CountAsync(),
                PendingOrders = await _context.Orders.CountAsync(o => o.Status == "Pending"),
                ProcessingOrders = await _context.Orders.CountAsync(o => o.Status == "Processing" || o.Status == "Confirmed"),
                CompletedOrders = await _context.Orders.CountAsync(o => o.Status == "Delivered"),
                CancelledOrders = await _context.Orders.CountAsync(o => o.Status == "Cancelled"),
                
                // Revenue
                TotalRevenue = await _context.Orders
                    .Where(o => o.Status == "Delivered")
                    .SumAsync(o => o.Total),
                ThisMonthRevenue = await _context.Orders
                    .Where(o => o.Status == "Delivered" && o.CreatedAt >= thisMonth)
                    .SumAsync(o => o.Total),
                LastMonthRevenue = await _context.Orders
                    .Where(o => o.Status == "Delivered" && o.CreatedAt >= lastMonth && o.CreatedAt < thisMonth)
                    .SumAsync(o => o.Total),
                TodayRevenue = await _context.Orders
                    .Where(o => o.Status == "Delivered" && o.CreatedAt >= today)
                    .SumAsync(o => o.Total),
                
                // Today activity
                TodayOrders = await _context.Orders.CountAsync(o => o.CreatedAt >= today),
                TodayNewUsers = await _context.Users.CountAsync(u => u.CreatedAt >= today),
                
                // Stories
                TotalStories = await _context.Stories.CountAsync(),
                
                // Ratings
                TotalRatings = await _context.ProductRatings.CountAsync(),
                AverageRating = await _context.ProductRatings.AnyAsync() 
                    ? await _context.ProductRatings.AverageAsync(r => r.Rating) 
                    : 0
            };

            return Ok(ApiResponse<AdminDashboardStats>.SuccessResponse(stats, "Dashboard stats retrieved successfully"));
        }

        /// <summary>
        /// Get recent orders for admin dashboard
        /// </summary>
        [HttpGet("orders/recent")]
        [ProducesResponseType(typeof(ApiResponse<List<AdminOrderDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 10)
        {
            var rawOrders = await _context.Orders
                .Include(o => o.Consumer)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Take(count)
                .ToListAsync();

            var orders = rawOrders.Select(o => new AdminOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                ConsumerName = o.Consumer != null ? o.Consumer.Username : "Unknown",
                ConsumerEmail = o.Consumer != null ? o.Consumer.Email : "",
                TotalAmount = o.Total,
                DeliveryFee = o.DeliveryFee,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                CreatedAt = o.CreatedAt,
                ItemCount = o.Items.Count,
                FarmerNames = o.Items.Select(i => i.FarmName ?? "Unknown").Distinct().ToList()
            }).ToList();

            return Ok(ApiResponse<List<AdminOrderDto>>.SuccessResponse(orders, "Recent orders retrieved"));
        }

        /// <summary>
        /// Get all orders with filtering
        /// </summary>
        [HttpGet("orders")]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<AdminOrderDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? status = null,
            [FromQuery] string? search = null)
        {
            var query = _context.Orders
                .Include(o => o.Consumer)
                .Include(o => o.Items)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(o => 
                    o.OrderNumber.Contains(search) || 
                    (o.Consumer != null && o.Consumer.Username.Contains(search)) ||
                    (o.Consumer != null && o.Consumer.Email.Contains(search)));
            }

            var totalCount = await query.CountAsync();
            var rawOrders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var orders = rawOrders.Select(o => new AdminOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                ConsumerName = o.Consumer != null ? o.Consumer.Username : "Unknown",
                ConsumerEmail = o.Consumer != null ? o.Consumer.Email : "",
                TotalAmount = o.Total,
                DeliveryFee = o.DeliveryFee,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                CreatedAt = o.CreatedAt,
                ItemCount = o.Items.Count,
                FarmerNames = o.Items.Select(i => i.FarmName ?? "Unknown").Distinct().ToList()
            }).ToList();

            var result = new PagedResult<AdminOrderDto>
            {
                Items = orders,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(ApiResponse<PagedResult<AdminOrderDto>>.SuccessResponse(result, "Orders retrieved"));
        }

        /// <summary>
        /// Get all users with filtering
        /// </summary>
        [HttpGet("users")]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<AdminUserDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? role = null,
            [FromQuery] string? search = null)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, true, out var userRole))
            {
                query = query.Where(u => u.Role == userRole);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => 
                    u.Username.Contains(search) || 
                    u.Email.Contains(search) ||
                    (u.FullName != null && u.FullName.Contains(search)));
            }

            var totalCount = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role.ToString(),
                    ApprovalStatus = u.ApprovalStatus.ToString(),
                    PhoneNumber = u.PhoneNumber,
                    Address = u.FarmAddress,
                    ProfilePictureUrl = u.FarmPhotoUrl,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            var result = new PagedResult<AdminUserDto>
            {
                Items = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(ApiResponse<PagedResult<AdminUserDto>>.SuccessResponse(result, "Users retrieved"));
        }

        /// <summary>
        /// Suspend a user account (prevents login)
        /// </summary>
        [HttpPut("users/{userId}/suspend")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SuspendUser(Guid userId)
        {
            var adminId = GetCurrentUserId();
            if (adminId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("Unable to identify admin user"));
            }

            if (adminId == userId)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("You cannot suspend your own account"));
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(ApiResponse<string>.ErrorResponse("User not found"));
            }

            if (user.Role == UserRole.Admin)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Admin accounts cannot be suspended from this action"));
            }

            if (!user.IsActive)
            {
                return Ok(ApiResponse<string>.SuccessResponse("User already suspended", "No changes made"));
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("User suspended: {UserId} by Admin: {AdminId}", userId, adminId);

            return Ok(ApiResponse<string>.SuccessResponse("User suspended successfully", $"{user.Username} has been suspended"));
        }

        /// <summary>
        /// Reactivate a suspended user account
        /// </summary>
        [HttpPut("users/{userId}/activate")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ActivateUser(Guid userId)
        {
            var adminId = GetCurrentUserId();
            if (adminId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("Unable to identify admin user"));
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(ApiResponse<string>.ErrorResponse("User not found"));
            }

            if (user.IsActive)
            {
                return Ok(ApiResponse<string>.SuccessResponse("User already active", "No changes made"));
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("User activated: {UserId} by Admin: {AdminId}", userId, adminId);

            return Ok(ApiResponse<string>.SuccessResponse("User activated successfully", $"{user.Username} has been reactivated"));
        }

        /// <summary>
        /// Get top performing farmers
        /// </summary>
        [HttpGet("farmers/top")]
        [ProducesResponseType(typeof(ApiResponse<List<TopFarmerDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTopFarmers([FromQuery] int count = 10)
        {
            // Get farmers with their product and order stats
            var farmers = await _context.Users
                .Where(u => u.Role == UserRole.Farmer && u.ApprovalStatus == ApprovalStatus.Approved)
                .ToListAsync();

            var topFarmersList = new List<TopFarmerDto>();

            foreach (var farmer in farmers)
            {
                var productIds = await _context.Products
                    .Where(p => p.FarmerId == farmer.Id)
                    .Select(p => p.Id)
                    .ToListAsync();

                var orderItems = await _context.OrderItems
                    .Where(oi => oi.FarmerId == farmer.Id)
                    .Include(oi => oi.Order)
                    .ToListAsync();

                var ratings = await _context.ProductRatings
                    .Where(r => productIds.Contains(r.ProductId))
                    .ToListAsync();

                topFarmersList.Add(new TopFarmerDto
                {
                    Id = farmer.Id,
                    Username = farmer.Username,
                    FullName = farmer.FullName,
                    Email = farmer.Email,
                    ProfilePictureUrl = farmer.FarmPhotoUrl,
                    TotalProducts = productIds.Count,
                    TotalOrders = orderItems.Select(oi => oi.OrderId).Distinct().Count(),
                    TotalRevenue = orderItems.Where(oi => oi.Order?.Status == "Delivered").Sum(oi => oi.Subtotal),
                    AverageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0,
                    JoinedAt = farmer.CreatedAt
                });
            }

            var result = topFarmersList.OrderByDescending(f => f.TotalRevenue).Take(count).ToList();
            return Ok(ApiResponse<List<TopFarmerDto>>.SuccessResponse(result, "Top farmers retrieved"));
        }

        /// <summary>
        /// Get top selling products
        /// </summary>
        [HttpGet("products/top")]
        [ProducesResponseType(typeof(ApiResponse<List<TopProductDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTopProducts([FromQuery] int count = 10)
        {
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Ratings)
                .ToListAsync();

            var topProductsList = new List<TopProductDto>();

            foreach (var product in products)
            {
                var orderItems = await _context.OrderItems
                    .Where(oi => oi.ProductId == product.Id)
                    .Include(oi => oi.Order)
                    .ToListAsync();

                topProductsList.Add(new TopProductDto
                {
                    Id = product.Id,
                    Name = product.Name,
                    Category = product.Category,
                    Price = product.Price,
                    Unit = product.Unit,
                    ImageUrl = product.ImageUrl,
                    FarmerName = product.Farmer?.Username ?? "Unknown",
                    TotalSold = orderItems.Sum(oi => oi.Quantity),
                    TotalRevenue = orderItems.Where(oi => oi.Order?.Status == "Delivered").Sum(oi => oi.Subtotal),
                    AverageRating = product.Ratings.Any() ? product.Ratings.Average(r => r.Rating) : 0,
                    RatingCount = product.Ratings.Count,
                    Stock = (int)product.StockQuantity,
                    IsOrganic = product.IsOrganic
                });
            }

            var result = topProductsList.OrderByDescending(p => p.TotalSold).Take(count).ToList();
            return Ok(ApiResponse<List<TopProductDto>>.SuccessResponse(result, "Top products retrieved"));
        }

        /// <summary>
        /// Get revenue analytics
        /// </summary>
        [HttpGet("analytics/revenue")]
        [ProducesResponseType(typeof(ApiResponse<RevenueAnalytics>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRevenueAnalytics([FromQuery] int days = 30)
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-days);
            
            var orders = await _context.Orders
                .Where(o => o.Status == "Delivered" && o.CreatedAt >= startDate)
                .ToListAsync();

            var dailyRevenue = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.Total),
                    OrderCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            var orderItems = await _context.OrderItems
                .Where(oi => oi.Order != null && oi.Order.Status == "Delivered" && oi.Order.CreatedAt >= startDate)
                .Include(oi => oi.Product)
                .ToListAsync();

            var categoryRevenue = orderItems
                .GroupBy(oi => oi.Product?.Category ?? "Unknown")
                .Select(g => new CategoryRevenueDto
                {
                    Category = g.Key,
                    Revenue = g.Sum(oi => oi.Subtotal),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(c => c.Revenue)
                .ToList();

            var analytics = new RevenueAnalytics
            {
                DailyRevenue = dailyRevenue,
                CategoryRevenue = categoryRevenue,
                TotalRevenue = dailyRevenue.Sum(d => d.Revenue),
                TotalOrders = dailyRevenue.Sum(d => d.OrderCount),
                AverageOrderValue = dailyRevenue.Any() && dailyRevenue.Sum(d => d.OrderCount) > 0
                    ? dailyRevenue.Sum(d => d.Revenue) / dailyRevenue.Sum(d => d.OrderCount) 
                    : 0
            };

            return Ok(ApiResponse<RevenueAnalytics>.SuccessResponse(analytics, "Revenue analytics retrieved"));
        }

        /// <summary>
        /// Update order status (admin can change any order status)
        /// </summary>
        [HttpPut("orders/{orderId}/status")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound(ApiResponse<string>.ErrorResponse("Order not found"));
            }

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.SuccessResponse("Order status updated", $"Order {order.OrderNumber} status changed to {dto.Status}"));
        }

        /// <summary>
        /// Get growth analytics (daily user registrations and order counts)
        /// </summary>
        [HttpGet("analytics/growth")]
        [ProducesResponseType(typeof(ApiResponse<GrowthAnalytics>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetGrowthAnalytics([FromQuery] int days = 30)
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-days);

            var dailyUsers = await _context.Users
                .Where(u => u.CreatedAt >= startDate)
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new DailyGrowthDto { Date = g.Key, Count = g.Count() })
                .OrderBy(d => d.Date)
                .ToListAsync();

            var dailyOrders = await _context.Orders
                .Where(o => o.CreatedAt >= startDate)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new DailyGrowthDto { Date = g.Key, Count = g.Count() })
                .OrderBy(d => d.Date)
                .ToListAsync();

            var result = new GrowthAnalytics
            {
                DailyUserRegistrations = dailyUsers,
                DailyOrderCounts = dailyOrders,
            };

            return Ok(ApiResponse<GrowthAnalytics>.SuccessResponse(result, "Growth analytics retrieved"));
        }

        /// <summary>
        /// Get platform health metrics (low stock, peak hours, weekly comparison, category distribution)
        /// </summary>
        [HttpGet("analytics/platform-health")]
        [ProducesResponseType(typeof(ApiResponse<PlatformHealthDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPlatformHealth()
        {
            var lowStockProducts = await _context.Products
                .Where(p => p.StockQuantity <= 5 && p.StockQuantity > 0)
                .Include(p => p.Farmer)
                .OrderBy(p => p.StockQuantity)
                .Take(10)
                .Select(p => new LowStockProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Stock = (int)p.StockQuantity,
                    FarmerName = p.Farmer != null ? p.Farmer.Username : "Unknown",
                    Category = p.Category,
                    ImageUrl = p.ImageUrl
                })
                .ToListAsync();

            var peakHours = await _context.Orders
                .GroupBy(o => o.CreatedAt.Hour)
                .Select(g => new PeakHourDto { Hour = g.Key, OrderCount = g.Count() })
                .OrderBy(p => p.Hour)
                .ToListAsync();

            var today = DateTime.UtcNow.Date;
            var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
            var lastWeekStart = thisWeekStart.AddDays(-7);

            var thisWeekRevenue = await _context.Orders
                .Where(o => o.Status == "Delivered" && o.CreatedAt >= thisWeekStart)
                .SumAsync(o => o.Total);
            var lastWeekRevenue = await _context.Orders
                .Where(o => o.Status == "Delivered" && o.CreatedAt >= lastWeekStart && o.CreatedAt < thisWeekStart)
                .SumAsync(o => o.Total);
            var thisWeekOrders = await _context.Orders
                .Where(o => o.CreatedAt >= thisWeekStart)
                .CountAsync();
            var lastWeekOrders = await _context.Orders
                .Where(o => o.CreatedAt >= lastWeekStart && o.CreatedAt < thisWeekStart)
                .CountAsync();

            var productsByCategory = await _context.Products
                .GroupBy(p => p.Category)
                .Select(g => new CategoryCountDto { Category = g.Key, Count = g.Count() })
                .OrderByDescending(c => c.Count)
                .ToListAsync();

            var result = new PlatformHealthDto
            {
                LowStockProducts = lowStockProducts,
                PeakHours = peakHours,
                ThisWeekRevenue = thisWeekRevenue,
                LastWeekRevenue = lastWeekRevenue,
                ThisWeekOrders = thisWeekOrders,
                LastWeekOrders = lastWeekOrders,
                ProductsByCategory = productsByCategory,
            };

            return Ok(ApiResponse<PlatformHealthDto>.SuccessResponse(result, "Platform health retrieved"));
        }

        /// <summary>
        /// Get all pending farmer registrations awaiting approval
        /// </summary>
        [HttpGet("farmers/pending")]
        [ProducesResponseType(typeof(ApiResponse<List<PendingFarmerDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPendingFarmers()
        {
            var result = await _authService.GetPendingFarmersAsync();
            return Ok(result);
        }

        /// <summary>
        /// Approve a farmer registration
        /// </summary>
        [HttpPost("farmers/{farmerId}/approve")]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ApproveFarmer(Guid farmerId)
        {
            var adminId = GetCurrentUserId();
            if (adminId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Unable to identify admin user"));
            }

            var result = await _authService.ApproveFarmerAsync(farmerId, adminId);

            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                {
                    return NotFound(result);
                }
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Reject a farmer registration
        /// </summary>
        [HttpPost("farmers/{farmerId}/reject")]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> RejectFarmer(Guid farmerId, [FromBody] RejectFarmerDto dto)
        {
            if (farmerId != dto.FarmerId)
            {
                return BadRequest(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Farmer ID mismatch"));
            }

            var adminId = GetCurrentUserId();
            if (adminId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Unable to identify admin user"));
            }

            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                return BadRequest(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Rejection reason is required"));
            }

            var result = await _authService.RejectFarmerAsync(farmerId, adminId, dto.Reason);

            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                {
                    return NotFound(result);
                }
                return BadRequest(result);
            }

            return Ok(result);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return Guid.Empty;
        }
    }
}
