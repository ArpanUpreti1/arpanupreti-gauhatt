using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FarmerConsumerAPI.Models.DTOs
{
    // Story DTOs
    public class CreateStoryDto
    {
        [Required]
        [StringLength(200, MinimumLength = 3)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(5000, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;
        
        public Guid? ProductId { get; set; }
        
        public IFormFile? Image { get; set; }
        
        public string? VideoUrl { get; set; }
        
        public bool IsPublished { get; set; } = true;
    }

    public class UpdateStoryDto
    {
        [StringLength(200, MinimumLength = 3)]
        public string? Title { get; set; }
        
        [StringLength(5000, MinimumLength = 10)]
        public string? Content { get; set; }
        
        public Guid? ProductId { get; set; }
        
        public IFormFile? Image { get; set; }
        
        public string? VideoUrl { get; set; }
        
        public bool? IsPublished { get; set; }
    }

    public class StoryResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public bool IsPublished { get; set; }
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Farmer info
        public Guid FarmerId { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public string? FarmName { get; set; }
        public string? FarmerPhotoUrl { get; set; }
        public string? District { get; set; }
        
        // Linked Product info (if any)
        public Guid? ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductImageUrl { get; set; }
        public decimal? ProductPrice { get; set; }
    }

    public class StoryListResponseDto
    {
        public List<StoryResponseDto> Stories { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class StoryFilterDto
    {
        public string? Search { get; set; }
        public Guid? FarmerId { get; set; }
        public Guid? ProductId { get; set; }
        public string SortBy { get; set; } = "newest"; // newest, popular, most_liked
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
