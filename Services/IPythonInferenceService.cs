using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Services
{
    public interface IPythonInferenceService
    {
        Task<TopCropsPredictionResponseDto> GetTopCropsAsync(TopCropsPredictionRequestDto request, CancellationToken cancellationToken = default);
        Task<PythonHealthResponseDto> CheckHealthAsync(CancellationToken cancellationToken = default);
    }
}