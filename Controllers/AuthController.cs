using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmerConsumerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IValidator<RegisterConsumerDto> _consumerValidator;
        private readonly IValidator<RegisterFarmerDto> _farmerValidator;
        private readonly IValidator<RegisterFarmerStep1Dto> _farmerStep1Validator;
        private readonly IValidator<SignInDto> _signInValidator;
        private readonly IValidator<VerifyEmailDto> _verifyEmailValidator;
        private readonly IValidator<ResendVerificationDto> _resendVerificationValidator;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            IValidator<RegisterConsumerDto> consumerValidator,
            IValidator<RegisterFarmerDto> farmerValidator,
            IValidator<RegisterFarmerStep1Dto> farmerStep1Validator,
            IValidator<SignInDto> signInValidator,
            IValidator<VerifyEmailDto> verifyEmailValidator,
            IValidator<ResendVerificationDto> resendVerificationValidator,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _consumerValidator = consumerValidator;
            _farmerValidator = farmerValidator;
            _farmerStep1Validator = farmerStep1Validator;
            _signInValidator = signInValidator;
            _verifyEmailValidator = verifyEmailValidator;
            _resendVerificationValidator = resendVerificationValidator;
            _logger = logger;
        }

        /// <summary>
        /// Register a new consumer
        /// </summary>
        [HttpPost("register/consumer")]
        [ProducesResponseType(typeof(ApiResponse<RegisterResponseData>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<RegisterResponseData>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<RegisterResponseData>), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterConsumer([FromBody] RegisterConsumerDto dto)
        {
            var validationResult = await _consumerValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToList());

                return BadRequest(ApiResponse<RegisterResponseData>.ErrorResponse("Validation failed", errors));
            }

            var result = await _authService.RegisterConsumerAsync(dto);

            if (!result.Success)
            {
                if (result.Message.Contains("already exists"))
                {
                    return Conflict(result);
                }
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Farmer registration step 1 - validate account info
        /// </summary>
        [HttpPost("register/farmer/step1")]
        [ProducesResponseType(typeof(ApiResponse<Step1ResponseData>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Step1ResponseData>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Step1ResponseData>), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterFarmerStep1([FromBody] RegisterFarmerStep1Dto dto)
        {
            var validationResult = await _farmerStep1Validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToList());

                return BadRequest(ApiResponse<Step1ResponseData>.ErrorResponse("Validation failed", errors));
            }

            var result = await _authService.ValidateFarmerStep1Async(dto);

            if (!result.Success)
            {
                if (result.Message.Contains("already exists"))
                {
                    return Conflict(result);
                }
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Complete farmer registration with farm info and file uploads
        /// </summary>
        [HttpPost("register/farmer")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiResponse<RegisterResponseData>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<RegisterResponseData>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<RegisterResponseData>), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegisterFarmer([FromForm] RegisterFarmerDto dto)
        {
            var validationResult = await _farmerValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToList());

                return BadRequest(ApiResponse<RegisterResponseData>.ErrorResponse("Validation failed", errors));
            }

            var result = await _authService.RegisterFarmerAsync(dto);

            if (!result.Success)
            {
                if (result.Message.Contains("already exists"))
                {
                    return Conflict(result);
                }
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Sign in for all user types
        /// </summary>
        [HttpPost("signin")]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseData>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseData>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseData>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseData>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> SignIn([FromBody] SignInDto dto)
        {
            var validationResult = await _signInValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToList());

                return BadRequest(ApiResponse<AuthResponseData>.ErrorResponse("Validation failed", errors));
            }

            var result = await _authService.SignInAsync(dto);

            if (!result.Success)
            {
                if (result.Message.Contains("verify your email"))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, result);
                }
                if (result.Message.Contains("locked"))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, result);
                }
                return Unauthorized(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Verify email address
        /// </summary>
        [HttpPost("verify-email")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            var validationResult = await _verifyEmailValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToList());

                return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
            }

            var result = await _authService.VerifyEmailAsync(dto);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Resend verification email
        /// </summary>
        [HttpPost("resend-verification")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            var validationResult = await _resendVerificationValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToList());

                return BadRequest(ApiResponse<object>.ErrorResponse("Validation failed", errors));
            }

            var result = await _authService.ResendVerificationAsync(dto);

            return Ok(result);
        }

        /// <summary>
        /// Get list of districts
        /// </summary>
        [HttpGet("districts")]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDistricts()
        {
            var districts = await _authService.GetDistrictsAsync();
            return Ok(ApiResponse<object>.SuccessResponse(districts, "Districts retrieved successfully"));
        }

        /// <summary>
        /// Check if username exists
        /// </summary>
        [HttpGet("check-username/{username}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckUsername(string username)
        {
            var exists = await _authService.IsUsernameExistsAsync(username);
            return Ok(new { exists, available = !exists });
        }

        /// <summary>
        /// Check if email exists
        /// </summary>
        [HttpGet("check-email/{email}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckEmail(string email)
        {
            var exists = await _authService.IsEmailExistsAsync(email);
            return Ok(new { exists, available = !exists });
        }
    }
}
