using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FarmerConsumerAPI.Models.DTOs
{
    // Product DTOs
    public class CreateProductDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Stock quantity must be 0 or greater")]
        public decimal StockQuantity { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = "kg";
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        public bool IsOrganic { get; set; } = false;
        
        public IFormFile? Image { get; set; }
    }

    public class UpdateProductDto
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Stock quantity must be 0 or greater")]
        public decimal StockQuantity { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = "kg";
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        public bool IsOrganic { get; set; } = false;
        
        public bool IsActive { get; set; } = true;
        
        public IFormFile? Image { get; set; }
    }

    public class ProductResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal StockQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public bool IsOrganic { get; set; }
        public int DistanceKm { get; set; }
        
        /// <summary>
        /// Estimated delivery fee in NPR based on distance
        /// </summary>
        public decimal? DeliveryFee { get; set; }
        
        /// <summary>
        /// Whether delivery is possible (within 40km)
        /// </summary>
        public bool CanDeliver { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        
        // Farmer info
        public Guid FarmerId { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public string? FarmName { get; set; }
        public string? FarmerPhotoUrl { get; set; }
        public string? District { get; set; }
        
        /// <summary>
        /// Farmer's latitude (for map display)
        /// </summary>
        public double? FarmerLatitude { get; set; }
        
        /// <summary>
        /// Farmer's longitude (for map display)
        /// </summary>
        public double? FarmerLongitude { get; set; }
        
        /// <summary>
        /// Average rating (1-5 scale)
        /// </summary>
        public double AverageRating { get; set; }
        
        /// <summary>
        /// Total number of ratings
        /// </summary>
        public int TotalRatings { get; set; }
        
        /// <summary>
        /// Current user's rating for this product (null if not rated)
        /// </summary>
        public int? UserRating { get; set; }
    }

    public class ProductListResponseDto
    {
        public List<ProductResponseDto> Products { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ProductFilterDto
    {
        public string? Search { get; set; }
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        
        /// <summary>
        /// Maximum distance filter in km (default: 40km - max delivery range)
        /// </summary>
        public int? MaxDistance { get; set; } = 40;
        
        public bool? IsOrganic { get; set; }
        public string SortBy { get; set; } = "newest"; // newest, price_low, price_high, name, distance
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        
        // Consumer location for distance calculation
        public double? ConsumerLatitude { get; set; }
        public double? ConsumerLongitude { get; set; }
        
        /// <summary>
        /// If true, only show products from farms within delivery range (40km)
        /// </summary>
        public bool EnforceDeliveryLimit { get; set; } = true;
    }
    
    // DTO for updating user location
    public class UpdateLocationDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? LocationAddress { get; set; }
    }
    
    // DTO for checking delivery availability
    public class DeliveryCheckDto
    {
        public double ConsumerLatitude { get; set; }
        public double ConsumerLongitude { get; set; }
        public List<Guid> ProductIds { get; set; } = new();
    }
    
    public class DeliveryCheckResponseDto
    {
        public bool CanDeliver { get; set; }
        public List<ProductDeliveryInfo> Products { get; set; } = new();
        public string? Message { get; set; }
    }
    
    public class ProductDeliveryInfo
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int DistanceKm { get; set; }
        public bool CanDeliver { get; set; }
    }
}
