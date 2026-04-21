using System.ComponentModel.DataAnnotations;

namespace FarmerConsumerAPI.Models.DTOs
{
    public class ApproveFarmerDto
    {
        [Required]
        public Guid FarmerId { get; set; }
    }

    public class RejectFarmerDto
    {
        [Required]
        public Guid FarmerId { get; set; }

        [Required]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Rejection reason must be between 10 and 500 characters")]
        public string Reason { get; set; } = string.Empty;
    }

    public class PendingFarmerDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FarmName { get; set; }
        public string? District { get; set; }
        public string? FarmAddress { get; set; }
        public string? CropTypes { get; set; }
        public string? FarmPhotoUrl { get; set; }
        public string? IdentityProofUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FarmerApprovalResultDto
    {
        public Guid FarmerId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? ApprovalDate { get; set; }
    }
}
