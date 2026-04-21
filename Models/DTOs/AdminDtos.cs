namespace FarmerConsumerAPI.Models.DTOs
{
    public class AdminDashboardStats
    {
        // User counts
        public int TotalUsers { get; set; }
        public int TotalFarmers { get; set; }
        public int TotalConsumers { get; set; }
        public int PendingFarmers { get; set; }
        
        // Product stats
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public int OrganicProducts { get; set; }
        
        // Order stats
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        
        // Revenue
        public decimal TotalRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        public decimal LastMonthRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        
        // Today's activity
        public int TodayOrders { get; set; }
        public int TodayNewUsers { get; set; }
        
        // Stories
        public int TotalStories { get; set; }
        
        // Ratings
        public int TotalRatings { get; set; }
        public double AverageRating { get; set; }
    }

    public class AdminOrderDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string ConsumerName { get; set; } = string.Empty;
        public string ConsumerEmail { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal DeliveryFee { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ItemCount { get; set; }
        public List<string> FarmerNames { get; set; } = new();
    }

    public class AdminUserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string Role { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class TopFarmerDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public int TotalProducts { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageRating { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    public class TopProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }
        public int Stock { get; set; }
        public bool IsOrganic { get; set; }
    }

    public class RevenueAnalytics
    {
        public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
        public List<CategoryRevenueDto> CategoryRevenue { get; set; } = new();
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class CategoryRevenueDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    // Note: UpdateOrderStatusDto is already defined in OrderDtos.cs

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    // Growth analytics
    public class DailyGrowthDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class GrowthAnalytics
    {
        public List<DailyGrowthDto> DailyUserRegistrations { get; set; } = new();
        public List<DailyGrowthDto> DailyOrderCounts { get; set; } = new();
    }

    // Platform health
    public class LowStockProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }

    public class PeakHourDto
    {
        public int Hour { get; set; }
        public int OrderCount { get; set; }
    }

    public class CategoryCountDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class PlatformHealthDto
    {
        public List<LowStockProductDto> LowStockProducts { get; set; } = new();
        public List<PeakHourDto> PeakHours { get; set; } = new();
        public decimal ThisWeekRevenue { get; set; }
        public decimal LastWeekRevenue { get; set; }
        public int ThisWeekOrders { get; set; }
        public int LastWeekOrders { get; set; }
        public List<CategoryCountDto> ProductsByCategory { get; set; } = new();
    }
}
