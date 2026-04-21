using FarmerConsumerAPI.Models.DTOs;

namespace FarmerConsumerAPI.Services
{
    public interface IDeliveryPersonService
    {
        /// <summary>
        /// Find the nearest available delivery person to a given location and assign the order.
        /// Called automatically when a farmer accepts all items in an order.
        /// </summary>
        Task<ApiResponse<DeliveryAssignmentDto>> AssignNearestDeliveryPersonAsync(Guid orderId);

        /// <summary>
        /// Get all delivery assignments for a delivery person
        /// </summary>
        Task<ApiResponse<List<DeliveryAssignmentDto>>> GetMyAssignmentsAsync(Guid deliveryPersonId, string? statusFilter = null);

        /// <summary>
        /// Get a single delivery assignment by ID
        /// </summary>
        Task<ApiResponse<DeliveryAssignmentDto>> GetAssignmentByIdAsync(Guid assignmentId, Guid deliveryPersonId);

        /// <summary>
        /// Update the status of a delivery assignment (Accept, PickedUp, InTransit, Delivered, Reject)
        /// </summary>
        Task<ApiResponse<DeliveryAssignmentDto>> UpdateAssignmentStatusAsync(Guid assignmentId, Guid deliveryPersonId, UpdateDeliveryStatusDto dto);

        /// <summary>
        /// Toggle delivery person availability
        /// </summary>
        Task<ApiResponse<object>> UpdateAvailabilityAsync(Guid deliveryPersonId, bool isAvailable);

        /// <summary>
        /// Update delivery person live location
        /// </summary>
        Task<ApiResponse<object>> UpdateDeliveryPersonLocationAsync(Guid deliveryPersonId, UpdateLocationDto dto);

        /// <summary>
        /// Get dashboard stats for a delivery person
        /// </summary>
        Task<ApiResponse<DeliveryDashboardStatsDto>> GetDashboardStatsAsync(Guid deliveryPersonId);

        /// <summary>
        /// Get delivery person profile
        /// </summary>
        Task<ApiResponse<DeliveryPersonProfileDto>> GetProfileAsync(Guid deliveryPersonId);
    }
}
