namespace FarmerConsumerAPI.Models.DTOs
{
    public class PythonInferenceOptions
    {
        public string BaseUrl { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 20;
    }
}