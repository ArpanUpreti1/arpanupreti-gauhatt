using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmerConsumerAPI.Models.Entities
{
    public class Product
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal StockQuantity { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = "kg"; // kg, piece, dozen, liter, etc.
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty; // Vegetables, Fruits, Dairy, etc.
        
        public string? ImageUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public bool IsOrganic { get; set; } = false;
        
        public int DistanceKm { get; set; } = 0; // Distance from consumer (calculated)
        
        // Farmer relationship
        public Guid FarmerId { get; set; }
        
        [ForeignKey("FarmerId")]
        public virtual User Farmer { get; set; } = null!;
        
        // Navigation properties
        public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
        public virtual ICollection<ProductRating> Ratings { get; set; } = new List<ProductRating>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
