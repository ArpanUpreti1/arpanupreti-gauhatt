using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    public class RegisterConsumerDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        
        // Location fields (mandatory)
        [Required(ErrorMessage = "Latitude is required")]
        public double Latitude { get; set; }
        
        [Required(ErrorMessage = "Longitude is required")]
        public double Longitude { get; set; }
        
        public string? LocationAddress { get; set; }
    }
}
