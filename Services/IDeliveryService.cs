namespace FarmerConsumerAPI.Services
{
    public interface IDeliveryService
    {
        /// <summary>
        /// Calculate delivery fee based on distance using the pricing rule:
        /// Every 10 km = NPR 50 (rounded up to nearest 10km)
        /// </summary>
        /// <param name="distanceKm">Distance in kilometers</param>
        /// <returns>Delivery fee in NPR</returns>
        decimal CalculateDeliveryFee(double distanceKm);

        /// <summary>
        /// Check if delivery is possible (within 100km limit)
        /// </summary>
        /// <param name="distanceKm">Distance in kilometers</param>
        /// <returns>True if delivery is possible</returns>
        bool IsDeliveryPossible(double distanceKm);

        /// <summary>
        /// Get the maximum delivery distance allowed
        /// </summary>
        int MaxDeliveryDistanceKm { get; }

        /// <summary>
        /// Get the base rate per 10km
        /// </summary>
        decimal BaseRatePer10Km { get; }
    }
}
