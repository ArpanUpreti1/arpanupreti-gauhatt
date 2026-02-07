using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    // Create order request
    public class CreateOrderDto
    {
        [Required]
        public List<OrderItemDto> Items { get; set; } = new();
        
        [Required]
        public decimal Subtotal { get; set; }
        
        public decimal DeliveryFee { get; set; }
        
        [Required]
        public decimal Total { get; set; }
        
        [Required]
        public DeliveryAddressDto DeliveryAddress { get; set; } = new();
        
        public string PaymentMethod { get; set; } = "Cash on Delivery";
        
        public List<FarmerDeliveryDto>? DeliveryDetails { get; set; }
    }
    
    public class OrderItemDto
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;
        
        [Required]
        public string FarmerId { get; set; } = string.Empty;
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? ImageUrl { get; set; }
        public string? FarmName { get; set; }
        
        [Required]
        public int Quantity { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public string Unit { get; set; } = string.Empty;
        
        public double? DistanceKm { get; set; }
        public decimal? DeliveryFee { get; set; }
    }
    
    public class DeliveryAddressDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20, MinimumLength = 7)]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string City { get; set; } = string.Empty;
        
        public string? Landmark { get; set; }
        public string? Notes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
    
    public class FarmerDeliveryDto
    {
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public double DistanceKm { get; set; }
        public decimal DeliveryFee { get; set; }
        public bool CanDeliver { get; set; }
    }
    
    // Order response
    public class OrderResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string ConsumerId { get; set; } = string.Empty;
        public string ConsumerName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal Total { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DeliveryAddressDto DeliveryAddress { get; set; } = new();
        public List<OrderItemResponseDto> Items { get; set; } = new();
    }
    
    public class OrderItemResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public string FarmerId { get; set; } = string.Empty;
        public string? FarmName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal DeliveryFee { get; set; }
        public double? DistanceKm { get; set; }
        public string ItemStatus { get; set; } = string.Empty;
    }
    
    // Farmer order view
    public class FarmerOrderDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string ConsumerName { get; set; } = string.Empty;
        public string ConsumerPhone { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public DeliveryAddressDto DeliveryAddress { get; set; } = new();
        public List<FarmerOrderItemDto> Items { get; set; } = new();
        public decimal ItemsSubtotal { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal Total { get; set; }
        public double? DistanceKm { get; set; }
    }
    
    public class FarmerOrderItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public string ItemStatus { get; set; } = string.Empty;
    }
    
    // Update order status
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
    
    public class UpdateOrderItemStatusDto
    {
        [Required]
        public string ItemStatus { get; set; } = string.Empty;
    }
}
