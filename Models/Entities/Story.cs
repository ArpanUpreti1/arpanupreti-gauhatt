using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmerConsumerAPI.Models.Entities
{
    public class Story
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(5000)]
        public string Content { get; set; } = string.Empty;
        
        public string? ImageUrl { get; set; }
        
        public string? VideoUrl { get; set; }
        
        public bool IsPublished { get; set; } = true;
        
        public int ViewCount { get; set; } = 0;
        
        public int LikeCount { get; set; } = 0;
        
        // Farmer relationship
        public Guid FarmerId { get; set; }
        
        [ForeignKey("FarmerId")]
        public virtual User Farmer { get; set; } = null!;
        
        // Optional Product relationship (story can be linked to a product)
        public Guid? ProductId { get; set; }
        
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
        
        // Comments
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
