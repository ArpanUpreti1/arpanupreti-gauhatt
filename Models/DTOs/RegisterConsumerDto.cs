using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    public class RegisterConsumerDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        
        // Location fields
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationAddress { get; set; }
    }
}
