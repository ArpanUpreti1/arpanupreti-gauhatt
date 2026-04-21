using System.Text.Json;
using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IFileService _fileService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext context,
            ITokenService tokenService,
            IEmailService emailService,
            IFileService fileService,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _emailService = emailService;
            _fileService = fileService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ApiResponse<RegisterResponseData>> RegisterConsumerAsync(RegisterConsumerDto dto)
        {
            var requireEmailVerification = IsEmailVerificationRequired();

            // Check for existing username or email
            if (await IsUsernameExistsAsync(dto.Username))
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Username already exists", 
                    new Dictionary<string, List<string>> { { "username", new List<string> { "Username already exists" } } });
            }

            if (await IsEmailExistsAsync(dto.Email))
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Email already exists",
                    new Dictionary<string, List<string>> { { "email", new List<string> { "Email already exists" } } });
            }

            // Create user
            var verificationToken = _tokenService.GenerateEmailVerificationToken();
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email.ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
                Role = UserRole.Consumer,
                IsEmailVerified = !requireEmailVerification,
                EmailVerificationToken = requireEmailVerification ? verificationToken : null,
                EmailVerificationTokenExpiry = requireEmailVerification ? DateTime.UtcNow.AddMinutes(15) : null,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                LocationAddress = dto.LocationAddress,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Send verification email only when enabled
            if (requireEmailVerification)
            {
                await _emailService.SendVerificationEmailAsync(user.Email, user.Username, verificationToken);
            }

            _logger.LogInformation("Consumer registered: {Email}", user.Email);

            return ApiResponse<RegisterResponseData>.SuccessResponse(new RegisterResponseData
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = "Consumer"
            }, requireEmailVerification
                ? "Consumer registered successfully. Please verify your email."
                : "Consumer registered successfully.");
        }

        public async Task<ApiResponse<RegisterResponseData>> RegisterDeliveryPersonAsync(RegisterDeliveryPersonDto dto)
        {
            var requireEmailVerification = IsEmailVerificationRequired();

            if (await IsUsernameExistsAsync(dto.Username))
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Username already exists",
                    new Dictionary<string, List<string>> { { "username", new List<string> { "Username already exists" } } });
            }

            if (await IsEmailExistsAsync(dto.Email))
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Email already exists",
                    new Dictionary<string, List<string>> { { "email", new List<string> { "Email already exists" } } });
            }

            var verificationToken = _tokenService.GenerateEmailVerificationToken();
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email.ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
                Role = UserRole.DeliveryPerson,
                IsEmailVerified = !requireEmailVerification,
                EmailVerificationToken = requireEmailVerification ? verificationToken : null,
                EmailVerificationTokenExpiry = requireEmailVerification ? DateTime.UtcNow.AddMinutes(15) : null,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                VehicleType = dto.VehicleType,
                VehicleNumber = dto.VehicleNumber,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                LocationAddress = dto.LocationAddress,
                IsAvailableForDelivery = false, // starts offline
                LastLocationUpdate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            if (requireEmailVerification)
            {
                await _emailService.SendVerificationEmailAsync(user.Email, user.Username, verificationToken);
            }

            _logger.LogInformation("Delivery person registered: {Email}", user.Email);

            return ApiResponse<RegisterResponseData>.SuccessResponse(new RegisterResponseData
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = "DeliveryPerson"
            }, requireEmailVerification
                ? "Delivery person registered successfully. Please verify your email."
                : "Delivery person registered successfully.");
        }

        public async Task<ApiResponse<Step1ResponseData>> ValidateFarmerStep1Async(RegisterFarmerStep1Dto dto)
        {
            // Check for existing username or email
            if (await IsUsernameExistsAsync(dto.Username))
            {
                return ApiResponse<Step1ResponseData>.ErrorResponse("Username already exists",
                    new Dictionary<string, List<string>> { { "username", new List<string> { "Username already exists" } } });
            }

            if (await IsEmailExistsAsync(dto.Email))
            {
                return ApiResponse<Step1ResponseData>.ErrorResponse("Email already exists",
                    new Dictionary<string, List<string>> { { "email", new List<string> { "Email already exists" } } });
            }

            // Return temp ID for step 2
            return ApiResponse<Step1ResponseData>.SuccessResponse(new Step1ResponseData
            {
                TempUserId = Guid.NewGuid(),
                NextStep = 2
            }, "Step 1 completed. Proceed to farm information.");
        }

        public async Task<ApiResponse<RegisterResponseData>> RegisterFarmerAsync(RegisterFarmerDto dto)
        {
            var requireEmailVerification = IsEmailVerificationRequired();

            // Check for existing username or email
            if (await IsUsernameExistsAsync(dto.Username))
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Username already exists",
                    new Dictionary<string, List<string>> { { "username", new List<string> { "Username already exists" } } });
            }

            if (await IsEmailExistsAsync(dto.Email))
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Email already exists",
                    new Dictionary<string, List<string>> { { "email", new List<string> { "Email already exists" } } });
            }

            // Validate district exists
            var districtExists = await _context.Districts.AnyAsync(d => d.Name == dto.District && d.IsActive);
            if (!districtExists)
            {
                return ApiResponse<RegisterResponseData>.ErrorResponse("Invalid district",
                    new Dictionary<string, List<string>> { { "district", new List<string> { "Please select a valid district" } } });
            }

            var userId = Guid.NewGuid();
            string? farmPhotoUrl = null;
            string? identityProofUrl = null;

            // Debug logging
            _logger.LogInformation("RegisterFarmerAsync - FarmPhoto is null: {IsNull}, IdentityProof is null: {IsNull2}",
                dto.FarmPhoto == null, dto.IdentityProof == null);
            if (dto.FarmPhoto != null)
            {
                _logger.LogInformation("FarmPhoto: Name={Name}, Length={Length}, ContentType={ContentType}",
                    dto.FarmPhoto.FileName, dto.FarmPhoto.Length, dto.FarmPhoto.ContentType);
            }

            try
            {
                // Save files
                if (dto.FarmPhoto != null)
                {
                    farmPhotoUrl = await _fileService.SaveFileAsync(dto.FarmPhoto, "farm-photos", userId.ToString());
                }

                if (dto.IdentityProof != null)
                {
                    identityProofUrl = await _fileService.SaveFileAsync(dto.IdentityProof, "identity-proofs", userId.ToString());
                }

                // Create user
                var verificationToken = _tokenService.GenerateEmailVerificationToken();
                var user = new User
                {
                    Id = userId,
                    Username = dto.Username,
                    Email = dto.Email.ToLowerInvariant(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
                    Role = UserRole.Farmer,
                    IsEmailVerified = !requireEmailVerification,
                    EmailVerificationToken = requireEmailVerification ? verificationToken : null,
                    EmailVerificationTokenExpiry = requireEmailVerification ? DateTime.UtcNow.AddMinutes(15) : null,
                    FarmName = dto.FarmName,
                    District = dto.District,
                    FarmAddress = dto.FarmAddress,
                    CropTypes = JsonSerializer.Serialize(dto.CropTypes),
                    FarmPhotoUrl = farmPhotoUrl,
                    IdentityProofUrl = identityProofUrl,
                    PhoneNumber = dto.PhoneNumber,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    LocationAddress = dto.LocationAddress,
                    ApprovalStatus = ApprovalStatus.Pending, // Farmers require admin approval
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                // Send verification email only when enabled
                if (requireEmailVerification)
                {
                    await _emailService.SendVerificationEmailAsync(user.Email, user.Username, verificationToken);
                }

                _logger.LogInformation("Farmer registered and pending approval: {Email}", user.Email);

                return ApiResponse<RegisterResponseData>.SuccessResponse(new RegisterResponseData
                {
                    UserId = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = "Farmer",
                    FarmName = user.FarmName,
                    FarmPhotoUrl = farmPhotoUrl,
                    IdentityProofUrl = identityProofUrl
                }, requireEmailVerification
                    ? "Farmer registration submitted successfully. Please verify your email. Your account is pending admin approval and you will be notified once approved."
                    : "Farmer registration submitted successfully. Your account is pending admin approval and you will be notified once approved.");
            }
            catch (Exception ex)
            {
                // Clean up files if registration fails
                if (farmPhotoUrl != null) _fileService.DeleteFile(farmPhotoUrl);
                if (identityProofUrl != null) _fileService.DeleteFile(identityProofUrl);
                
                _logger.LogError(ex, "Failed to register farmer: {Email}", dto.Email);
                throw;
            }
        }

        public async Task<ApiResponse<AuthResponseData>> SignInAsync(SignInDto dto)
        {
            // Find user by email or username
            var user = await _context.Users
                .FirstOrDefaultAsync(u => 
                    u.Email == dto.EmailOrUsername.ToLowerInvariant() || 
                    u.Username == dto.EmailOrUsername);

            if (user == null)
            {
                return ApiResponse<AuthResponseData>.ErrorResponse("Invalid email/username or password");
            }

            if (!user.IsActive)
            {
                return ApiResponse<AuthResponseData>.ErrorResponse("Your account has been suspended. Please contact support.");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return ApiResponse<AuthResponseData>.ErrorResponse("Invalid email/username or password");
            }

            // Check email verification (optional based on configuration)
            var requireEmailVerification = IsEmailVerificationRequired();
            if (requireEmailVerification && !user.IsEmailVerified)
            {
                return ApiResponse<AuthResponseData>.ErrorResponse("Please verify your email before signing in");
            }

            // Check farmer approval status
            if (user.Role == UserRole.Farmer)
            {
                if (user.ApprovalStatus == ApprovalStatus.Pending)
                {
                    return ApiResponse<AuthResponseData>.ErrorResponse(
                        "Your farmer account is pending approval. Our admin team is reviewing your registration. " +
                        "You will receive an email notification once your account is approved. Thank you for your patience.");
                }
                else if (user.ApprovalStatus == ApprovalStatus.Rejected)
                {
                    var rejectionMessage = "Your farmer registration has been rejected.";
                    if (!string.IsNullOrEmpty(user.RejectionReason))
                    {
                        rejectionMessage += $" Reason: {user.RejectionReason}";
                    }
                    rejectionMessage += " Please contact support for more information or register again with valid details.";
                    return ApiResponse<AuthResponseData>.ErrorResponse(rejectionMessage);
                }
            }

            // Reset failed login attempts and update last login
            user.FailedLoginAttempts = 0;
            user.LockoutEnd = null;
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = await _tokenService.CreateRefreshTokenAsync(user);
            var expirationHours = int.Parse(_configuration["JwtSettings:ExpirationInHours"] ?? "24");

            _logger.LogInformation("User signed in: {Email}", user.Email);

            return ApiResponse<AuthResponseData>.SuccessResponse(new AuthResponseData
            {
                Token = accessToken,
                RefreshToken = refreshToken.Token,
                ExpiresAt = DateTime.UtcNow.AddHours(expirationHours),
                User = new UserResponseData
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    ApprovalStatus = user.Role == UserRole.Farmer ? user.ApprovalStatus.ToString() : null,
                    FarmName = user.FarmName,
                    District = user.District,
                    FarmAddress = user.FarmAddress,
                    CropTypes = user.CropTypes,
                    FarmPhotoUrl = user.FarmPhotoUrl,
                    IdentityProofUrl = user.IdentityProofUrl,
                    PhoneNumber = user.PhoneNumber,
                    FullName = user.FullName,
                    VehicleType = user.VehicleType,
                    VehicleNumber = user.VehicleNumber,
                    IsAvailableForDelivery = user.Role == UserRole.DeliveryPerson ? user.IsAvailableForDelivery : null,
                    Latitude = user.Latitude,
                    Longitude = user.Longitude,
                    LocationAddress = user.LocationAddress
                }
            }, "Sign in successful");
        }

        public async Task<ApiResponse<object>> VerifyEmailAsync(VerifyEmailDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLowerInvariant());

            if (user == null)
            {
                return ApiResponse<object>.ErrorResponse("User not found");
            }

            if (user.IsEmailVerified)
            {
                return ApiResponse<object>.SuccessResponse(null!, "Email is already verified");
            }

            if (user.EmailVerificationToken != dto.Token)
            {
                return ApiResponse<object>.ErrorResponse("Invalid verification token");
            }

            if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
            {
                return ApiResponse<object>.ErrorResponse("Verification token has expired. Please request a new one.");
            }

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Send welcome email
            await _emailService.SendWelcomeEmailAsync(user.Email, user.Username);

            _logger.LogInformation("Email verified: {Email}", user.Email);

            return ApiResponse<object>.SuccessResponse(null!, "Email verified successfully. You can now sign in.");
        }

        public async Task<ApiResponse<object>> ResendVerificationAsync(ResendVerificationDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLowerInvariant());

            if (user == null)
            {
                // Don't reveal if user exists
                return ApiResponse<object>.SuccessResponse(null!, "If the email exists, a verification email will be sent.");
            }

            if (user.IsEmailVerified)
            {
                return ApiResponse<object>.SuccessResponse(null!, "Email is already verified");
            }

            // Generate new token
            var verificationToken = _tokenService.GenerateEmailVerificationToken();
            user.EmailVerificationToken = verificationToken;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddMinutes(15);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Send verification email
            await _emailService.SendVerificationEmailAsync(user.Email, user.Username, verificationToken);

            _logger.LogInformation("Verification email resent: {Email}", user.Email);

            return ApiResponse<object>.SuccessResponse(null!, "Verification email sent successfully");
        }

        public async Task<bool> IsUsernameExistsAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

        private bool IsEmailVerificationRequired()
        {
            var rawValue = _configuration["AppSettings:RequireEmailVerification"];
            return bool.TryParse(rawValue, out var parsed) ? parsed : true;
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email.ToLowerInvariant());
        }

        public async Task<List<District>> GetDistrictsAsync()
        {
            return await _context.Districts
                .Where(d => d.IsActive)
                .OrderBy(d => d.Name)
                .ToListAsync();
        }

        public async Task<ApiResponse<List<PendingFarmerDto>>> GetPendingFarmersAsync()
        {
            var pendingFarmers = await _context.Users
                .Where(u => u.Role == UserRole.Farmer && u.ApprovalStatus == ApprovalStatus.Pending)
                .OrderBy(u => u.CreatedAt)
                .Select(u => new PendingFarmerDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FarmName = u.FarmName,
                    District = u.District,
                    FarmAddress = u.FarmAddress,
                    CropTypes = u.CropTypes,
                    FarmPhotoUrl = u.FarmPhotoUrl,
                    IdentityProofUrl = u.IdentityProofUrl,
                    PhoneNumber = u.PhoneNumber,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return ApiResponse<List<PendingFarmerDto>>.SuccessResponse(
                pendingFarmers, 
                $"Found {pendingFarmers.Count} pending farmer registration(s)");
        }

        public async Task<ApiResponse<FarmerApprovalResultDto>> ApproveFarmerAsync(Guid farmerId, Guid adminId)
        {
            var farmer = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == farmerId && u.Role == UserRole.Farmer);

            if (farmer == null)
            {
                return ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Farmer not found");
            }

            if (farmer.ApprovalStatus == ApprovalStatus.Approved)
            {
                return ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Farmer is already approved");
            }

            farmer.ApprovalStatus = ApprovalStatus.Approved;
            farmer.ApprovalDate = DateTime.UtcNow;
            farmer.ApprovedByAdminId = adminId;
            farmer.RejectionReason = null;
            farmer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send approval notification email
            await _emailService.SendFarmerApprovalEmailAsync(farmer.Email, farmer.Username);

            _logger.LogInformation("Farmer approved: {Email} by Admin: {AdminId}", farmer.Email, adminId);

            return ApiResponse<FarmerApprovalResultDto>.SuccessResponse(new FarmerApprovalResultDto
            {
                FarmerId = farmer.Id,
                Username = farmer.Username,
                Email = farmer.Email,
                Status = "Approved",
                ApprovalDate = farmer.ApprovalDate
            }, "Farmer approved successfully");
        }

        public async Task<ApiResponse<FarmerApprovalResultDto>> RejectFarmerAsync(Guid farmerId, Guid adminId, string reason)
        {
            var farmer = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == farmerId && u.Role == UserRole.Farmer);

            if (farmer == null)
            {
                return ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Farmer not found");
            }

            if (farmer.ApprovalStatus == ApprovalStatus.Rejected)
            {
                return ApiResponse<FarmerApprovalResultDto>.ErrorResponse("Farmer registration is already rejected");
            }

            farmer.ApprovalStatus = ApprovalStatus.Rejected;
            farmer.ApprovalDate = DateTime.UtcNow;
            farmer.ApprovedByAdminId = adminId;
            farmer.RejectionReason = reason;
            farmer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Send rejection notification email
            await _emailService.SendFarmerRejectionEmailAsync(farmer.Email, farmer.Username, reason);

            _logger.LogInformation("Farmer rejected: {Email} by Admin: {AdminId}. Reason: {Reason}", 
                farmer.Email, adminId, reason);

            return ApiResponse<FarmerApprovalResultDto>.SuccessResponse(new FarmerApprovalResultDto
            {
                FarmerId = farmer.Id,
                Username = farmer.Username,
                Email = farmer.Email,
                Status = "Rejected",
                ApprovalDate = farmer.ApprovalDate
            }, "Farmer registration rejected");
        }

        public async Task<ApiResponse<object>> UpdateUserLocationAsync(Guid userId, UpdateLocationDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<object>.ErrorResponse("User not found");
            }

            user.Latitude = dto.Latitude;
            user.Longitude = dto.Longitude;
            user.LocationAddress = dto.LocationAddress;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Location updated for user: {UserId}", userId);

            return ApiResponse<object>.SuccessResponse(new
            {
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                LocationAddress = user.LocationAddress
            }, "Location updated successfully");
        }

        public async Task<ApiResponse<object>> GetUserLocationAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<object>.ErrorResponse("User not found");
            }

            return ApiResponse<object>.SuccessResponse(new
            {
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                LocationAddress = user.LocationAddress
            });
        }
    }
}
