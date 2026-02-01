using FarmerConsumerAPI.Models.Entities;

namespace FarmerConsumerAPI.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        string GenerateEmailVerificationToken();
        Task<RefreshToken> CreateRefreshTokenAsync(User user);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token);
        bool ValidateRefreshToken(RefreshToken refreshToken);
    }
}
