using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;
    }

    public class CommentResponseDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public Guid StoryId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CommentListResponseDto
    {
        public List<CommentResponseDto> Comments { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
