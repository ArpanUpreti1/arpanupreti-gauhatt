namespace FarmerConsumerAPI.Models.DTOs
{
    public class SignInDto
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
