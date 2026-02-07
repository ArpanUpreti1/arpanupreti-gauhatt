using FarmerConsumerAPI.Models.Enums;

namespace FarmerConsumerAPI.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool IsEmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiry { get; set; }
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }

        // Approval status for farmers
        public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.NotApplicable;
        public string? RejectionReason { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public Guid? ApprovedByAdminId { get; set; }

        // Farmer specific fields
        public string? FarmName { get; set; }
        public string? District { get; set; }
        public string? FarmAddress { get; set; }
        public string? CropTypes { get; set; } // Stored as JSON array
        public string? FarmPhotoUrl { get; set; }
        public string? IdentityProofUrl { get; set; }
        public string? PhoneNumber { get; set; }

        // Location fields (for both farmers and consumers)
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? LocationAddress { get; set; } // Human readable address

        // Admin specific fields
        public string? FullName { get; set; }
        public string? Department { get; set; }

        // Consumer specific fields
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        // Navigation property
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
