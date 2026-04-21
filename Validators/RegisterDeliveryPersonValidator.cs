using FluentValidation;
using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Validators
{
    public class RegisterDeliveryPersonValidator : AbstractValidator<RegisterDeliveryPersonDto>
    {
        private readonly string[] _allowedVehicleTypes = { "Bike", "Motorcycle", "Car", "Van" };

        public RegisterDeliveryPersonValidator()
        {
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

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches(@"^[0-9]{10}$").WithMessage("Phone number must be exactly 10 digits");

            RuleFor(x => x.VehicleType)
                .NotEmpty().WithMessage("Vehicle type is required")
                .Must(v => _allowedVehicleTypes.Contains(v))
                .WithMessage("Vehicle type must be one of: Bike, Motorcycle, Car, Van");

            RuleFor(x => x.Latitude)
                .Must(lat => lat >= -90 && lat <= 90).WithMessage("Latitude must be between -90 and 90")
                .Must(lat => lat != 0).WithMessage("Please set your location before registering");

            RuleFor(x => x.Longitude)
                .Must(lon => lon >= -180 && lon <= 180).WithMessage("Longitude must be between -180 and 180")
                .Must(lon => lon != 0).WithMessage("Please set your location before registering");
        }
    }
}
