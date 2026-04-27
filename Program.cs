using System.Text;
using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Middleware;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Services;
using FarmerConsumerAPI.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// FluentValidation
builder.Services.AddScoped<IValidator<RegisterConsumerDto>, RegisterConsumerValidator>();
builder.Services.AddScoped<IValidator<RegisterFarmerDto>, RegisterFarmerValidator>();
builder.Services.AddScoped<IValidator<RegisterFarmerStep1Dto>, RegisterFarmerStep1Validator>();
builder.Services.AddScoped<IValidator<RegisterDeliveryPersonDto>, RegisterDeliveryPersonValidator>();
builder.Services.AddScoped<IValidator<SignInDto>, SignInValidator>();
builder.Services.AddScoped<IValidator<VerifyEmailDto>, VerifyEmailValidator>();
builder.Services.AddScoped<IValidator<ResendVerificationDto>, ResendVerificationValidator>();

// Services
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IDeliveryService, DeliveryService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDeliveryPersonService, DeliveryPersonService>();

builder.Services.AddOptions<PythonInferenceOptions>()
    .Bind(builder.Configuration.GetSection("PythonInference"))
    .Validate(o => !string.IsNullOrWhiteSpace(o.BaseUrl), "PythonInference:BaseUrl is required")
    .Validate(o => Uri.TryCreate(o.BaseUrl, UriKind.Absolute, out _), "PythonInference:BaseUrl must be a valid absolute URL")
    .ValidateOnStart();

builder.Services.AddHttpClient<IPythonInferenceService, PythonInferenceService>((sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<PythonInferenceOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds > 0 ? options.TimeoutSeconds : 20);
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.Name
    };
});

builder.Services.AddAuthorization();

// CORS
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var fallbackClientUrl = builder.Configuration["AppSettings:ClientUrl"];
var allowedOrigins = configuredOrigins
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToList();

if (!string.IsNullOrWhiteSpace(fallbackClientUrl) && !allowedOrigins.Contains(fallbackClientUrl, StringComparer.OrdinalIgnoreCase))
{
    allowedOrigins.Add(fallbackClientUrl);
}

if (allowedOrigins.Count == 0)
{
    allowedOrigins.Add("http://localhost:3000");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                {
                    return true;
                }

                // Allow Vercel preview deployments for this project pattern.
                if (Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                    uri.Scheme == Uri.UriSchemeHttps &&
                    uri.Host.EndsWith("-arpan-upretis-projects.vercel.app", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
    
    // Development policy - more permissive
    options.AddPolicy("Development", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Farmer Consumer API",
        Version = "v1",
        Description = "Authentication API for Farmer Consumer Platform"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        await DbInitializer.InitializeAsync(context);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Farmer Consumer API v1");
    });
    app.UseCors("Development");
}
else
{
    app.UseCors("AllowFrontend");
}

// Create upload directories
var uploadPath = Path.Combine(app.Environment.WebRootPath ?? app.Environment.ContentRootPath, "uploads");
var farmPhotosPath = Path.Combine(uploadPath, "farm-photos");
var identityProofsPath = Path.Combine(uploadPath, "identity-proofs");

if (!Directory.Exists(farmPhotosPath))
    Directory.CreateDirectory(farmPhotosPath);
if (!Directory.Exists(identityProofsPath))
    Directory.CreateDirectory(identityProofsPath);

app.UseErrorHandling();

// Serve static files from wwwroot
app.UseStaticFiles();

// Serve static files from uploads folder (for farm photos and identity proofs)
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    OnPrepareResponse = ctx =>
    {
        // Allow CORS for uploaded images
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
    }
});

// Only redirect to HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
