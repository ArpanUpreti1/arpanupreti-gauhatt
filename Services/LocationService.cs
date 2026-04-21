namespace FarmerConsumerAPI.Services
{
    public interface ILocationService
    {
        double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2);
        
        bool CanDeliver(double distanceKm, int maxDistanceKm = 40);
    }

    public class LocationService : ILocationService
    {
        private const double EarthRadiusKm = 6371.0;
        private readonly ILogger<LocationService> _logger;

        public LocationService(ILogger<LocationService> logger)
        {
            _logger = logger;
        }

     
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

        public bool CanDeliver(double distanceKm, int maxDistanceKm = 40)
        {
            return distanceKm <= maxDistanceKm;
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}
