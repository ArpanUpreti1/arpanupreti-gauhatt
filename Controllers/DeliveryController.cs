using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Enums;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDeliveryService _deliveryService;
        private readonly ILocationService _locationService;
        private readonly ILogger<DeliveryController> _logger;

        public DeliveryController(
            ApplicationDbContext context,
            IDeliveryService deliveryService,
            ILocationService locationService,
            ILogger<DeliveryController> logger)
        {
            _context = context;
            _deliveryService = deliveryService;
            _locationService = locationService;
            _logger = logger;
        }

        /// <summary>
        /// Calculate delivery fee for cart items based on consumer location
        /// </summary>
        [HttpPost("calculate")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryFeeResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CalculateDeliveryFee([FromBody] CalculateDeliveryFeeDto dto)
        {
            if (dto.CartItems == null || !dto.CartItems.Any())
            {
                return BadRequest(ApiResponse<DeliveryFeeResponseDto>.ErrorResponse("Cart is empty"));
            }

            var productIds = dto.CartItems.Select(ci => ci.ProductId).ToList();
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            if (!products.Any())
            {
                return NotFound(ApiResponse<DeliveryFeeResponseDto>.ErrorResponse("No products found"));
            }

            var farmerDeliveries = new List<FarmerDeliveryInfo>();
            var undeliverableProducts = new List<UndeliverableProduct>();
            decimal totalDeliveryFee = 0;
            bool canDeliverAll = true;

            // Group products by farmer to calculate single delivery fee per farmer
            var productsByFarmer = products.GroupBy(p => p.FarmerId);

            foreach (var farmerGroup in productsByFarmer)
            {
                var farmer = farmerGroup.First().Farmer;
                var farmerProducts = farmerGroup.ToList();

                if (!farmer.Latitude.HasValue || !farmer.Longitude.HasValue)
                {
                    _logger.LogWarning("Farmer {FarmerId} has no location set", farmer.Id);
                    
                    // If farmer has no location, we can't calculate distance - assume they can deliver
                    farmerDeliveries.Add(new FarmerDeliveryInfo
                    {
                        FarmerId = farmer.Id,
                        FarmerName = farmer.Username,
                        FarmName = farmer.FarmName,
                        DistanceKm = 0,
                        DeliveryFee = _deliveryService.BaseRatePer10Km, // Minimum fee
                        ProductNames = farmerProducts.Select(p => p.Name).ToList()
                    });
                    totalDeliveryFee += _deliveryService.BaseRatePer10Km;
                    continue;
                }

                // Calculate distance from consumer to farmer
                var distanceKm = _locationService.CalculateDistanceKm(
                    dto.ConsumerLatitude,
                    dto.ConsumerLongitude,
                    farmer.Latitude.Value,
                    farmer.Longitude.Value
                );

                var roundedDistance = (int)Math.Ceiling(distanceKm);

                if (!_deliveryService.IsDeliveryPossible(distanceKm))
                {
                    canDeliverAll = false;
                    foreach (var product in farmerProducts)
                    {
                        undeliverableProducts.Add(new UndeliverableProduct
                        {
                            ProductId = product.Id,
                            ProductName = product.Name,
                            FarmerName = farmer.FarmName ?? farmer.Username,
                            DistanceKm = roundedDistance,
                            Reason = $"Farm is {roundedDistance} km away, which exceeds the maximum delivery distance of {_deliveryService.MaxDeliveryDistanceKm} km"
                        });
                    }
                    continue;
                }

                var deliveryFee = _deliveryService.CalculateDeliveryFee(distanceKm);

                farmerDeliveries.Add(new FarmerDeliveryInfo
                {
                    FarmerId = farmer.Id,
                    FarmerName = farmer.Username,
                    FarmName = farmer.FarmName,
                    DistanceKm = roundedDistance,
                    DeliveryFee = deliveryFee,
                    ProductNames = farmerProducts.Select(p => p.Name).ToList()
                });

                totalDeliveryFee += deliveryFee;
            }

            var response = new DeliveryFeeResponseDto
            {
                CanDeliver = canDeliverAll,
                TotalDeliveryFee = totalDeliveryFee,
                FarmerDeliveries = farmerDeliveries,
                UndeliverableProducts = undeliverableProducts,
                Message = canDeliverAll 
                    ? $"Delivery available. Total fee: NPR {totalDeliveryFee}"
                    : $"Some products cannot be delivered as they are beyond {_deliveryService.MaxDeliveryDistanceKm} km"
            };

            return Ok(ApiResponse<DeliveryFeeResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Get delivery pricing information
        /// </summary>
        [HttpGet("pricing-info")]
        [ProducesResponseType(typeof(ApiResponse<DeliveryPricingInfo>), StatusCodes.Status200OK)]
        public IActionResult GetPricingInfo()
        {
            var info = new DeliveryPricingInfo
            {
                MaxDistanceKm = _deliveryService.MaxDeliveryDistanceKm,
                BaseRatePer10Km = _deliveryService.BaseRatePer10Km,
                Currency = "NPR",
                PricingRules = new List<string>
                {
                    "Delivery fee is calculated based on distance from farm to your location",
                    $"Base rate: NPR {_deliveryService.BaseRatePer10Km} per 10 km",
                    "Distance is rounded up to the nearest 10 km",
                    $"Maximum delivery distance: {_deliveryService.MaxDeliveryDistanceKm} km",
                    "If ordering from multiple farms, delivery fee applies per farm"
                },
                Examples = new List<DeliveryPriceExample>
                {
                    new() { DistanceRange = "1-10 km", Fee = 50 },
                    new() { DistanceRange = "11-20 km", Fee = 100 },
                    new() { DistanceRange = "21-30 km", Fee = 150 },
                    new() { DistanceRange = "31-40 km", Fee = 200 }
                }
            };

            return Ok(ApiResponse<DeliveryPricingInfo>.SuccessResponse(info));
        }

        /// <summary>
        /// Update current user's delivery location
        /// </summary>
        [HttpPut("location")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<LocationUpdateResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<LocationUpdateResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(ApiResponse<LocationUpdateResponseDto>.ErrorResponse("User not found"));
            }

            user.Latitude = dto.Latitude;
            user.Longitude = dto.Longitude;
            user.LocationAddress = dto.LocationAddress;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Location updated for user {UserId}: ({Lat}, {Lng})",
                userId, dto.Latitude, dto.Longitude);

            var response = new LocationUpdateResponseDto
            {
                Success = true,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                LocationAddress = dto.LocationAddress,
                Message = "Location updated successfully"
            };

            return Ok(ApiResponse<LocationUpdateResponseDto>.SuccessResponse(response));
        }

        /// <summary>
        /// Get current user's saved location
        /// </summary>
        [HttpGet("location")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<LocationUpdateResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLocation()
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized(ApiResponse<LocationUpdateResponseDto>.ErrorResponse("Unable to identify user"));
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(ApiResponse<LocationUpdateResponseDto>.ErrorResponse("User not found"));
            }

            var response = new LocationUpdateResponseDto
            {
                Success = true,
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                LocationAddress = user.LocationAddress,
                Message = user.Latitude.HasValue 
                    ? "Location retrieved successfully" 
                    : "No location set"
            };

            return Ok(ApiResponse<LocationUpdateResponseDto>.SuccessResponse(response));
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

    // Supporting DTOs for pricing info endpoint
    public class DeliveryPricingInfo
    {
        public int MaxDistanceKm { get; set; }
        public decimal BaseRatePer10Km { get; set; }
        public string Currency { get; set; } = "NPR";
        public List<string> PricingRules { get; set; } = new();
        public List<DeliveryPriceExample> Examples { get; set; } = new();
    }

    public class DeliveryPriceExample
    {
        public string DistanceRange { get; set; } = string.Empty;
        public decimal Fee { get; set; }
    }
}
