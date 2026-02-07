using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    /// <summary>
    /// Request DTO for calculating delivery fee
    /// </summary>
    public class CalculateDeliveryFeeDto
    {
        [Required]
        public double ConsumerLatitude { get; set; }
        
        [Required]
        public double ConsumerLongitude { get; set; }
        
        /// <summary>
        /// List of cart items with product IDs and quantities
        /// </summary>
        [Required]
        public List<CartItemDto> CartItems { get; set; } = new();
    }

    /// <summary>
    /// Cart item for delivery calculation
    /// </summary>
    public class CartItemDto
    {
        [Required]
        public Guid ProductId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    /// <summary>
    /// Response DTO with detailed delivery information
    /// </summary>
    public class DeliveryFeeResponseDto
    {
        /// <summary>
        /// Whether all items can be delivered
        /// </summary>
        public bool CanDeliver { get; set; }

        /// <summary>
        /// Total delivery fee in NPR (combined from all farmers)
        /// </summary>
        public decimal TotalDeliveryFee { get; set; }

        /// <summary>
        /// Detailed breakdown by farmer
        /// </summary>
        public List<FarmerDeliveryInfo> FarmerDeliveries { get; set; } = new();

        /// <summary>
        /// Products that cannot be delivered (beyond 100km)
        /// </summary>
        public List<UndeliverableProduct> UndeliverableProducts { get; set; } = new();

        /// <summary>
        /// Summary message
        /// </summary>
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Delivery info grouped by farmer
    /// </summary>
    public class FarmerDeliveryInfo
    {
        public Guid FarmerId { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public string? FarmName { get; set; }
        public int DistanceKm { get; set; }
        public decimal DeliveryFee { get; set; }
        public List<string> ProductNames { get; set; } = new();
    }

    /// <summary>
    /// Product that cannot be delivered
    /// </summary>
    public class UndeliverableProduct
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public int DistanceKm { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response for location update
    /// </summary>
    public class LocationUpdateResponseDto
    {
        public bool Success { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationAddress { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
