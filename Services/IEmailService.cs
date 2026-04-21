namespace FarmerConsumerAPI.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string username, string otp);
        Task SendWelcomeEmailAsync(string email, string username);
        Task SendFarmerApprovalEmailAsync(string email, string username);
        Task SendFarmerRejectionEmailAsync(string email, string username, string reason);
        Task SendNewOrderNotificationAsync(string farmerEmail, string farmerName, string orderNumber, 
            string consumerName, List<OrderItemInfo> items, decimal total, string deliveryAddress);
        Task SendOrderStatusUpdateAsync(string consumerEmail, string consumerName, string orderNumber,
            string productName, string farmerName, string newStatus);
    }
    
    public class OrderItemInfo
    {
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal Subtotal { get; set; }
    }
}
