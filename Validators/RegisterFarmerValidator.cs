using FluentValidation;
using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Validators
{
    public class RegisterFarmerValidator : AbstractValidator<RegisterFarmerDto>
    {
        private readonly string[] _allowedCropTypes = { "Vegetables", "Fruits", "Grain", "Pulses" };
        private readonly string[] _allowedImageTypes = { "image/jpeg", "image/png", "image/jpg" };
        private readonly string[] _allowedDocumentTypes = { "image/jpeg", "image/png", "image/jpg", "application/pdf" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public RegisterFarmerValidator()
        {
            // Account info validation
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters")
                .MaximumLength(50).WithMessage("Username cannot exceed 50 characters")
                .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("Username can only contain letters, numbers, underscores, and hyphens");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email cannot exceed 255 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one digit")
                .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character (@$!%*?&#)");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Confirm password is required")
                .Equal(x => x.Password).WithMessage("Passwords do not match");

            // Farm info validation
            RuleFor(x => x.FarmName)
                .NotEmpty().WithMessage("Farm name is required")
                .MinimumLength(2).WithMessage("Farm name must be at least 2 characters")
                .MaximumLength(200).WithMessage("Farm name cannot exceed 200 characters");

            RuleFor(x => x.District)
                .NotEmpty().WithMessage("District is required")
                .MinimumLength(2).WithMessage("District must be at least 2 characters")
                .MaximumLength(100).WithMessage("District cannot exceed 100 characters");

            RuleFor(x => x.FarmAddress)
                .NotEmpty().WithMessage("Farm address is required")
                .MinimumLength(10).WithMessage("Farm address must be at least 10 characters")
                .MaximumLength(500).WithMessage("Farm address cannot exceed 500 characters");

            RuleFor(x => x.CropTypes)
                .NotEmpty().WithMessage("At least one crop type must be selected")
                .Must(x => x != null && x.Count >= 1).WithMessage("At least one crop type must be selected")
                .Must(x => x != null && x.Count <= 4).WithMessage("Cannot select more than 4 crop types")
                .Must(x => x == null || x.All(c => _allowedCropTypes.Contains(c)))
                .WithMessage("Crop types must be one of: Vegetables, Fruits, Grain, Pulses");

            RuleFor(x => x.FarmPhoto)
                .NotNull().WithMessage("Farm photo is required")
                .Must(x => x == null || x.Length <= MaxFileSize).WithMessage("Farm photo file size cannot exceed 5MB")
                .Must(x => x == null || _allowedImageTypes.Contains(x.ContentType))
                .WithMessage("Farm photo must be a JPG, JPEG, or PNG image");

            RuleFor(x => x.IdentityProof)
                .NotNull().WithMessage("Identity proof is required")
                .Must(x => x == null || x.Length <= MaxFileSize).WithMessage("Identity proof file size cannot exceed 5MB")
                .Must(x => x == null || _allowedDocumentTypes.Contains(x.ContentType))
                .WithMessage("Identity proof must be a JPG, JPEG, PNG image, or PDF document");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches(@"^[0-9]{10}$").WithMessage("Phone number must be exactly 10 digits");
        }
    }
}
