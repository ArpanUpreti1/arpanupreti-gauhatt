using System.Text.Json;
using System.Text.Json.Serialization;

namespace FarmerConsumerAPI.Models.DTOs
{
    public class TopCropsPredictionRequestDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int TopN { get; set; } = 5;
    }

    public class TopCropsPredictionResponseDto
    {
        public List<TopCropPredictionDto> TopCrops { get; set; } = new();

        [JsonExtensionData]
        public Dictionary<string, JsonElement>? AdditionalData { get; set; }
    }

    public class TopCropPredictionDto
    {
        public string CommodityName { get; set; } = string.Empty;
        public double? PredictedDemand { get; set; }
        public double? ConfidenceScore { get; set; }

        [JsonExtensionData]
        public Dictionary<string, JsonElement>? AdditionalData { get; set; }
    }

    internal class PythonTopCropsRequestDto
    {
        [JsonPropertyName("month")]
        public int Month { get; set; }

        [JsonPropertyName("year")]
        public int Year { get; set; }

        [JsonPropertyName("top_n")]
        public int TopN { get; set; }
    }

    internal class PythonTopCropsResponseDto
    {
        [JsonPropertyName("top_crops")]
        public List<PythonTopCropItemDto>? TopCrops { get; set; }

        [JsonExtensionData]
        public Dictionary<string, JsonElement>? AdditionalData { get; set; }
    }

    internal class PythonTopCropItemDto
    {
        [JsonPropertyName("commodity_name")]
        public string CommodityName { get; set; } = string.Empty;

        [JsonPropertyName("predicted_demand")]
        public double? PredictedDemand { get; set; }

        [JsonPropertyName("confidence_score")]
        public double? ConfidenceScore { get; set; }

        [JsonExtensionData]
        public Dictionary<string, JsonElement>? AdditionalData { get; set; }
    }

    public class PythonHealthResponseDto
    {
        public bool IsHealthy { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;

        [JsonExtensionData]
        public Dictionary<string, JsonElement>? AdditionalData { get; set; }
    }
}