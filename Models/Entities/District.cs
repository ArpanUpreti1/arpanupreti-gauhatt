namespace FarmerConsumerAPI.Models.Entities
{
    public class District
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Province { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
