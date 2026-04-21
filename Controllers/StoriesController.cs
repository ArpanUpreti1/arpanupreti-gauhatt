using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoriesController : ControllerBase
    {
        private readonly IStoryService _storyService;
        private readonly ILogger<StoriesController> _logger;

        public StoriesController(IStoryService storyService, ILogger<StoriesController> logger)
        {
            _storyService = storyService;
            _logger = logger;
        }

        /// <summary>
        /// Get all stories with filters (public)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<StoryListResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStories([FromQuery] StoryFilterDto filter)
        {
            var result = await _storyService.GetStoriesAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Get story by ID (public)
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetStory(Guid id)
        {
            // Increment view count
            await _storyService.IncrementViewCountAsync(id);
            
            var result = await _storyService.GetStoryByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get farmer's own stories
        /// </summary>
        [HttpGet("my-stories")]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<StoryListResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyStories([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<StoryListResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _storyService.GetFarmerStoriesAsync(farmerId, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Create a new story (Farmer only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateStory([FromForm] CreateStoryDto dto)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<StoryResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _storyService.CreateStoryAsync(dto, farmerId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Update a story (Farmer only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<StoryResponseDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStory(Guid id, [FromForm] UpdateStoryDto dto)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<StoryResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _storyService.UpdateStoryAsync(id, dto, farmerId);
            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                {
                    return NotFound(result);
                }
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Delete a story (Farmer only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteStory(Guid id)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unable to identify user"));
            }

            var result = await _storyService.DeleteStoryAsync(id, farmerId);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Like a story (public)
        /// </summary>
        [HttpPost("{id}/like")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> LikeStory(Guid id)
        {
            var result = await _storyService.LikeStoryAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get comments for a story (public)
        /// </summary>
        [HttpGet("{id}/comments")]
        [ProducesResponseType(typeof(ApiResponse<CommentListResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetComments(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _storyService.GetCommentsAsync(id, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Add a comment to a story (authenticated users only)
        /// </summary>
        [HttpPost("{id}/comments")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<CommentResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<CommentResponseDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateCommentDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<CommentResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _storyService.AddCommentAsync(id, dto, userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Delete a comment (comment owner or Admin only)
        /// </summary>
        [HttpDelete("comments/{commentId}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unable to identify user"));
            }

            var isAdmin = User.IsInRole("Admin");
            var result = await _storyService.DeleteCommentAsync(commentId, userId, isAdmin);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return Guid.Empty;
        }
    }
}
