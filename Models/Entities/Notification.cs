using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmerConsumerAPI.Models.Entities
{
    public class Notification
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User? User { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string Message { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string Type { get; set; } = "info"; // info, success, warning, error, order
        
        public string? RelatedEntityId { get; set; } // OrderId, ProductId, etc.
        
        [StringLength(50)]
        public string? RelatedEntityType { get; set; } // Order, Product, etc.
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ReadAt { get; set; }
    }
}
