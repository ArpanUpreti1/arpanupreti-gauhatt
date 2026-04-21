using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DeliveryPersonController : ControllerBase
    {
        private readonly IDeliveryPersonService _deliveryPersonService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DeliveryPersonController> _logger;

        public DeliveryPersonController(
            IDeliveryPersonService deliveryPersonService,
            ApplicationDbContext context,
            ILogger<DeliveryPersonController> logger)
        {
            _deliveryPersonService = deliveryPersonService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard statistics for the delivery person
        /// </summary>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryDashboardStatsDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.GetDashboardStatsAsync(userId.Value);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Get delivery person profile
        /// </summary>
        [HttpGet("profile")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryPersonProfileDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProfile()
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.GetProfileAsync(userId.Value);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Get all delivery assignments for the current delivery person
        /// </summary>
        [HttpGet("assignments")]
        [ProducesResponseType(typeof(ApiResponse<List<DeliveryAssignmentDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyAssignments([FromQuery] string? status = null)
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.GetMyAssignmentsAsync(userId.Value, status);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific delivery assignment
        /// </summary>
        [HttpGet("assignments/{assignmentId}")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryAssignmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAssignment(Guid assignmentId)
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.GetAssignmentByIdAsync(assignmentId, userId.Value);
            return result.Success ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Update assignment status (Accept, PickedUp, InTransit, Delivered, Rejected)
        /// </summary>
        [HttpPut("assignments/{assignmentId}/status")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryAssignmentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateAssignmentStatus(Guid assignmentId, [FromBody] UpdateDeliveryStatusDto dto)
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.UpdateAssignmentStatusAsync(assignmentId, userId.Value, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Toggle availability for receiving new delivery assignments
        /// </summary>
        [HttpPut("availability")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateAvailability([FromBody] UpdateAvailabilityDto dto)
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.UpdateAvailabilityAsync(userId.Value, dto.IsAvailable);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Update delivery person's current location
        /// </summary>
        [HttpPut("location")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationDto dto)
        {
            var userId = await GetAuthorizedDeliveryUserIdAsync();
            if (userId == null) return Forbid();

            var result = await _deliveryPersonService.UpdateDeliveryPersonLocationAsync(userId.Value, dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        private async Task<Guid?> GetAuthorizedDeliveryUserIdAsync()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var uid))
                return null;

            var isDeliveryPerson = await _context.Users
                .AnyAsync(u => u.Id == uid && u.Role == UserRole.DeliveryPerson);

            if (!isDeliveryPerson)
                return null;

            return uid;
        }
    }
}
