using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;

namespace FarmerConsumerAPI.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<RegisterResponseData>> RegisterConsumerAsync(RegisterConsumerDto dto);
        Task<ApiResponse<Step1ResponseData>> ValidateFarmerStep1Async(RegisterFarmerStep1Dto dto);
        Task<ApiResponse<RegisterResponseData>> RegisterFarmerAsync(RegisterFarmerDto dto);
        Task<ApiResponse<AuthResponseData>> SignInAsync(SignInDto dto);
        Task<ApiResponse<object>> VerifyEmailAsync(VerifyEmailDto dto);
        Task<ApiResponse<object>> ResendVerificationAsync(ResendVerificationDto dto);
        Task<bool> IsUsernameExistsAsync(string username);
        Task<bool> IsEmailExistsAsync(string email);
        Task<List<District>> GetDistrictsAsync();
        
        // Location methods
        Task<ApiResponse<object>> UpdateUserLocationAsync(Guid userId, UpdateLocationDto dto);
        Task<ApiResponse<object>> GetUserLocationAsync(Guid userId);
        
        // Admin farmer approval methods
        Task<ApiResponse<List<PendingFarmerDto>>> GetPendingFarmersAsync();
        Task<ApiResponse<FarmerApprovalResultDto>> ApproveFarmerAsync(Guid farmerId, Guid adminId);
        Task<ApiResponse<FarmerApprovalResultDto>> RejectFarmerAsync(Guid farmerId, Guid adminId, string reason);
    }
}
