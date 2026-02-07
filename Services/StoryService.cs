using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Services
{
    public class StoryService : IStoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;
        private readonly ILogger<StoryService> _logger;

        public StoryService(
            ApplicationDbContext context,
            IFileService fileService,
            ILogger<StoryService> logger)
        {
            _context = context;
            _fileService = fileService;
            _logger = logger;
        }

        public async Task<ApiResponse<StoryResponseDto>> CreateStoryAsync(CreateStoryDto dto, Guid farmerId)
        {
            // Verify farmer exists and is approved
            var farmer = await _context.Users.FirstOrDefaultAsync(u => u.Id == farmerId && u.Role == UserRole.Farmer);
            if (farmer == null)
            {
                return ApiResponse<StoryResponseDto>.ErrorResponse("Farmer not found");
            }

            if (farmer.ApprovalStatus != ApprovalStatus.Approved)
            {
                return ApiResponse<StoryResponseDto>.ErrorResponse("Your farmer account must be approved before posting stories");
            }

            // Verify product exists if provided
            Product? linkedProduct = null;
            if (dto.ProductId.HasValue)
            {
                linkedProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.FarmerId == farmerId);
                if (linkedProduct == null)
                {
                    return ApiResponse<StoryResponseDto>.ErrorResponse("Product not found or doesn't belong to you");
                }
            }

            string? imageUrl = null;
            if (dto.Image != null)
            {
                imageUrl = await _fileService.SaveFileAsync(dto.Image, "stories", Guid.NewGuid().ToString());
            }

            var story = new Story
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Content = dto.Content,
                ImageUrl = imageUrl,
                VideoUrl = dto.VideoUrl,
                ProductId = dto.ProductId,
                FarmerId = farmerId,
                IsPublished = dto.IsPublished,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Stories.AddAsync(story);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Story created: {StoryTitle} by Farmer: {FarmerId}", story.Title, farmerId);

            return ApiResponse<StoryResponseDto>.SuccessResponse(MapToResponseDto(story, farmer, linkedProduct), "Story published successfully");
        }

        public async Task<ApiResponse<StoryResponseDto>> UpdateStoryAsync(Guid storyId, UpdateStoryDto dto, Guid farmerId)
        {
            var story = await _context.Stories
                .Include(s => s.Farmer)
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == storyId && s.FarmerId == farmerId);

            if (story == null)
            {
                return ApiResponse<StoryResponseDto>.ErrorResponse("Story not found or you don't have permission to edit it");
            }

            // Verify product exists if provided
            Product? linkedProduct = null;
            if (dto.ProductId.HasValue)
            {
                linkedProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.FarmerId == farmerId);
                if (linkedProduct == null)
                {
                    return ApiResponse<StoryResponseDto>.ErrorResponse("Product not found or doesn't belong to you");
                }
            }

            // Update image if provided
            if (dto.Image != null)
            {
                if (!string.IsNullOrEmpty(story.ImageUrl))
                {
                    _fileService.DeleteFile(story.ImageUrl);
                }
                story.ImageUrl = await _fileService.SaveFileAsync(dto.Image, "stories", Guid.NewGuid().ToString());
            }

            if (!string.IsNullOrEmpty(dto.Title)) story.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Content)) story.Content = dto.Content;
            if (dto.VideoUrl != null) story.VideoUrl = dto.VideoUrl;
            if (dto.ProductId.HasValue) story.ProductId = dto.ProductId;
            if (dto.IsPublished.HasValue) story.IsPublished = dto.IsPublished.Value;
            story.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Story updated: {StoryId}", storyId);

            return ApiResponse<StoryResponseDto>.SuccessResponse(MapToResponseDto(story, story.Farmer, linkedProduct), "Story updated successfully");
        }

        public async Task<ApiResponse<object>> DeleteStoryAsync(Guid storyId, Guid farmerId)
        {
            var story = await _context.Stories
                .FirstOrDefaultAsync(s => s.Id == storyId && s.FarmerId == farmerId);

            if (story == null)
            {
                return ApiResponse<object>.ErrorResponse("Story not found or you don't have permission to delete it");
            }

            if (!string.IsNullOrEmpty(story.ImageUrl))
            {
                _fileService.DeleteFile(story.ImageUrl);
            }

            _context.Stories.Remove(story);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Story deleted: {StoryId}", storyId);

            return ApiResponse<object>.SuccessResponse(null!, "Story deleted successfully");
        }

        public async Task<ApiResponse<StoryListResponseDto>> GetFarmerStoriesAsync(Guid farmerId, int page = 1, int pageSize = 10)
        {
            var query = _context.Stories
                .Include(s => s.Farmer)
                .Include(s => s.Product)
                .Include(s => s.Comments)
                .Where(s => s.FarmerId == farmerId)
                .OrderByDescending(s => s.CreatedAt);

            var totalCount = await query.CountAsync();
            var stories = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new StoryListResponseDto
            {
                Stories = stories.Select(s => MapToResponseDto(s, s.Farmer, s.Product, s.Comments?.Count ?? 0)).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<StoryListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<StoryListResponseDto>> GetStoriesAsync(StoryFilterDto filter)
        {
            var query = _context.Stories
                .Include(s => s.Farmer)
                .Include(s => s.Product)
                .Where(s => s.IsPublished && s.Farmer.ApprovalStatus == ApprovalStatus.Approved);

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(s => s.Title.ToLower().Contains(search) || 
                    s.Content.ToLower().Contains(search) ||
                    (s.Farmer.FarmName != null && s.Farmer.FarmName.ToLower().Contains(search)));
            }

            if (filter.FarmerId.HasValue)
            {
                query = query.Where(s => s.FarmerId == filter.FarmerId.Value);
            }

            if (filter.ProductId.HasValue)
            {
                query = query.Where(s => s.ProductId == filter.ProductId.Value);
            }

            // Apply sorting
            query = filter.SortBy.ToLower() switch
            {
                "popular" => query.OrderByDescending(s => s.ViewCount),
                "most_liked" => query.OrderByDescending(s => s.LikeCount),
                _ => query.OrderByDescending(s => s.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var stories = await query
                .Include(s => s.Comments)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var response = new StoryListResponseDto
            {
                Stories = stories.Select(s => MapToResponseDto(s, s.Farmer, s.Product, s.Comments?.Count ?? 0)).ToList(),
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };

            return ApiResponse<StoryListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<StoryResponseDto>> GetStoryByIdAsync(Guid storyId)
        {
            var story = await _context.Stories
                .Include(s => s.Farmer)
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == storyId);

            if (story == null)
            {
                return ApiResponse<StoryResponseDto>.ErrorResponse("Story not found");
            }

            var commentCount = await GetCommentCountAsync(storyId);
            return ApiResponse<StoryResponseDto>.SuccessResponse(MapToResponseDto(story, story.Farmer, story.Product, commentCount));
        }

        public async Task<ApiResponse<object>> IncrementViewCountAsync(Guid storyId)
        {
            var story = await _context.Stories.FindAsync(storyId);
            if (story != null)
            {
                story.ViewCount++;
                await _context.SaveChangesAsync();
            }
            return ApiResponse<object>.SuccessResponse(null!);
        }

        public async Task<ApiResponse<object>> LikeStoryAsync(Guid storyId)
        {
            var story = await _context.Stories.FindAsync(storyId);
            if (story == null)
            {
                return ApiResponse<object>.ErrorResponse("Story not found");
            }
            
            story.LikeCount++;
            await _context.SaveChangesAsync();
            
            return ApiResponse<object>.SuccessResponse(new { likeCount = story.LikeCount }, "Story liked!");
        }

        public async Task<ApiResponse<CommentListResponseDto>> GetCommentsAsync(Guid storyId, int page = 1, int pageSize = 20)
        {
            var storyExists = await _context.Stories.AnyAsync(s => s.Id == storyId);
            if (!storyExists)
            {
                return ApiResponse<CommentListResponseDto>.ErrorResponse("Story not found");
            }

            var query = _context.Comments
                .Include(c => c.User)
                .Where(c => c.StoryId == storyId)
                .OrderByDescending(c => c.CreatedAt);

            var totalCount = await query.CountAsync();
            var comments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new CommentListResponseDto
            {
                Comments = comments.Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    UserId = c.UserId,
                    UserName = c.User.Username,
                    UserRole = c.User.Role.ToString(),
                    StoryId = c.StoryId,
                    CreatedAt = c.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<CommentListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<CommentResponseDto>> AddCommentAsync(Guid storyId, CreateCommentDto dto, Guid userId)
        {
            var story = await _context.Stories.FindAsync(storyId);
            if (story == null)
            {
                return ApiResponse<CommentResponseDto>.ErrorResponse("Story not found");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<CommentResponseDto>.ErrorResponse("User not found");
            }

            var comment = new Comment
            {
                Id = Guid.NewGuid(),
                Content = dto.Content,
                UserId = userId,
                StoryId = storyId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Comment added to story {StoryId} by user {UserId}", storyId, userId);

            var response = new CommentResponseDto
            {
                Id = comment.Id,
                Content = comment.Content,
                UserId = comment.UserId,
                UserName = user.Username,
                UserRole = user.Role.ToString(),
                StoryId = comment.StoryId,
                CreatedAt = comment.CreatedAt
            };

            return ApiResponse<CommentResponseDto>.SuccessResponse(response, "Comment added successfully");
        }

        public async Task<ApiResponse<object>> DeleteCommentAsync(Guid commentId, Guid userId, bool isAdmin = false)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null)
            {
                return ApiResponse<object>.ErrorResponse("Comment not found");
            }

            // Only the comment owner or an admin can delete
            if (comment.UserId != userId && !isAdmin)
            {
                return ApiResponse<object>.ErrorResponse("You don't have permission to delete this comment");
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Comment {CommentId} deleted by user {UserId}", commentId, userId);

            return ApiResponse<object>.SuccessResponse(null!, "Comment deleted successfully");
        }

        private async Task<int> GetCommentCountAsync(Guid storyId)
        {
            return await _context.Comments.CountAsync(c => c.StoryId == storyId);
        }

        private StoryResponseDto MapToResponseDto(Story story, User farmer, Product? product, int commentCount = 0)
        {
            return new StoryResponseDto
            {
                Id = story.Id,
                Title = story.Title,
                Content = story.Content,
                ImageUrl = story.ImageUrl,
                VideoUrl = story.VideoUrl,
                IsPublished = story.IsPublished,
                ViewCount = story.ViewCount,
                LikeCount = story.LikeCount,
                CommentCount = commentCount,
                CreatedAt = story.CreatedAt,
                FarmerId = farmer.Id,
                FarmerName = farmer.Username,
                FarmName = farmer.FarmName,
                FarmerPhotoUrl = farmer.FarmPhotoUrl,
                District = farmer.District,
                ProductId = product?.Id,
                ProductName = product?.Name,
                ProductImageUrl = product?.ImageUrl,
                ProductPrice = product?.Price
            };
        }
    }
}
