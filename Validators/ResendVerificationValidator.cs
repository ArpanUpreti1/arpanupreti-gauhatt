using FluentValidation;
using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Validators
{
    public class ResendVerificationValidator : AbstractValidator<ResendVerificationDto>
    {
        public ResendVerificationValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");
        }
    }
}
