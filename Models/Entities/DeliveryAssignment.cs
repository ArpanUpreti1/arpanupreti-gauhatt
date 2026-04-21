using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmerConsumerAPI.Models.Entities
{
    public class DeliveryAssignment
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid OrderId { get; set; }

        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        [Required]
        public Guid DeliveryPersonId { get; set; }

        [ForeignKey("DeliveryPersonId")]
        public User? DeliveryPerson { get; set; }

        /// <summary>
        /// Pending, Accepted, PickedUp, InTransit, Delivered, Rejected
        /// </summary>
        public string Status { get; set; } = "Pending";

        /// <summary>
        /// Distance in km from delivery person to farmer (pickup point)
        /// </summary>
        public double? DistanceToPickupKm { get; set; }

        /// <summary>
        /// Distance in km from farmer to consumer (delivery point)
        /// </summary>
        public double? DistanceToDeliveryKm { get; set; }

        /// <summary>
        /// Total estimated distance for the assignment
        /// </summary>
        public double? TotalDistanceKm { get; set; }

        /// <summary>
        /// Snapshot of delivery person location when assigned
        /// </summary>
        public double? AssignedFromLatitude { get; set; }
        public double? AssignedFromLongitude { get; set; }

        /// <summary>
        /// Pickup location (farmer)
        /// </summary>
        public double? PickupLatitude { get; set; }
        public double? PickupLongitude { get; set; }
        public string? PickupAddress { get; set; }

        /// <summary>
        /// Drop-off location (consumer)
        /// </summary>
        public double? DropoffLatitude { get; set; }
        public double? DropoffLongitude { get; set; }
        public string? DropoffAddress { get; set; }

        public string? RejectionReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AcceptedAt { get; set; }
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
