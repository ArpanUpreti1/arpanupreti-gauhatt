namespace FarmerConsumerAPI.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string username, string otp);
        Task SendWelcomeEmailAsync(string email, string username);
        Task SendFarmerApprovalEmailAsync(string email, string username);
        Task SendFarmerRejectionEmailAsync(string email, string username, string reason);
    }
}
