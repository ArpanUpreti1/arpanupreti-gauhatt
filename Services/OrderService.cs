using FarmerConsumerAPI.Data;
using FarmerConsumerAPI.Models.DTOs;
using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            ApplicationDbContext context,
            IEmailService emailService,
            INotificationService notificationService,
            ILogger<OrderService> logger)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<ApiResponse<OrderResponseDto>> CreateOrderAsync(Guid consumerId, CreateOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var consumer = await _context.Users.FindAsync(consumerId);
                if (consumer == null)
                {
                    return ApiResponse<OrderResponseDto>.ErrorResponse("Consumer not found");
                }

                // Generate unique order number
                var orderNumber = "GH" + DateTime.UtcNow.ToString("yyyyMMdd") + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    OrderNumber = orderNumber,
                    ConsumerId = consumerId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Pending",
                    Subtotal = dto.Subtotal,
                    DeliveryFee = dto.DeliveryFee,
                    Total = dto.Total,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentStatus = "Pending",
                    FullName = dto.DeliveryAddress.FullName,
                    Phone = dto.DeliveryAddress.Phone,
                    Address = dto.DeliveryAddress.Address,
                    City = dto.DeliveryAddress.City,
                    Landmark = dto.DeliveryAddress.Landmark,
                    Notes = dto.DeliveryAddress.Notes,
                    Latitude = dto.DeliveryAddress.Latitude,
                    Longitude = dto.DeliveryAddress.Longitude,
                    CreatedAt = DateTime.UtcNow
                };

                // Group items by farmer for notification
                var itemsByFarmer = new Dictionary<Guid, List<OrderItem>>();

                foreach (var itemDto in dto.Items)
                {
                    if (!Guid.TryParse(itemDto.ProductId, out var productId))
                    {
                        _logger.LogWarning("Invalid ProductId: {ProductId}", itemDto.ProductId);
                        continue;
                    }
                    
                    if (!Guid.TryParse(itemDto.FarmerId, out var farmerId))
                    {
                        _logger.LogWarning("Invalid FarmerId: {FarmerId} for product {ProductId}", itemDto.FarmerId, itemDto.ProductId);
                        continue;
                    }

                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        ProductId = productId,
                        FarmerId = farmerId,
                        ProductName = itemDto.Name,
                        ProductImageUrl = itemDto.ImageUrl,
                        FarmName = itemDto.FarmName,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.Price,
                        Unit = itemDto.Unit,
                        Subtotal = itemDto.Price * itemDto.Quantity,
                        DeliveryFee = itemDto.DeliveryFee ?? 0,
                        DistanceKm = itemDto.DistanceKm,
                        ItemStatus = "Pending",
                        CreatedAt = DateTime.UtcNow
                    };

                    order.Items.Add(orderItem);

                    if (!itemsByFarmer.ContainsKey(farmerId))
                    {
                        itemsByFarmer[farmerId] = new List<OrderItem>();
                    }
                    itemsByFarmer[farmerId].Add(orderItem);
                }

                // Validate that we have at least one item
                if (!order.Items.Any())
                {
                    _logger.LogError("No valid items in order for consumer {ConsumerId}", consumerId);
                    return ApiResponse<OrderResponseDto>.ErrorResponse("No valid items in the order. Please check your cart.");
                }

                _logger.LogInformation("Creating order {OrderNumber} with {ItemCount} items for consumer {ConsumerId}", 
                    orderNumber, order.Items.Count, consumerId);

                await _context.Orders.AddAsync(order);
                await _context.SaveChangesAsync();

                // Send notifications to each farmer
                foreach (var farmerGroup in itemsByFarmer)
                {
                    var farmer = await _context.Users.FindAsync(farmerGroup.Key);
                    if (farmer != null)
                    {
                        var farmerItems = farmerGroup.Value.Select(i => new OrderItemInfo
                        {
                            ProductName = i.ProductName,
                            Quantity = i.Quantity,
                            Unit = i.Unit,
                            Price = i.UnitPrice,
                            Subtotal = i.Subtotal
                        }).ToList();

                        var farmerTotal = farmerGroup.Value.Sum(i => i.Subtotal + i.DeliveryFee);
                        var deliveryAddress = $"{dto.DeliveryAddress.FullName}\n{dto.DeliveryAddress.Phone}\n{dto.DeliveryAddress.Address}\n{dto.DeliveryAddress.City}";
                        if (!string.IsNullOrEmpty(dto.DeliveryAddress.Landmark))
                        {
                            deliveryAddress += $"\nLandmark: {dto.DeliveryAddress.Landmark}";
                        }

                        // Send email notification to farmer
                        await _emailService.SendNewOrderNotificationAsync(
                            farmer.Email,
                            farmer.FarmName ?? farmer.Username,
                            orderNumber,
                            dto.DeliveryAddress.FullName,
                            farmerItems,
                            farmerTotal,
                            deliveryAddress
                        );

                        _logger.LogInformation("Order notification sent to farmer {FarmerId} for order {OrderNumber}", 
                            farmer.Id, orderNumber);
                    }
                }

                await transaction.CommitAsync();

                var response = MapToOrderResponseDto(order, consumer.Username);
                return ApiResponse<OrderResponseDto>.SuccessResponse(response, "Order placed successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating order for consumer {ConsumerId}", consumerId);
                return ApiResponse<OrderResponseDto>.ErrorResponse("Failed to create order");
            }
        }

        public async Task<ApiResponse<List<OrderResponseDto>>> GetConsumerOrdersAsync(Guid consumerId)
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Consumer)
                .Where(o => o.ConsumerId == consumerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var response = orders.Select(o => MapToOrderResponseDto(o, o.Consumer?.Username ?? "")).ToList();
            return ApiResponse<List<OrderResponseDto>>.SuccessResponse(response);
        }

        public async Task<ApiResponse<List<FarmerOrderDto>>> GetFarmerOrdersAsync(Guid farmerId)
        {
            // Get all order items for this farmer
            var farmerOrderItems = await _context.OrderItems
                .Include(oi => oi.Order)
                    .ThenInclude(o => o!.Consumer)
                .Where(oi => oi.FarmerId == farmerId)
                .OrderByDescending(oi => oi.CreatedAt)
                .ToListAsync();

            // Group by order
            var orderGroups = farmerOrderItems
                .GroupBy(oi => oi.OrderId)
                .Select(g => new FarmerOrderDto
                {
                    OrderId = g.Key.ToString(),
                    OrderNumber = g.First().Order?.OrderNumber ?? "",
                    ConsumerName = g.First().Order?.FullName ?? "",
                    ConsumerPhone = g.First().Order?.Phone ?? "",
                    OrderDate = g.First().Order?.OrderDate ?? DateTime.UtcNow,
                    OrderStatus = g.First().Order?.Status ?? "Pending",
                    DeliveryAddress = new DeliveryAddressDto
                    {
                        FullName = g.First().Order?.FullName ?? "",
                        Phone = g.First().Order?.Phone ?? "",
                        Address = g.First().Order?.Address ?? "",
                        City = g.First().Order?.City ?? "",
                        Landmark = g.First().Order?.Landmark,
                        Notes = g.First().Order?.Notes,
                        Latitude = g.First().Order?.Latitude,
                        Longitude = g.First().Order?.Longitude
                    },
                    Items = g.Select(i => new FarmerOrderItemDto
                    {
                        Id = i.Id.ToString(),
                        ProductId = i.ProductId.ToString(),
                        ProductName = i.ProductName,
                        ProductImageUrl = i.ProductImageUrl,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        Unit = i.Unit,
                        Subtotal = i.Subtotal,
                        ItemStatus = i.ItemStatus
                    }).ToList(),
                    ItemsSubtotal = g.Sum(i => i.Subtotal),
                    DeliveryFee = g.Sum(i => i.DeliveryFee),
                    Total = g.Sum(i => i.Subtotal + i.DeliveryFee),
                    DistanceKm = g.First().DistanceKm
                })
                .ToList();

            return ApiResponse<List<FarmerOrderDto>>.SuccessResponse(orderGroups);
        }

        public async Task<ApiResponse<OrderResponseDto>> GetOrderByIdAsync(Guid orderId, Guid userId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Consumer)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return ApiResponse<OrderResponseDto>.ErrorResponse("Order not found");
            }

            // Check if user is the consumer or a farmer with items in this order
            if (order.ConsumerId != userId)
            {
                var hasFarmerItems = order.Items.Any(i => i.FarmerId == userId);
                if (!hasFarmerItems)
                {
                    return ApiResponse<OrderResponseDto>.ErrorResponse("Unauthorized to view this order");
                }
            }

            var response = MapToOrderResponseDto(order, order.Consumer?.Username ?? "");
            return ApiResponse<OrderResponseDto>.SuccessResponse(response);
        }

        public async Task<ApiResponse<object>> UpdateOrderStatusAsync(Guid orderId, Guid userId, UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return ApiResponse<object>.ErrorResponse("Order not found");
            }

            // Check if user is the consumer or admin
            var user = await _context.Users.FindAsync(userId);
            if (user == null || (order.ConsumerId != userId && user.Role != UserRole.Admin))
            {
                return ApiResponse<object>.ErrorResponse("Unauthorized to update this order");
            }

            var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
            if (!validStatuses.Contains(dto.Status))
            {
                return ApiResponse<object>.ErrorResponse("Invalid order status");
            }

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse<object>.SuccessResponse(new { order.Status }, "Order status updated");
        }

        public async Task<ApiResponse<object>> UpdateOrderItemStatusAsync(Guid orderItemId, Guid farmerId, UpdateOrderItemStatusDto dto)
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Order)
                    .ThenInclude(o => o!.Consumer)
                .Include(oi => oi.Farmer)
                .FirstOrDefaultAsync(oi => oi.Id == orderItemId);

            if (orderItem == null)
            {
                return ApiResponse<object>.ErrorResponse("Order item not found");
            }

            if (orderItem.FarmerId != farmerId)
            {
                return ApiResponse<object>.ErrorResponse("Unauthorized to update this order item");
            }

            var validStatuses = new[] { "Pending", "Accepted", "Rejected", "Shipped", "Delivered" };
            if (!validStatuses.Contains(dto.ItemStatus))
            {
                return ApiResponse<object>.ErrorResponse("Invalid item status");
            }

            orderItem.ItemStatus = dto.ItemStatus;

            // If all items in an order are accepted, update order status
            var order = orderItem.Order;
            if (order != null)
            {
                var allItems = await _context.OrderItems.Where(oi => oi.OrderId == order.Id).ToListAsync();
                
                if (allItems.All(i => i.ItemStatus == "Accepted"))
                {
                    order.Status = "Confirmed";
                }
                else if (allItems.All(i => i.ItemStatus == "Shipped"))
                {
                    order.Status = "Shipped";
                }
                else if (allItems.All(i => i.ItemStatus == "Delivered"))
                {
                    order.Status = "Delivered";
                }

                order.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Send notification to consumer about status update
            if (order?.Consumer != null)
            {
                var farmerName = orderItem.Farmer?.FarmName ?? orderItem.Farmer?.Username ?? orderItem.FarmName ?? "Farmer";
                
                // Create in-app notification
                var (notifTitle, notifMessage) = dto.ItemStatus switch
                {
                    "Accepted" => ("Order Confirmed! ✅", $"Great news! {farmerName} has accepted your order for {orderItem.ProductName}."),
                    "Rejected" => ("Order Update ❌", $"{farmerName} was unable to fulfill your order for {orderItem.ProductName}."),
                    "Shipped" => ("Order Shipped! 🚚", $"Your {orderItem.ProductName} from {farmerName} is on its way!"),
                    "Delivered" => ("Order Delivered! 📦", $"Your {orderItem.ProductName} from {farmerName} has been delivered. Enjoy!"),
                    _ => ("Order Status Update", $"Your order for {orderItem.ProductName} status has been updated to {dto.ItemStatus}.")
                };

                try
                {
                    // Create in-app notification
                    await _notificationService.CreateNotificationAsync(
                        order.ConsumerId,
                        notifTitle,
                        notifMessage,
                        "order",
                        order.Id.ToString(),
                        "Order"
                    );

                    // Send email notification
                    await _emailService.SendOrderStatusUpdateAsync(
                        order.Consumer.Email,
                        order.Consumer.Username,
                        order.OrderNumber,
                        orderItem.ProductName,
                        farmerName,
                        dto.ItemStatus
                    );
                    _logger.LogInformation("Order status notification sent to consumer {ConsumerId} for order {OrderNumber}", 
                        order.ConsumerId, order.OrderNumber);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send order status notification to consumer {ConsumerId}", order.ConsumerId);
                    // Don't fail the status update if notification fails
                }
            }

            return ApiResponse<object>.SuccessResponse(new { orderItem.ItemStatus }, "Item status updated");
        }

        private OrderResponseDto MapToOrderResponseDto(Order order, string consumerName)
        {
            return new OrderResponseDto
            {
                Id = order.Id.ToString(),
                OrderNumber = order.OrderNumber,
                ConsumerId = order.ConsumerId.ToString(),
                ConsumerName = consumerName,
                OrderDate = order.OrderDate,
                Status = order.Status,
                Subtotal = order.Subtotal,
                DeliveryFee = order.DeliveryFee,
                Total = order.Total,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                DeliveryAddress = new DeliveryAddressDto
                {
                    FullName = order.FullName,
                    Phone = order.Phone,
                    Address = order.Address,
                    City = order.City,
                    Landmark = order.Landmark,
                    Notes = order.Notes,
                    Latitude = order.Latitude,
                    Longitude = order.Longitude
                },
                Items = order.Items.Select(i => new OrderItemResponseDto
                {
                    Id = i.Id.ToString(),
                    ProductId = i.ProductId.ToString(),
                    ProductName = i.ProductName,
                    ProductImageUrl = i.ProductImageUrl,
                    FarmerId = i.FarmerId.ToString(),
                    FarmName = i.FarmName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Unit = i.Unit,
                    Subtotal = i.Subtotal,
                    DeliveryFee = i.DeliveryFee,
                    DistanceKm = i.DistanceKm,
                    ItemStatus = i.ItemStatus
                }).ToList()
            };
        }
    }
}
