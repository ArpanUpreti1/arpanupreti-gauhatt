using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    // ── Registration ──
    public class RegisterDeliveryPersonDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Bike, Motorcycle, Car, Van
        /// </summary>
        [Required]
        public string VehicleType { get; set; } = string.Empty;

        public string? VehicleNumber { get; set; }

        // Location — mandatory at sign-up
        [Required(ErrorMessage = "Latitude is required")]
        public double Latitude { get; set; }
        
        [Required(ErrorMessage = "Longitude is required")]
        public double Longitude { get; set; }
        
        public string? LocationAddress { get; set; }
    }

    // ── Delivery assignment response ──
    public class DeliveryAssignmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        // Pickup info (farmer)
        public double? PickupLatitude { get; set; }
        public double? PickupLongitude { get; set; }
        public string? PickupAddress { get; set; }
        public string? FarmerName { get; set; }
        public string? FarmerPhone { get; set; }

        // Drop-off info (consumer)
        public double? DropoffLatitude { get; set; }
        public double? DropoffLongitude { get; set; }
        public string? DropoffAddress { get; set; }
        public string? ConsumerName { get; set; }
        public string? ConsumerPhone { get; set; }

        // Distances
        public double? DistanceToPickupKm { get; set; }
        public double? DistanceToDeliveryKm { get; set; }
        public double? TotalDistanceKm { get; set; }

        // Order summary
        public decimal OrderTotal { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public List<DeliveryOrderItemDto> Items { get; set; } = new();

        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }

    public class DeliveryOrderItemDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
    }

    // ── Update assignment status ──
    public class UpdateDeliveryStatusDto
    {
        /// <summary>
        /// Accepted, PickedUp, InTransit, Delivered, Rejected
        /// </summary>
        [Required]
        public string Status { get; set; } = string.Empty;

        public string? RejectionReason { get; set; }
    }

    // ── Toggle availability ──
    public class UpdateAvailabilityDto
    {
        [Required]
        public bool IsAvailable { get; set; }
    }

    // ── Delivery person dashboard stats ──
    public class DeliveryDashboardStatsDto
    {
        public int TotalAssignments { get; set; }
        public int PendingAssignments { get; set; }
        public int ActiveDeliveries { get; set; }
        public int CompletedDeliveries { get; set; }
        public int RejectedAssignments { get; set; }
        public double TotalDistanceKm { get; set; }
        public double TotalEarnings { get; set; }
        public int TodayDeliveries { get; set; }
        public double TodayEarnings { get; set; }
        public bool IsAvailable { get; set; }
        public double? CurrentLatitude { get; set; }
        public double? CurrentLongitude { get; set; }
        public string? CurrentAddress { get; set; }
    }

    // ── Delivery person profile response ──
    public class DeliveryPersonProfileDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? VehicleType { get; set; }
        public string? VehicleNumber { get; set; }
        public bool IsAvailable { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
