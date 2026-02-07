namespace FarmerConsumerAPI.Services
{
    public class DeliveryService : IDeliveryService
    {
        private readonly ILogger<DeliveryService> _logger;
        
        // Pricing constants
        public int MaxDeliveryDistanceKm => 100;
        public decimal BaseRatePer10Km => 50m; // NPR 50 per 10km

        public DeliveryService(ILogger<DeliveryService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Calculate delivery fee based on distance.
        /// Pricing rule: Every 10 km = NPR 50 (rounded up to nearest 10km)
        /// Examples:
        /// - 1-10 km → NPR 50
        /// - 11-20 km → NPR 100
        /// - 21-30 km → NPR 150
        /// - 95-100 km → NPR 500
        /// </summary>
        public decimal CalculateDeliveryFee(double distanceKm)
        {
            if (distanceKm <= 0)
            {
                return 0;
            }

            if (!IsDeliveryPossible(distanceKm))
            {
                _logger.LogWarning("Delivery not possible for distance: {Distance} km", distanceKm);
                return -1; // Indicates delivery not possible
            }

            // Round up to nearest 10km
            int roundedDistance = (int)Math.Ceiling(distanceKm / 10.0) * 10;
            
            // Calculate fee: (roundedDistance / 10) * 50
            decimal fee = (roundedDistance / 10) * BaseRatePer10Km;

            _logger.LogDebug(
                "Delivery fee calculated: Distance={Distance}km, RoundedTo={Rounded}km, Fee=NPR{Fee}",
                distanceKm, roundedDistance, fee);

            return fee;
        }

        /// <summary>
        /// Check if delivery is possible within the maximum distance limit
        /// </summary>
        public bool IsDeliveryPossible(double distanceKm)
        {
            return distanceKm > 0 && distanceKm <= MaxDeliveryDistanceKm;
        }
    }
}
