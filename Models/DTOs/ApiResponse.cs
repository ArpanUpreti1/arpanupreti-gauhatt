namespace FarmerConsumerAPI.Models.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public Dictionary<string, List<string>>? Errors { get; set; }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Operation successful")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> ErrorResponse(string message, Dictionary<string, List<string>>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors
            };
        }
    }

    public class AuthResponseData
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserResponseData User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }

    public class UserResponseData
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? ApprovalStatus { get; set; }
        public string? FarmName { get; set; }
        public string? District { get; set; }
        public string? FarmAddress { get; set; }
        public string? CropTypes { get; set; }
        public string? FarmPhotoUrl { get; set; }
        public string? IdentityProofUrl { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public class RegisterResponseData
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? FarmName { get; set; }
        public string? FarmPhotoUrl { get; set; }
        public string? IdentityProofUrl { get; set; }
    }

    public class Step1ResponseData
    {
        public Guid TempUserId { get; set; }
        public int NextStep { get; set; } = 2;
    }
}
