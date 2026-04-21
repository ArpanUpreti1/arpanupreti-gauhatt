using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new order (Consumer only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Consumer")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _orderService.CreateOrderAsync(userId.Value, dto);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        /// <summary>
        /// Get consumer's orders
        /// </summary>
        [HttpGet("my-orders")]
        [Authorize(Roles = "Consumer")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _orderService.GetConsumerOrdersAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Get farmer's received orders
        /// </summary>
        [HttpGet("farmer-orders")]
        [Authorize(Roles = "Farmer")]
        public async Task<IActionResult> GetFarmerOrders()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _orderService.GetFarmerOrdersAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Get order by ID
        /// </summary>
        [HttpGet("{orderId}")]
        [Authorize(Roles = "Consumer,Farmer,DeliveryPerson")]
        public async Task<IActionResult> GetOrderById(Guid orderId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _orderService.GetOrderByIdAsync(orderId, userId.Value);
            
            if (!result.Success)
                return NotFound(result);
                
            return Ok(result);
        }

        /// <summary>
        /// Update order status (Consumer/Admin)
        /// </summary>
        [HttpPut("{orderId}/status")]
        [Authorize(Roles = "Consumer,Admin")]
        public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusDto dto)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _orderService.UpdateOrderStatusAsync(orderId, userId.Value, dto);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        /// <summary>
        /// Update order item status (Farmer only)
        /// </summary>
        [HttpPut("items/{itemId}/status")]
        [Authorize(Roles = "Farmer")]
        public async Task<IActionResult> UpdateOrderItemStatus(Guid itemId, [FromBody] UpdateOrderItemStatusDto dto)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var result = await _orderService.UpdateOrderItemStatusAsync(itemId, userId.Value, dto);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        private Guid? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return null;
            return userId;
        }
    }
}
