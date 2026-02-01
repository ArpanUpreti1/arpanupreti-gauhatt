using FluentValidation;
using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Validators
{
    public class SignInValidator : AbstractValidator<SignInDto>
    {
        public SignInValidator()
        {
            RuleFor(x => x.EmailOrUsername)
                .NotEmpty().WithMessage("Email or username is required");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required");
        }
    }
}
