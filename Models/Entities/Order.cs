using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmerConsumerAPI.Models.Entities
{
    public class Order
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public string OrderNumber { get; set; } = string.Empty;
        
        [Required]
        public Guid ConsumerId { get; set; }
        
        [ForeignKey("ConsumerId")]
        public User? Consumer { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DeliveryFee { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
        
        public string PaymentMethod { get; set; } = "Cash on Delivery";
        
        public string PaymentStatus { get; set; } = "Pending";
        
        // Delivery Address
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? Landmark { get; set; }
        public string? Notes { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Delivery person assignment
        public Guid? DeliveryPersonId { get; set; }
        
        [ForeignKey("DeliveryPersonId")]
        public User? DeliveryPerson { get; set; }
        
        // Navigation
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        public ICollection<DeliveryAssignment> DeliveryAssignments { get; set; } = new List<DeliveryAssignment>();
    }
    
    public class OrderItem
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid OrderId { get; set; }
        
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }
        
        [Required]
        public Guid ProductId { get; set; }
        
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
        
        [Required]
        public Guid FarmerId { get; set; }
        
        [ForeignKey("FarmerId")]
        public User? Farmer { get; set; }
        
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public string? FarmName { get; set; }
        
        public int Quantity { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
        
        public string Unit { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DeliveryFee { get; set; }
        
        public double? DistanceKm { get; set; }
        
        public string ItemStatus { get; set; } = "Pending"; // Pending, Accepted, Rejected, Shipped, Delivered
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
