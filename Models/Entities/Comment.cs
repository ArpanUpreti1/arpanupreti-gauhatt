using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.Entities
{
    public class Comment
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string Content { get; set; } = string.Empty;
        
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        
        public Guid StoryId { get; set; }
        public Story Story { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
