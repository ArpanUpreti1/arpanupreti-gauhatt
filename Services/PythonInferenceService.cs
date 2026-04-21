using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Services
{
    public class PythonInferenceService : IPythonInferenceService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<PythonInferenceService> _logger;
        private readonly JsonSerializerOptions _jsonOptions;

        public PythonInferenceService(HttpClient httpClient, ILogger<PythonInferenceService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            };
        }

        public async Task<TopCropsPredictionResponseDto> GetTopCropsAsync(TopCropsPredictionRequestDto request, CancellationToken cancellationToken = default)
        {
            var pythonRequest = new PythonTopCropsRequestDto
            {
                Month = request.Month,
                Year = request.Year,
                TopN = request.TopN
            };

            var pythonResponse = await PostToPythonAsync<PythonTopCropsRequestDto, PythonTopCropsResponseDto>(
                "predict/top-crops",
                pythonRequest,
                cancellationToken);

            return new TopCropsPredictionResponseDto
            {
                TopCrops = pythonResponse.TopCrops?.Select(item => new TopCropPredictionDto
                {
                    CommodityName = item.CommodityName,
                    PredictedDemand = item.PredictedDemand,
                    ConfidenceScore = item.ConfidenceScore,
                    AdditionalData = item.AdditionalData
                }).ToList() ?? new List<TopCropPredictionDto>(),
                AdditionalData = pythonResponse.AdditionalData
            };
        }

        public async Task<PythonHealthResponseDto> CheckHealthAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _httpClient.GetAsync("health", cancellationToken);
                var message = response.IsSuccessStatusCode
                    ? "Python inference service is healthy"
                    : $"Python inference service returned {(int)response.StatusCode}";

                return new PythonHealthResponseDto
                {
                    IsHealthy = response.IsSuccessStatusCode,
                    StatusCode = (int)response.StatusCode,
                    Message = message
                };
            }
            catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Python health check timed out");
                return new PythonHealthResponseDto
                {
                    IsHealthy = false,
                    StatusCode = StatusCodes.Status504GatewayTimeout,
                    Message = "Python inference service health check timed out"
                };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Python health check failed");
                return new PythonHealthResponseDto
                {
                    IsHealthy = false,
                    StatusCode = StatusCodes.Status502BadGateway,
                    Message = "Python inference service is unreachable"
                };
            }
        }

        private async Task<TResponse> PostToPythonAsync<TRequest, TResponse>(
            string endpoint,
            TRequest payload,
            CancellationToken cancellationToken)
        {
            HttpResponseMessage response;

            try
            {
                response = await _httpClient.PostAsJsonAsync(endpoint, payload, _jsonOptions, cancellationToken);
            }
            catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Request to Python endpoint {Endpoint} timed out", endpoint);
                throw new TimeoutException("Python inference request timed out.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Request to Python endpoint {Endpoint} failed", endpoint);
                throw new HttpRequestException("Python inference service is unreachable.", ex, HttpStatusCode.BadGateway);
            }

            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning(
                    "Python endpoint {Endpoint} returned non-success status {StatusCode}. Body: {Body}",
                    endpoint,
                    (int)response.StatusCode,
                    responseBody);

                throw new HttpRequestException(
                    $"Python inference service returned status {(int)response.StatusCode}.",
                    null,
                    HttpStatusCode.BadGateway);
            }

            var result = await response.Content.ReadFromJsonAsync<TResponse>(_jsonOptions, cancellationToken);
            if (result is null)
            {
                throw new InvalidOperationException("Python inference service returned an empty response.");
            }

            return result;
        }
    }
}