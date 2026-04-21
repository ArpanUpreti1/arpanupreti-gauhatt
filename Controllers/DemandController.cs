using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DemandController : ControllerBase
    {
        private readonly IPythonInferenceService _pythonInferenceService;
        private readonly ILogger<DemandController> _logger;

        public DemandController(IPythonInferenceService pythonInferenceService, ILogger<DemandController> logger)
        {
            _pythonInferenceService = pythonInferenceService;
            _logger = logger;
        }

        [HttpPost("top-crops")]
        [ProducesResponseType(typeof(ApiResponse<TopCropsPredictionResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<TopCropsPredictionResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<TopCropsPredictionResponseDto>), StatusCodes.Status502BadGateway)]
        [ProducesResponseType(typeof(ApiResponse<TopCropsPredictionResponseDto>), StatusCodes.Status504GatewayTimeout)]
        public async Task<IActionResult> GetTopCrops([FromBody] TopCropsPredictionRequestDto request, CancellationToken cancellationToken)
        {
            if (request.Month < 1 || request.Month > 12)
            {
                return BadRequest(ApiResponse<TopCropsPredictionResponseDto>.ErrorResponse("Month must be between 1 and 12."));
            }

            if (request.TopN <= 0)
            {
                return BadRequest(ApiResponse<TopCropsPredictionResponseDto>.ErrorResponse("topN must be greater than 0."));
            }

            try
            {
                var result = await _pythonInferenceService.GetTopCropsAsync(request, cancellationToken);
                return Ok(ApiResponse<TopCropsPredictionResponseDto>.SuccessResponse(result, "Top crops predicted successfully"));
            }
            catch (TimeoutException ex)
            {
                _logger.LogWarning(ex, "Python timeout for top crops prediction");
                return StatusCode(
                    StatusCodes.Status504GatewayTimeout,
                    ApiResponse<TopCropsPredictionResponseDto>.ErrorResponse("Prediction service timed out. Please try again."));
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Python service failed for top crops prediction");
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    ApiResponse<TopCropsPredictionResponseDto>.ErrorResponse($"Prediction service is currently unavailable: {ex.Message}"));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Invalid payload from Python top crops endpoint");
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    ApiResponse<TopCropsPredictionResponseDto>.ErrorResponse("Prediction service returned an invalid response."));
            }
        }
    }
}