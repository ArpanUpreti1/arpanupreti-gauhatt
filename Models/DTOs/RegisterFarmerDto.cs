using Microsoft.AspNetCore.Http;

namespace FarmerConsumerAPI.Models.DTOs
{
    public class RegisterFarmerDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string FarmName { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string FarmAddress { get; set; } = string.Empty;
        public List<string> CropTypes { get; set; } = new List<string>();
        public IFormFile? FarmPhoto { get; set; }
        public IFormFile? IdentityProof { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
