using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Services
{
    public class DeliveryPersonService : IDeliveryPersonService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILocationService _locationService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<DeliveryPersonService> _logger;
        private const double AssignmentRadiusKm = 50;

        public DeliveryPersonService(
            ApplicationDbContext context,
            ILocationService locationService,
            INotificationService notificationService,
            ILogger<DeliveryPersonService> logger)
        {
            _context = context;
            _locationService = locationService;
            _notificationService = notificationService;
            _logger = logger;
        }

        // ──────────────────────────────────────────────────────────────
        // Auto-assign all nearby available delivery persons (within radius) when an order is ready
        // ──────────────────────────────────────────────────────────────
        public async Task<ApiResponse<DeliveryAssignmentDto>> AssignNearestDeliveryPersonAsync(Guid orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Consumer)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse("Order not found");

            // Check if already assigned
            var existingActiveAssignment = await _context.DeliveryAssignments
                .AnyAsync(da => da.OrderId == orderId && da.Status != "Rejected");

            if (existingActiveAssignment)
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse("Order already has an active delivery assignment");

            // Determine the pickup location (first farmer with a location in this order)
            var farmerIds = order.Items.Select(i => i.FarmerId).Distinct().ToList();
            var farmers = await _context.Users
                .Where(u => farmerIds.Contains(u.Id) && u.Latitude.HasValue && u.Longitude.HasValue)
                .ToListAsync();

            if (!farmers.Any())
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse("No farmer location available for this order");

            // Use the first farmer's location as the pickup point
            var pickupFarmer = farmers.First();
            double pickupLat = pickupFarmer.Latitude!.Value;
            double pickupLon = pickupFarmer.Longitude!.Value;

            // Delivery (drop-off) location
            double? dropoffLat = order.Latitude;
            double? dropoffLon = order.Longitude;

            // Find all available delivery persons with locations
            var availableDeliveryPersons = await _context.Users
                .Where(u => u.Role == UserRole.DeliveryPerson
                    && u.Latitude.HasValue
                    && u.Longitude.HasValue)
                .ToListAsync();

            if (!availableDeliveryPersons.Any())
            {
                _logger.LogWarning("No available delivery persons for order {OrderId}", orderId);
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse(
                    "No delivery persons are currently available. The order will be assigned once someone becomes available.");
            }

            // Calculate distance from each delivery person to the pickup point
            var nearbyCandidates = availableDeliveryPersons
                .Select(dp => new
                {
                    DeliveryPerson = dp,
                    DistanceToPickup = _locationService.CalculateDistanceKm(
                        dp.Latitude!.Value, dp.Longitude!.Value,
                        pickupLat, pickupLon)
                })
                .Where(x => x.DistanceToPickup <= AssignmentRadiusKm)
                .OrderBy(x => x.DistanceToPickup)
                .ToList();

            if (!nearbyCandidates.Any())
            {
                _logger.LogWarning(
                    "No delivery persons within {Radius} km for order {OrderId}",
                    AssignmentRadiusKm, orderId);
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse(
                    $"No delivery persons available within {AssignmentRadiusKm:0} km of pickup location.");
            }

            double distanceToDelivery = 0;
            if (dropoffLat.HasValue && dropoffLon.HasValue)
            {
                distanceToDelivery = _locationService.CalculateDistanceKm(
                    pickupLat, pickupLon,
                    dropoffLat.Value, dropoffLon.Value);
            }

            var assignments = nearbyCandidates.Select(candidate => new DeliveryAssignment
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                DeliveryPersonId = candidate.DeliveryPerson.Id,
                Status = "Pending",
                DistanceToPickupKm = Math.Round(candidate.DistanceToPickup, 1),
                DistanceToDeliveryKm = Math.Round(distanceToDelivery, 1),
                TotalDistanceKm = Math.Round(candidate.DistanceToPickup + distanceToDelivery, 1),
                AssignedFromLatitude = candidate.DeliveryPerson.Latitude,
                AssignedFromLongitude = candidate.DeliveryPerson.Longitude,
                PickupLatitude = pickupLat,
                PickupLongitude = pickupLon,
                PickupAddress = pickupFarmer.FarmAddress ?? pickupFarmer.LocationAddress,
                DropoffLatitude = dropoffLat,
                DropoffLongitude = dropoffLon,
                DropoffAddress = $"{order.Address}, {order.City}",
                CreatedAt = DateTime.UtcNow
            }).ToList();

            // Final assignee will be set when one delivery person accepts
            order.DeliveryPersonId = null;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.DeliveryAssignments.AddRangeAsync(assignments);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Order {OrderId} broadcast to {Count} delivery persons within {Radius} km",
                orderId, assignments.Count, AssignmentRadiusKm);

            // Notify each nearby delivery person
            foreach (var candidate in nearbyCandidates)
            {
                await _notificationService.CreateNotificationAsync(
                    candidate.DeliveryPerson.Id,
                    "New Delivery Assignment! 🚚",
                    $"You have a new delivery for order #{order.OrderNumber}. Pickup is {candidate.DistanceToPickup:F1} km away.",
                    "order",
                    orderId.ToString(),
                    "DeliveryAssignment"
                );
            }

            var nearestAssignment = assignments.OrderBy(a => a.DistanceToPickupKm).First();
            var dto = await MapToAssignmentDto(nearestAssignment);
            return ApiResponse<DeliveryAssignmentDto>.SuccessResponse(dto, "Delivery assignment sent to nearby delivery partners");
        }

        // ─── Get my assignments ────────────────────────────────────
        public async Task<ApiResponse<List<DeliveryAssignmentDto>>> GetMyAssignmentsAsync(Guid deliveryPersonId, string? statusFilter = null)
        {
            await EnsureAssignmentsForConfirmedOrdersAsync();

            var query = _context.DeliveryAssignments
                .Include(da => da.Order)
                    .ThenInclude(o => o!.Items)
                .Include(da => da.Order)
                    .ThenInclude(o => o!.Consumer)
                .Where(da => da.DeliveryPersonId == deliveryPersonId);

            if (!string.IsNullOrEmpty(statusFilter))
            {
                query = query.Where(da => da.Status == statusFilter);
            }

            var assignments = await query
                .OrderByDescending(da => da.CreatedAt)
                .ToListAsync();

            var dtos = new List<DeliveryAssignmentDto>();
            foreach (var a in assignments)
            {
                dtos.Add(await MapToAssignmentDto(a));
            }

            return ApiResponse<List<DeliveryAssignmentDto>>.SuccessResponse(dtos);
        }

        // ─── Get single assignment ─────────────────────────────────
        public async Task<ApiResponse<DeliveryAssignmentDto>> GetAssignmentByIdAsync(Guid assignmentId, Guid deliveryPersonId)
        {
            var assignment = await _context.DeliveryAssignments
                .Include(da => da.Order)
                    .ThenInclude(o => o!.Items)
                .Include(da => da.Order)
                    .ThenInclude(o => o!.Consumer)
                .FirstOrDefaultAsync(da => da.Id == assignmentId && da.DeliveryPersonId == deliveryPersonId);

            if (assignment == null)
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse("Assignment not found");

            var dto = await MapToAssignmentDto(assignment);
            return ApiResponse<DeliveryAssignmentDto>.SuccessResponse(dto);
        }

        // ─── Update assignment status ──────────────────────────────
        public async Task<ApiResponse<DeliveryAssignmentDto>> UpdateAssignmentStatusAsync(
            Guid assignmentId, Guid deliveryPersonId, UpdateDeliveryStatusDto dto)
        {
            var assignment = await _context.DeliveryAssignments
                .Include(da => da.Order)
                    .ThenInclude(o => o!.Items)
                .Include(da => da.Order)
                    .ThenInclude(o => o!.Consumer)
                .FirstOrDefaultAsync(da => da.Id == assignmentId && da.DeliveryPersonId == deliveryPersonId);

            if (assignment == null)
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse("Assignment not found");

            var validStatuses = new[] { "Accepted", "PickedUp", "InTransit", "Delivered", "Rejected" };
            if (!validStatuses.Contains(dto.Status))
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse($"Invalid status. Must be one of: {string.Join(", ", validStatuses)}");

            // Validate state transitions
            var validTransition = (assignment.Status, dto.Status) switch
            {
                ("Pending", "Accepted") => true,
                ("Pending", "Rejected") => true,
                ("Accepted", "PickedUp") => true,
                ("PickedUp", "InTransit") => true,
                ("InTransit", "Delivered") => true,
                ("Accepted", "InTransit") => true, // Allow skip for simplicity
                _ => false
            };

            if (!validTransition)
                return ApiResponse<DeliveryAssignmentDto>.ErrorResponse(
                    $"Cannot transition from '{assignment.Status}' to '{dto.Status}'");

            if (dto.Status == "Accepted")
            {
                var alreadyTaken = await _context.DeliveryAssignments
                    .AnyAsync(da => da.OrderId == assignment.OrderId
                        && da.Id != assignmentId
                        && (da.Status == "Accepted" || da.Status == "PickedUp" || da.Status == "InTransit" || da.Status == "Delivered"));

                if (alreadyTaken)
                    return ApiResponse<DeliveryAssignmentDto>.ErrorResponse("This order has already been accepted by another delivery partner.");
            }

            assignment.Status = dto.Status;
            assignment.UpdatedAt = DateTime.UtcNow;

            switch (dto.Status)
            {
                case "Accepted":
                    assignment.AcceptedAt = DateTime.UtcNow;
                    if (assignment.Order != null)
                    {
                        assignment.Order.DeliveryPersonId = deliveryPersonId;
                        assignment.Order.UpdatedAt = DateTime.UtcNow;
                    }

                    var otherPendingAssignments = await _context.DeliveryAssignments
                        .Where(da => da.OrderId == assignment.OrderId && da.Id != assignment.Id && da.Status == "Pending")
                        .ToListAsync();

                    foreach (var otherAssignment in otherPendingAssignments)
                    {
                        otherAssignment.Status = "Rejected";
                        otherAssignment.RejectionReason = "Order accepted by another delivery partner";
                        otherAssignment.UpdatedAt = DateTime.UtcNow;

                        await _notificationService.CreateNotificationAsync(
                            otherAssignment.DeliveryPersonId,
                            "Assignment Closed",
                            $"Order #{assignment.Order?.OrderNumber ?? ""} was accepted by another delivery partner.",
                            "order",
                            assignment.OrderId.ToString(),
                            "DeliveryAssignment"
                        );
                    }
                    break;
                case "PickedUp":
                    assignment.PickedUpAt = DateTime.UtcNow;
                    // Update order status
                    if (assignment.Order != null)
                    {
                        assignment.Order.Status = "Shipped";
                        assignment.Order.UpdatedAt = DateTime.UtcNow;
                    }
                    break;
                case "Delivered":
                    assignment.DeliveredAt = DateTime.UtcNow;
                    if (assignment.Order != null)
                    {
                        assignment.Order.Status = "Delivered";
                        assignment.Order.UpdatedAt = DateTime.UtcNow;
                        // Mark all items as delivered
                        foreach (var item in assignment.Order.Items)
                        {
                            item.ItemStatus = "Delivered";
                        }
                    }
                    break;
                case "Rejected":
                    assignment.RejectionReason = dto.RejectionReason;
                    // Clear the delivery person from order so it can be reassigned
                    if (assignment.Order != null)
                    {
                        if (assignment.Order.DeliveryPersonId == deliveryPersonId)
                        {
                            assignment.Order.DeliveryPersonId = null;
                        }
                        assignment.Order.UpdatedAt = DateTime.UtcNow;
                    }
                    // Try to assign the next nearest delivery person
                    _logger.LogInformation("Delivery person {DpId} rejected order {OrderId}, attempting reassignment",
                        deliveryPersonId, assignment.OrderId);
                    break;
            }

            await _context.SaveChangesAsync();

            // Send notifications
            if (assignment.Order?.Consumer != null)
            {
                var (title, message) = dto.Status switch
                {
                    "Accepted" => ("Delivery Accepted! 🚚", "A delivery person has accepted your order and is heading to pick it up."),
                    "PickedUp" => ("Order Picked Up! 📦", "Your order has been picked up and is on its way to you."),
                    "InTransit" => ("On the Way! 🛵", "Your order is in transit and will arrive soon."),
                    "Delivered" => ("Delivered! ✅", "Your order has been delivered. Enjoy your fresh products!"),
                    _ => ("Delivery Update", $"Your delivery status has been updated to {dto.Status}.")
                };

                await _notificationService.CreateNotificationAsync(
                    assignment.Order.ConsumerId,
                    title, message, "order",
                    assignment.OrderId.ToString(), "Order");
            }

            // If rejected and no active assignments remain, try reassignment in background
            if (dto.Status == "Rejected")
            {
                var hasActiveAssignments = await _context.DeliveryAssignments.AnyAsync(da =>
                    da.OrderId == assignment.OrderId &&
                    (da.Status == "Pending" || da.Status == "Accepted" || da.Status == "PickedUp" || da.Status == "InTransit"));

                if (!hasActiveAssignments)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            using var scope = _logger.BeginScope("Reassignment for order {OrderId}", assignment.OrderId);
                            await AssignNearestDeliveryPersonAsync(assignment.OrderId);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to reassign order {OrderId}", assignment.OrderId);
                        }
                    });
                }
            }

            var resultDto = await MapToAssignmentDto(assignment);
            return ApiResponse<DeliveryAssignmentDto>.SuccessResponse(resultDto, $"Status updated to {dto.Status}");
        }

        // ─── Availability toggle ───────────────────────────────────
        public async Task<ApiResponse<object>> UpdateAvailabilityAsync(Guid deliveryPersonId, bool isAvailable)
        {
            var user = await _context.Users.FindAsync(deliveryPersonId);
            if (user == null || user.Role != UserRole.DeliveryPerson)
                return ApiResponse<object>.ErrorResponse("Delivery person not found");

            user.IsAvailableForDelivery = isAvailable;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Delivery person {Id} availability set to {Available}", deliveryPersonId, isAvailable);

            return ApiResponse<object>.SuccessResponse(new { IsAvailable = isAvailable },
                isAvailable ? "You are now available for deliveries" : "You are now offline");
        }

        // ─── Update live location ──────────────────────────────────
        public async Task<ApiResponse<object>> UpdateDeliveryPersonLocationAsync(Guid deliveryPersonId, UpdateLocationDto dto)
        {
            var user = await _context.Users.FindAsync(deliveryPersonId);
            if (user == null || user.Role != UserRole.DeliveryPerson)
                return ApiResponse<object>.ErrorResponse("Delivery person not found");

            user.Latitude = dto.Latitude;
            user.Longitude = dto.Longitude;
            user.LocationAddress = dto.LocationAddress;
            user.LastLocationUpdate = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return ApiResponse<object>.SuccessResponse(new
            {
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                LocationAddress = dto.LocationAddress
            }, "Location updated");
        }

        // ─── Dashboard stats ───────────────────────────────────────
        public async Task<ApiResponse<DeliveryDashboardStatsDto>> GetDashboardStatsAsync(Guid deliveryPersonId)
        {
            var user = await _context.Users.FindAsync(deliveryPersonId);
            if (user == null || user.Role != UserRole.DeliveryPerson)
                return ApiResponse<DeliveryDashboardStatsDto>.ErrorResponse("Delivery person not found");

            var assignments = await _context.DeliveryAssignments
                .Include(da => da.Order)
                .Where(da => da.DeliveryPersonId == deliveryPersonId)
                .ToListAsync();

            var today = DateTime.UtcNow.Date;
            var completed = assignments.Where(a => a.Status == "Delivered").ToList();
            var todayCompleted = completed.Where(a => a.DeliveredAt.HasValue && a.DeliveredAt.Value.Date == today).ToList();

            var stats = new DeliveryDashboardStatsDto
            {
                TotalAssignments = assignments.Count,
                PendingAssignments = assignments.Count(a => a.Status == "Pending"),
                ActiveDeliveries = assignments.Count(a => a.Status == "Accepted" || a.Status == "PickedUp" || a.Status == "InTransit"),
                CompletedDeliveries = completed.Count,
                RejectedAssignments = assignments.Count(a => a.Status == "Rejected"),
                TotalDistanceKm = completed
                    .Where(a => a.TotalDistanceKm.HasValue)
                    .Sum(a => a.TotalDistanceKm!.Value),
                TotalEarnings = completed
                    .Where(a => a.Order != null)
                    .Sum(a => (double)a.Order!.DeliveryFee),
                TodayDeliveries = todayCompleted.Count,
                TodayEarnings = todayCompleted
                    .Where(a => a.Order != null)
                    .Sum(a => (double)a.Order!.DeliveryFee),
                IsAvailable = user.IsAvailableForDelivery,
                CurrentLatitude = user.Latitude,
                CurrentLongitude = user.Longitude,
                CurrentAddress = user.LocationAddress
            };

            return ApiResponse<DeliveryDashboardStatsDto>.SuccessResponse(stats);
        }

        // ─── Profile ───────────────────────────────────────────────
        public async Task<ApiResponse<DeliveryPersonProfileDto>> GetProfileAsync(Guid deliveryPersonId)
        {
            var user = await _context.Users.FindAsync(deliveryPersonId);
            if (user == null || user.Role != UserRole.DeliveryPerson)
                return ApiResponse<DeliveryPersonProfileDto>.ErrorResponse("Delivery person not found");

            var profile = new DeliveryPersonProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                VehicleType = user.VehicleType,
                VehicleNumber = user.VehicleNumber,
                IsAvailable = user.IsAvailableForDelivery,
                Latitude = user.Latitude,
                Longitude = user.Longitude,
                LocationAddress = user.LocationAddress,
                CreatedAt = user.CreatedAt
            };

            return ApiResponse<DeliveryPersonProfileDto>.SuccessResponse(profile);
        }

        private async Task EnsureAssignmentsForConfirmedOrdersAsync()
        {
            var confirmedOrderIdsWithoutActiveAssignments = await _context.Orders
                .Where(o => o.Status == "Confirmed")
                .Where(o => !_context.DeliveryAssignments.Any(da => da.OrderId == o.Id && da.Status != "Rejected"))
                .Select(o => o.Id)
                .ToListAsync();

            if (!confirmedOrderIdsWithoutActiveAssignments.Any())
                return;

            foreach (var orderId in confirmedOrderIdsWithoutActiveAssignments)
            {
                try
                {
                    await AssignNearestDeliveryPersonAsync(orderId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to backfill assignment for confirmed order {OrderId}", orderId);
                }
            }
        }

        // ─── Mapping helper ────────────────────────────────────────
        private async Task<DeliveryAssignmentDto> MapToAssignmentDto(DeliveryAssignment assignment)
        {
            var order = assignment.Order;
            if (order == null)
            {
                order = await _context.Orders
                    .Include(o => o.Items)
                    .Include(o => o.Consumer)
                    .FirstOrDefaultAsync(o => o.Id == assignment.OrderId);
            }

            // Get farmer info for pickup
            string? farmerName = null;
            string? farmerPhone = null;
            if (order?.Items.Any() == true)
            {
                var farmerId = order.Items.First().FarmerId;
                var farmer = await _context.Users.FindAsync(farmerId);
                farmerName = farmer?.FarmName ?? farmer?.Username;
                farmerPhone = farmer?.PhoneNumber;
            }

            return new DeliveryAssignmentDto
            {
                Id = assignment.Id.ToString(),
                OrderId = assignment.OrderId.ToString(),
                OrderNumber = order?.OrderNumber ?? "",
                Status = assignment.Status,
                PickupLatitude = assignment.PickupLatitude,
                PickupLongitude = assignment.PickupLongitude,
                PickupAddress = assignment.PickupAddress,
                FarmerName = farmerName,
                FarmerPhone = farmerPhone,
                DropoffLatitude = assignment.DropoffLatitude,
                DropoffLongitude = assignment.DropoffLongitude,
                DropoffAddress = assignment.DropoffAddress,
                ConsumerName = order?.FullName,
                ConsumerPhone = order?.Phone,
                DistanceToPickupKm = assignment.DistanceToPickupKm,
                DistanceToDeliveryKm = assignment.DistanceToDeliveryKm,
                TotalDistanceKm = assignment.TotalDistanceKm,
                OrderTotal = order?.Total ?? 0,
                PaymentMethod = order?.PaymentMethod ?? "",
                ItemCount = order?.Items.Count ?? 0,
                Items = order?.Items.Select(i => new DeliveryOrderItemDto
                {
                    ProductName = i.ProductName,
                    ProductImageUrl = i.ProductImageUrl,
                    Quantity = i.Quantity,
                    Unit = i.Unit
                }).ToList() ?? new(),
                CreatedAt = assignment.CreatedAt,
                AcceptedAt = assignment.AcceptedAt,
                PickedUpAt = assignment.PickedUpAt,
                DeliveredAt = assignment.DeliveredAt
            };
        }
    }
}
