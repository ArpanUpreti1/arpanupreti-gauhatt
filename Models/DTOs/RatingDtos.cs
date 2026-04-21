using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    // Rating DTOs
    public class CreateRatingDto
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }
        
        [StringLength(500)]
        public string? Review { get; set; }
    }

    public class UpdateRatingDto
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }
        
        [StringLength(500)]
        public string? Review { get; set; }
    }

    public class RatingResponseDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Review { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RatingListResponseDto
    {
        public List<RatingResponseDto> Ratings { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ProductRatingSummaryDto
    {
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int[] RatingDistribution { get; set; } = new int[5]; // Index 0 = 1 star, Index 4 = 5 stars
    }
}
