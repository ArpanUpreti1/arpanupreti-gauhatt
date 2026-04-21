using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;
        private readonly ILocationService _locationService;
        private readonly IDeliveryService _deliveryService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            ApplicationDbContext context,
            IFileService fileService,
            ILocationService locationService,
            IDeliveryService deliveryService,
            INotificationService notificationService,
            ILogger<ProductService> logger)
        {
            _context = context;
            _fileService = fileService;
            _locationService = locationService;
            _deliveryService = deliveryService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<ApiResponse<ProductResponseDto>> CreateProductAsync(CreateProductDto dto, Guid farmerId)
        {
            // Verify farmer exists and is approved
            var farmer = await _context.Users.FirstOrDefaultAsync(u => u.Id == farmerId && u.Role == UserRole.Farmer);
            if (farmer == null)
            {
                return ApiResponse<ProductResponseDto>.ErrorResponse("Farmer not found");
            }

            if (farmer.ApprovalStatus != ApprovalStatus.Approved)
            {
                return ApiResponse<ProductResponseDto>.ErrorResponse("Your farmer account must be approved before adding products");
            }

            // Check if farmer has set their location (mandatory for delivery calculations)
            if (!farmer.Latitude.HasValue || !farmer.Longitude.HasValue)
            {
                return ApiResponse<ProductResponseDto>.ErrorResponse(
                    "Please set your farm location before adding products. This is required for delivery calculations.",
                    new Dictionary<string, List<string>> 
                    { 
                        { "location", new List<string> { "Farm location is required. Please update your profile with your farm's coordinates." } } 
                    });
            }

            string? imageUrl = null;
            if (dto.Image != null)
            {
                imageUrl = await _fileService.SaveFileAsync(dto.Image, "products", Guid.NewGuid().ToString());
            }

            var product = new Product
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                Unit = dto.Unit,
                Category = dto.Category,
                IsOrganic = dto.IsOrganic,
                ImageUrl = imageUrl,
                FarmerId = farmerId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product created: {ProductName} by Farmer: {FarmerId}", product.Name, farmerId);

            return ApiResponse<ProductResponseDto>.SuccessResponse(MapToResponseDto(product, farmer), "Product created successfully");
        }

        public async Task<ApiResponse<ProductResponseDto>> UpdateProductAsync(Guid productId, UpdateProductDto dto, Guid farmerId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .FirstOrDefaultAsync(p => p.Id == productId && p.FarmerId == farmerId);

            if (product == null)
            {
                return ApiResponse<ProductResponseDto>.ErrorResponse("Product not found or you don't have permission to edit it");
            }

            // Update image if provided
            if (dto.Image != null)
            {
                // Delete old image
                if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    _fileService.DeleteFile(product.ImageUrl);
                }
                product.ImageUrl = await _fileService.SaveFileAsync(dto.Image, "products", Guid.NewGuid().ToString());
            }

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.StockQuantity = dto.StockQuantity;
            product.Unit = dto.Unit;
            product.Category = dto.Category;
            product.IsOrganic = dto.IsOrganic;
            product.IsActive = dto.IsActive;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Product updated: {ProductId}", productId);

            return ApiResponse<ProductResponseDto>.SuccessResponse(MapToResponseDto(product, product.Farmer), "Product updated successfully");
        }

        public async Task<ApiResponse<object>> DeleteProductAsync(Guid productId, Guid farmerId)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == productId && p.FarmerId == farmerId);

            if (product == null)
            {
                return ApiResponse<object>.ErrorResponse("Product not found or you don't have permission to delete it");
            }

            // Products linked to existing order items cannot be hard-deleted due FK constraints.
            // In that case, mark as inactive so it disappears from public listings.
            var hasOrderItems = await _context.OrderItems.AnyAsync(oi => oi.ProductId == productId);
            if (hasOrderItems)
            {
                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product archived instead of deleted due to order references: {ProductId}", productId);

                return ApiResponse<object>.SuccessResponse(null!, "Product is part of existing orders and has been archived successfully");
            }

            // Delete image file
            var imageUrl = product.ImageUrl;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(imageUrl))
            {
                _fileService.DeleteFile(imageUrl);
            }

            _logger.LogInformation("Product deleted: {ProductId}", productId);

            return ApiResponse<object>.SuccessResponse(null!, "Product deleted successfully");
        }

        public async Task<ApiResponse<ProductListResponseDto>> GetFarmerProductsAsync(Guid farmerId, int page = 1, int pageSize = 10)
        {
            var query = _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Ratings)
                .Where(p => p.FarmerId == farmerId)
                .OrderByDescending(p => p.CreatedAt);

            var totalCount = await query.CountAsync();
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new ProductListResponseDto
            {
                Products = products.Select(p => MapToResponseDto(p, p.Farmer)).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<ProductListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<ProductListResponseDto>> GetProductsAsync(ProductFilterDto filter)
        {
            var query = _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Ratings)
                .Where(p => p.IsActive && p.Farmer.ApprovalStatus == ApprovalStatus.Approved);

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(search) || 
                    (p.Description != null && p.Description.ToLower().Contains(search)) ||
                    (p.Farmer.FarmName != null && p.Farmer.FarmName.ToLower().Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(filter.Category))
            {
                query = query.Where(p => p.Category == filter.Category);
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            if (filter.IsOrganic.HasValue)
            {
                query = query.Where(p => p.IsOrganic == filter.IsOrganic.Value);
            }

            // Get all products first (for distance calculation)
            var allProducts = await query.ToListAsync();

            // Calculate distances and delivery fees if consumer location is provided
            var productsWithDistance = allProducts.Select(p => {
                int distanceKm = 0;
                decimal? deliveryFee = null;
                bool canDeliver = true;
                
                if (filter.ConsumerLatitude.HasValue && filter.ConsumerLongitude.HasValue &&
                    p.Farmer.Latitude.HasValue && p.Farmer.Longitude.HasValue)
                {
                    var distance = _locationService.CalculateDistanceKm(
                        filter.ConsumerLatitude.Value,
                        filter.ConsumerLongitude.Value,
                        p.Farmer.Latitude.Value,
                        p.Farmer.Longitude.Value
                    );
                    distanceKm = (int)Math.Ceiling(distance);
                    
                    // Calculate delivery fee and check if deliverable
                    canDeliver = _deliveryService.IsDeliveryPossible(distance);
                    if (canDeliver)
                    {
                        deliveryFee = _deliveryService.CalculateDeliveryFee(distance);
                    }
                }
                
                return new { Product = p, DistanceKm = distanceKm, DeliveryFee = deliveryFee, CanDeliver = canDeliver };
            }).ToList();

            // Enforce delivery limit (40km) if enabled and consumer location is provided
            if (filter.EnforceDeliveryLimit && filter.ConsumerLatitude.HasValue && filter.ConsumerLongitude.HasValue)
            {
                productsWithDistance = productsWithDistance
                    .Where(p => p.CanDeliver)
                    .ToList();
            }
            // Also apply manual max distance filter if provided and different from delivery limit
            else if (filter.MaxDistance.HasValue)
            {
                productsWithDistance = productsWithDistance
                    .Where(p => p.DistanceKm <= filter.MaxDistance.Value)
                    .ToList();
            }

            // Apply sorting
            var sortedProducts = filter.SortBy.ToLower() switch
            {
                "price_low" => productsWithDistance.OrderBy(p => p.Product.Price),
                "price_high" => productsWithDistance.OrderByDescending(p => p.Product.Price),
                "name" => productsWithDistance.OrderBy(p => p.Product.Name),
                "distance" => productsWithDistance.OrderBy(p => p.DistanceKm),
                _ => productsWithDistance.OrderByDescending(p => p.Product.CreatedAt)
            };

            var totalCount = sortedProducts.Count();
            var pagedProducts = sortedProducts
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToList();

            var response = new ProductListResponseDto
            {
                Products = pagedProducts.Select(p => MapToResponseDtoWithDistanceAndFee(
                    p.Product, 
                    p.Product.Farmer, 
                    p.DistanceKm, 
                    p.DeliveryFee,
                    p.CanDeliver
                )).ToList(),
                TotalCount = totalCount,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };

            return ApiResponse<ProductListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<ProductResponseDto>> GetProductByIdAsync(Guid productId)
        {
            var product = await _context.Products
                .Include(p => p.Farmer)
                .Include(p => p.Ratings)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
            {
                return ApiResponse<ProductResponseDto>.ErrorResponse("Product not found");
            }

            return ApiResponse<ProductResponseDto>.SuccessResponse(MapToResponseDto(product, product.Farmer));
        }

        public async Task<ApiResponse<List<string>>> GetCategoriesAsync()
        {
            var categories = await _context.Products
                .Where(p => p.IsActive)
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            // Add default categories if none exist
            if (!categories.Any())
            {
                categories = new List<string>
                {
                    "Vegetables",
                    "Fruits",
                    "Dairy & Eggs",
                    "Grains",
                    "Baked Goods",
                    "Pantry",
                    "Others"
                };
            }

            return ApiResponse<List<string>>.SuccessResponse(categories);
        }

        private ProductResponseDto MapToResponseDto(Product product, User farmer, Guid? currentUserId = null)
        {
            var ratings = product.Ratings?.ToList() ?? new List<ProductRating>();
            var averageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0;
            var userRating = currentUserId.HasValue ? ratings.FirstOrDefault(r => r.UserId == currentUserId.Value)?.Rating : null;
            
            return new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Unit = product.Unit,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive,
                IsOrganic = product.IsOrganic,
                DistanceKm = product.DistanceKm,
                DeliveryFee = null,
                CanDeliver = true,
                CreatedAt = product.CreatedAt,
                FarmerId = farmer.Id,
                FarmerName = farmer.Username,
                FarmName = farmer.FarmName,
                FarmerPhotoUrl = farmer.FarmPhotoUrl,
                District = farmer.District,
                FarmerLatitude = farmer.Latitude,
                FarmerLongitude = farmer.Longitude,
                AverageRating = Math.Round(averageRating, 1),
                TotalRatings = ratings.Count,
                UserRating = userRating
            };
        }
        
        private ProductResponseDto MapToResponseDtoWithDistance(Product product, User farmer, int distanceKm, Guid? currentUserId = null)
        {
            var ratings = product.Ratings?.ToList() ?? new List<ProductRating>();
            var averageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0;
            var userRating = currentUserId.HasValue ? ratings.FirstOrDefault(r => r.UserId == currentUserId.Value)?.Rating : null;
            
            var canDeliver = _deliveryService.IsDeliveryPossible(distanceKm);
            return new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Unit = product.Unit,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive,
                IsOrganic = product.IsOrganic,
                DistanceKm = distanceKm,
                DeliveryFee = canDeliver ? _deliveryService.CalculateDeliveryFee(distanceKm) : null,
                CanDeliver = canDeliver,
                CreatedAt = product.CreatedAt,
                FarmerId = farmer.Id,
                FarmerName = farmer.Username,
                FarmName = farmer.FarmName,
                FarmerPhotoUrl = farmer.FarmPhotoUrl,
                District = farmer.District,
                FarmerLatitude = farmer.Latitude,
                FarmerLongitude = farmer.Longitude,
                AverageRating = Math.Round(averageRating, 1),
                TotalRatings = ratings.Count,
                UserRating = userRating
            };
        }
        
        private ProductResponseDto MapToResponseDtoWithDistanceAndFee(
            Product product, 
            User farmer, 
            int distanceKm, 
            decimal? deliveryFee,
            bool canDeliver,
            Guid? currentUserId = null)
        {
            var ratings = product.Ratings?.ToList() ?? new List<ProductRating>();
            var averageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0;
            var userRating = currentUserId.HasValue ? ratings.FirstOrDefault(r => r.UserId == currentUserId.Value)?.Rating : null;
            
            return new ProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Unit = product.Unit,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive,
                IsOrganic = product.IsOrganic,
                DistanceKm = distanceKm,
                DeliveryFee = deliveryFee,
                CanDeliver = canDeliver,
                CreatedAt = product.CreatedAt,
                FarmerId = farmer.Id,
                FarmerName = farmer.Username,
                FarmName = farmer.FarmName,
                FarmerPhotoUrl = farmer.FarmPhotoUrl,
                District = farmer.District,
                FarmerLatitude = farmer.Latitude,
                FarmerLongitude = farmer.Longitude,
                AverageRating = Math.Round(averageRating, 1),
                TotalRatings = ratings.Count,
                UserRating = userRating
            };
        }
        
        public async Task<ApiResponse<DeliveryCheckResponseDto>> CheckDeliveryAsync(DeliveryCheckDto dto)
        {
            var products = await _context.Products
                .Include(p => p.Farmer)
                .Where(p => dto.ProductIds.Contains(p.Id))
                .ToListAsync();

            if (!products.Any())
            {
                return ApiResponse<DeliveryCheckResponseDto>.ErrorResponse("No products found");
            }

            var productDeliveryInfos = new List<ProductDeliveryInfo>();
            bool allCanDeliver = true;
            const int maxDeliveryDistanceKm = 40;

            foreach (var product in products)
            {
                int distanceKm = 0;
                bool canDeliver = true;

                if (product.Farmer.Latitude.HasValue && product.Farmer.Longitude.HasValue)
                {
                    distanceKm = (int)Math.Round(_locationService.CalculateDistanceKm(
                        dto.ConsumerLatitude,
                        dto.ConsumerLongitude,
                        product.Farmer.Latitude.Value,
                        product.Farmer.Longitude.Value
                    ));

                    canDeliver = _locationService.CanDeliver(distanceKm, maxDeliveryDistanceKm);
                }
                else
                {
                    // If farmer has no location, we assume delivery is possible (for backwards compatibility)
                    _logger.LogWarning("Farmer {FarmerId} has no location set", product.FarmerId);
                }

                if (!canDeliver) allCanDeliver = false;

                productDeliveryInfos.Add(new ProductDeliveryInfo
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    DistanceKm = distanceKm,
                    CanDeliver = canDeliver
                });
            }

            var response = new DeliveryCheckResponseDto
            {
                CanDeliver = allCanDeliver,
                Products = productDeliveryInfos,
                Message = allCanDeliver 
                    ? "All products can be delivered to your location" 
                    : $"Some products are from farms more than {maxDeliveryDistanceKm}km away and cannot be delivered"
            };

            return ApiResponse<DeliveryCheckResponseDto>.SuccessResponse(response);
        }

        // Rating Methods
        public async Task<ApiResponse<RatingResponseDto>> AddOrUpdateRatingAsync(Guid productId, CreateRatingDto dto, Guid userId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
            {
                return ApiResponse<RatingResponseDto>.ErrorResponse("Product not found");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return ApiResponse<RatingResponseDto>.ErrorResponse("User not found");
            }

            // Check if user already rated this product
            var existingRating = await _context.ProductRatings
                .FirstOrDefaultAsync(r => r.ProductId == productId && r.UserId == userId);

            if (existingRating != null)
            {
                // Update existing rating
                existingRating.Rating = dto.Rating;
                existingRating.Review = dto.Review;
                existingRating.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                await TryCreateRatingNotificationAsync(
                    product,
                    user.Username,
                    existingRating.Rating,
                    existingRating.Review,
                    existingRating.Id,
                    isUpdate: true);
                
                _logger.LogInformation("Rating updated for Product: {ProductId} by User: {UserId}", productId, userId);
                
                return ApiResponse<RatingResponseDto>.SuccessResponse(new RatingResponseDto
                {
                    Id = existingRating.Id,
                    ProductId = existingRating.ProductId,
                    UserId = existingRating.UserId,
                    Username = user.Username,
                    Rating = existingRating.Rating,
                    Review = existingRating.Review,
                    CreatedAt = existingRating.CreatedAt
                }, "Rating updated successfully");
            }

            // Create new rating
            var rating = new ProductRating
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                UserId = userId,
                Rating = dto.Rating,
                Review = dto.Review,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.ProductRatings.AddAsync(rating);
            await _context.SaveChangesAsync();

            await TryCreateRatingNotificationAsync(
                product,
                user.Username,
                rating.Rating,
                rating.Review,
                rating.Id,
                isUpdate: false);

            _logger.LogInformation("Rating added for Product: {ProductId} by User: {UserId}", productId, userId);

            return ApiResponse<RatingResponseDto>.SuccessResponse(new RatingResponseDto
            {
                Id = rating.Id,
                ProductId = rating.ProductId,
                UserId = rating.UserId,
                Username = user.Username,
                Rating = rating.Rating,
                Review = rating.Review,
                CreatedAt = rating.CreatedAt
            }, "Rating added successfully");
        }

        public async Task<ApiResponse<RatingListResponseDto>> GetProductRatingsAsync(Guid productId, int page = 1, int pageSize = 10)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
            {
                return ApiResponse<RatingListResponseDto>.ErrorResponse("Product not found");
            }

            var query = _context.ProductRatings
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt);

            var totalCount = await query.CountAsync();
            var ratings = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new RatingListResponseDto
            {
                Ratings = ratings.Select(r => new RatingResponseDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    Username = r.User.Username,
                    Rating = r.Rating,
                    Review = r.Review,
                    CreatedAt = r.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return ApiResponse<RatingListResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<ProductRatingSummaryDto>> GetProductRatingSummaryAsync(Guid productId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
            {
                return ApiResponse<ProductRatingSummaryDto>.ErrorResponse("Product not found");
            }

            var ratings = await _context.ProductRatings
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            var distribution = new int[5];
            foreach (var rating in ratings)
            {
                if (rating.Rating >= 1 && rating.Rating <= 5)
                {
                    distribution[rating.Rating - 1]++;
                }
            }

            var summary = new ProductRatingSummaryDto
            {
                AverageRating = ratings.Any() ? Math.Round(ratings.Average(r => r.Rating), 1) : 0,
                TotalRatings = ratings.Count,
                RatingDistribution = distribution
            };

            return ApiResponse<ProductRatingSummaryDto>.SuccessResponse(summary);
        }

        public async Task<ApiResponse<object>> DeleteRatingAsync(Guid productId, Guid userId)
        {
            var rating = await _context.ProductRatings
                .FirstOrDefaultAsync(r => r.ProductId == productId && r.UserId == userId);

            if (rating == null)
            {
                return ApiResponse<object>.ErrorResponse("Rating not found");
            }

            _context.ProductRatings.Remove(rating);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Rating deleted for Product: {ProductId} by User: {UserId}", productId, userId);

            return ApiResponse<object>.SuccessResponse(null!, "Rating deleted successfully");
        }

        private async Task TryCreateRatingNotificationAsync(
            Product product,
            string reviewerName,
            int rating,
            string? review,
            Guid ratingId,
            bool isUpdate)
        {
            if (product.FarmerId == Guid.Empty)
            {
                return;
            }

            var title = isUpdate ? "Product review updated" : "New product review";
            var actionText = isUpdate ? "updated" : "left";
            var reviewText = string.IsNullOrWhiteSpace(review)
                ? ""
                : $" Review: {TrimForNotification(review.Trim(), 120)}";
            var message = $"{reviewerName} {actionText} a {rating}/5 rating for {product.Name}.{reviewText}";

            try
            {
                await _notificationService.CreateNotificationAsync(
                    product.FarmerId,
                    title,
                    message,
                    "review",
                    ratingId.ToString(),
                    "ProductRating");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to create rating notification for farmer {FarmerId} and product {ProductId}",
                    product.FarmerId,
                    product.Id);
            }
        }

        private static string TrimForNotification(string text, int maxLength)
        {
            if (text.Length <= maxLength)
            {
                return text;
            }

            return text.Substring(0, maxLength - 3) + "...";
        }
    }
}
