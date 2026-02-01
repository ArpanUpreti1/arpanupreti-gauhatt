using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IAuthService authService, ILogger<AdminController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Get all pending farmer registrations awaiting approval
        /// </summary>
        [HttpGet("farmers/pending")]
        [ProducesResponseType(typeof(ApiResponse<List<PendingFarmerDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPendingFarmers()
        {
            var result = await _authService.GetPendingFarmersAsync();
            return Ok(result);
        }

        /// <summary>
        /// Approve a farmer registration
        /// </summary>
        [HttpPost("farmers/{farmerId}/approve")]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ApproveFarmer(Guid farmerId)
        {
            var adminId = GetCurrentUserId();
            if (adminId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Unable to identify admin user"));
            }

            var result = await _authService.ApproveFarmerAsync(farmerId, adminId);

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
        /// Reject a farmer registration
        /// </summary>
        [HttpPost("farmers/{farmerId}/reject")]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<FarmerApprovalResultDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RejectFarmer(Guid farmerId, [FromBody] RejectFarmerDto dto)
        {
            if (farmerId != dto.FarmerId)
            {
                return BadRequest(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Farmer ID mismatch"));
            }

            var adminId = GetCurrentUserId();
            if (adminId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Unable to identify admin user"));
            }

            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                return BadRequest(ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Rejection reason is required"));
            }

            var result = await _authService.RejectFarmerAsync(farmerId, adminId, dto.Reason);

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
