namespace FarmerConsumerAPI.Services
{
    public interface ILocationService
    {
        /// <summary>
        /// Calculate the distance between two coordinates using Haversine formula
        /// </summary>
        /// <param name="lat1">Latitude of first point</param>
        /// <param name="lon1">Longitude of first point</param>
        /// <param name="lat2">Latitude of second point</param>
        /// <param name="lon2">Longitude of second point</param>
        /// <returns>Distance in kilometers</returns>
        double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2);
        
        /// <summary>
        /// Check if a delivery is possible based on distance
        /// </summary>
        /// <param name="distanceKm">Distance in kilometers</param>
        /// <param name="maxDistanceKm">Maximum allowed distance (default 100km)</param>
        /// <returns>True if delivery is possible</returns>
        bool CanDeliver(double distanceKm, int maxDistanceKm = 100);
    }

    public class LocationService : ILocationService
    {
        private const double EarthRadiusKm = 6371.0;
        private readonly ILogger<LocationService> _logger;

        public LocationService(ILogger<LocationService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Calculate the distance between two coordinates using the Haversine formula
        /// </summary>
        public double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            try
            {
                // Convert to radians
                var lat1Rad = DegreesToRadians(lat1);
                var lon1Rad = DegreesToRadians(lon1);
                var lat2Rad = DegreesToRadians(lat2);
                var lon2Rad = DegreesToRadians(lon2);

                // Haversine formula
                var dLat = lat2Rad - lat1Rad;
                var dLon = lon2Rad - lon1Rad;

                var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                        Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                        Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

                var distance = EarthRadiusKm * c;

                _logger.LogDebug(
                    "Distance calculated: ({Lat1}, {Lon1}) to ({Lat2}, {Lon2}) = {Distance} km",
                    lat1, lon1, lat2, lon2, distance);

                return Math.Round(distance, 1);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating distance");
                return double.MaxValue;
            }
        }

        public bool CanDeliver(double distanceKm, int maxDistanceKm = 100)
        {
            return distanceKm <= maxDistanceKm;
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}
