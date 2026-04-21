using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// Get all products with filters (public)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<ProductListResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProducts([FromQuery] ProductFilterDto filter)
        {
            var result = await _productService.GetProductsAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Get product by ID (public)
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProduct(Guid id)
        {
            var result = await _productService.GetProductByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get all categories (public)
        /// </summary>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(ApiResponse<List<string>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _productService.GetCategoriesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get farmer's own products
        /// </summary>
        [HttpGet("my-products")]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<ProductListResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<ProductListResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _productService.GetFarmerProductsAsync(farmerId, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Create a new product (Farmer only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductDto dto)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<ProductResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _productService.CreateProductAsync(dto, farmerId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Update a product (Farmer only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromForm] UpdateProductDto dto)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<ProductResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _productService.UpdateProductAsync(id, dto, farmerId);
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
        /// Delete a product (Farmer only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Farmer")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var farmerId = GetCurrentUserId();
            if (farmerId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unable to identify user"));
            }

            var result = await _productService.DeleteProductAsync(id, farmerId);
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

        // ============ RATING ENDPOINTS ============

        /// <summary>
        /// Add or update a rating for a product (Consumer only)
        /// </summary>
        [HttpPost("{productId}/ratings")]
        [Authorize(Roles = "Consumer")]
        [ProducesResponseType(typeof(ApiResponse<RatingResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<RatingResponseDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddOrUpdateRating(Guid productId, [FromBody] CreateRatingDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<RatingResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var result = await _productService.AddOrUpdateRatingAsync(productId, dto, userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get all ratings for a product (public)
        /// </summary>
        [HttpGet("{productId}/ratings")]
        [ProducesResponseType(typeof(ApiResponse<RatingListResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProductRatings(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _productService.GetProductRatingsAsync(productId, page, pageSize);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Get rating summary for a product (public)
        /// </summary>
        [HttpGet("{productId}/ratings/summary")]
        [ProducesResponseType(typeof(ApiResponse<ProductRatingSummaryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProductRatingSummary(Guid productId)
        {
            var result = await _productService.GetProductRatingSummaryAsync(productId);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Delete your rating for a product (Consumer only)
        /// </summary>
        [HttpDelete("{productId}/ratings")]
        [Authorize(Roles = "Consumer")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteRating(Guid productId)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Unable to identify user"));
            }

            var result = await _productService.DeleteRatingAsync(productId, userId);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}
