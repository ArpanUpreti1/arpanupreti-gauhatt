using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IPythonInferenceService _pythonInferenceService;

        public HealthController(IPythonInferenceService pythonInferenceService)
        {
            _pythonInferenceService = pythonInferenceService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status503ServiceUnavailable)]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var pythonHealth = await _pythonInferenceService.CheckHealthAsync(cancellationToken);

            var payload = new
            {
                api = new { status = "healthy" },
                python = new
                {
                    status = pythonHealth.IsHealthy ? "healthy" : "unhealthy",
                    statusCode = pythonHealth.StatusCode,
                    message = pythonHealth.Message
                }
            };

            if (!pythonHealth.IsHealthy)
            {
                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new ApiResponse<object>
                    {
                        Success = false,
                        Message = "One or more downstream services are unhealthy.",
                        Data = payload
                    });
            }

            return Ok(ApiResponse<object>.SuccessResponse(payload, "Service health check passed"));
        }
    }
}