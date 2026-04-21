using FluentValidation;
using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Validators
{
    public class VerifyEmailValidator : AbstractValidator<VerifyEmailDto>
    {
        public VerifyEmailValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Verification token is required");
        }
    }
}
