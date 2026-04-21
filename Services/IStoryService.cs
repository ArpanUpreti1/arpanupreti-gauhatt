using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Services
{
    public interface IStoryService
    {
        // Farmer operations
        Task<ApiResponse<StoryResponseDto>> CreateStoryAsync(CreateStoryDto dto, Guid farmerId);
        Task<ApiResponse<StoryResponseDto>> UpdateStoryAsync(Guid storyId, UpdateStoryDto dto, Guid farmerId);
        Task<ApiResponse<object>> DeleteStoryAsync(Guid storyId, Guid farmerId);
        Task<ApiResponse<StoryListResponseDto>> GetFarmerStoriesAsync(Guid farmerId, int page = 1, int pageSize = 10);
        
        // Consumer/Public operations
        Task<ApiResponse<StoryListResponseDto>> GetStoriesAsync(StoryFilterDto filter);
        Task<ApiResponse<StoryResponseDto>> GetStoryByIdAsync(Guid storyId);
        Task<ApiResponse<object>> IncrementViewCountAsync(Guid storyId);
        Task<ApiResponse<object>> LikeStoryAsync(Guid storyId);
        
        // Comment operations
        Task<ApiResponse<CommentListResponseDto>> GetCommentsAsync(Guid storyId, int page = 1, int pageSize = 20);
        Task<ApiResponse<CommentResponseDto>> AddCommentAsync(Guid storyId, CreateCommentDto dto, Guid userId);
        Task<ApiResponse<object>> DeleteCommentAsync(Guid commentId, Guid userId, bool isAdmin = false);
    }
}
