using System.Net;
using System.Net.Mail;

namespace FarmerConsumerAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendVerificationEmailAsync(string email, string username, string otp)
        {
            // For testing purposes, log the OTP
            _logger.LogInformation("OTP for {Email}: {OTP}", email, otp);

            var subject = "Verify Your Email - Farmer Consumer Platform";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #2c7744;'>Welcome to Farmer Consumer Platform!</h2>
                        <p>Hello {username},</p>
                        <p>Thank you for registering with us. Please use the verification code below to verify your email address:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <span style='background-color: #f0f0f0; color: #2c7744; padding: 15px 30px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; border: 1px solid #ddd;'>{otp}</span>
                        </div>
                        <p>This code will expire in 15 minutes.</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='color: #888; font-size: 12px;'>If you didn't create an account, please ignore this email.</p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string email, string username)
        {
            var subject = "Welcome to Farmer Consumer Platform!";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #2c7744;'>Welcome, {username}!</h2>
                        <p>Your email has been verified successfully.</p>
                        <p>You can now sign in and start using the Farmer Consumer Platform.</p>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='color: #888; font-size: 12px;'>Thank you for joining us!</p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendFarmerApprovalEmailAsync(string email, string username)
        {
            var subject = "Your Farmer Account Has Been Approved! - Farmer Consumer Platform";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #2c7744;'>🎉 Congratulations, {username}!</h2>
                        <p>Great news! Your farmer registration has been <strong style='color: #2c7744;'>approved</strong> by our admin team.</p>
                        <p>You can now sign in to the Farmer Consumer Platform and start:</p>
                        <ul>
                            <li>Listing your farm products</li>
                            <li>Connecting with consumers directly</li>
                            <li>Managing your farm profile</li>
                        </ul>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='#' style='background-color: #2c7744; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Sign In Now</a>
                        </div>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='color: #888; font-size: 12px;'>Thank you for joining the Farmer Consumer Platform!</p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendFarmerRejectionEmailAsync(string email, string username, string reason)
        {
            var subject = "Update on Your Farmer Registration - Farmer Consumer Platform";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #c0392b;'>Registration Update</h2>
                        <p>Hello {username},</p>
                        <p>We regret to inform you that your farmer registration has been <strong style='color: #c0392b;'>not approved</strong> at this time.</p>
                        <div style='background-color: #fdf2f2; border-left: 4px solid #c0392b; padding: 15px; margin: 20px 0;'>
                            <p style='margin: 0;'><strong>Reason:</strong> {reason}</p>
                        </div>
                        <p>If you believe this was a mistake or would like to provide additional information, please:</p>
                        <ul>
                            <li>Contact our support team</li>
                            <li>Register again with valid and complete details</li>
                        </ul>
                        <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                        <p style='color: #888; font-size: 12px;'>If you have any questions, please reach out to our support team.</p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendNewOrderNotificationAsync(string farmerEmail, string farmerName, string orderNumber,
            string consumerName, List<OrderItemInfo> items, decimal total, string deliveryAddress)
        {
            _logger.LogInformation("Sending order notification to farmer: {Email}, Order: {OrderNumber}", farmerEmail, orderNumber);
            
            var itemsHtml = string.Join("", items.Select(item => $@"
                <tr>
                    <td style='padding: 12px; border-bottom: 1px solid #eee;'>{item.ProductName}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: center;'>{item.Quantity} {item.Unit}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right;'>NPR {item.Price}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right;'>NPR {item.Subtotal}</td>
                </tr>"));

            var subject = $"🛒 New Order Received! - Order #{orderNumber}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                            <h2 style='color: #2c7744; margin-top: 0;'>🎉 New Order Received!</h2>
                            <p>Hello <strong>{farmerName}</strong>,</p>
                            <p>Great news! You have received a new order from <strong>{consumerName}</strong>.</p>
                            
                            <div style='background-color: #f0f9f0; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; font-size: 14px; color: #666;'>Order Number</p>
                                <p style='margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2c7744;'>#{orderNumber}</p>
                            </div>
                            
                            <h3 style='color: #333; border-bottom: 2px solid #2c7744; padding-bottom: 10px;'>Order Details</h3>
                            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                                <thead>
                                    <tr style='background-color: #f5f5f5;'>
                                        <th style='padding: 12px; text-align: left; border-bottom: 2px solid #ddd;'>Product</th>
                                        <th style='padding: 12px; text-align: center; border-bottom: 2px solid #ddd;'>Quantity</th>
                                        <th style='padding: 12px; text-align: right; border-bottom: 2px solid #ddd;'>Price</th>
                                        <th style='padding: 12px; text-align: right; border-bottom: 2px solid #ddd;'>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr style='background-color: #f0f9f0;'>
                                        <td colspan='3' style='padding: 12px; text-align: right; font-weight: bold;'>Total:</td>
                                        <td style='padding: 12px; text-align: right; font-weight: bold; color: #2c7744;'>NPR {total}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            
                            <h3 style='color: #333; border-bottom: 2px solid #2c7744; padding-bottom: 10px;'>Delivery Address</h3>
                            <div style='background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin-bottom: 20px;'>
                                <p style='margin: 0; white-space: pre-line;'>{deliveryAddress}</p>
                            </div>
                            
                            <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #856404;'><strong>⚠️ Action Required:</strong> Please log in to your dashboard to accept or manage this order.</p>
                            </div>
                            
                            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                            <p style='color: #888; font-size: 12px; text-align: center;'>
                                This notification was sent from GAUHATT Farmer Consumer Platform.<br>
                                Do not reply to this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(farmerEmail, subject, body);
        }

        public async Task SendOrderStatusUpdateAsync(string consumerEmail, string consumerName, string orderNumber,
            string productName, string farmerName, string newStatus)
        {
            _logger.LogInformation("Sending order status update to consumer: {Email}, Order: {OrderNumber}, Status: {Status}", 
                consumerEmail, orderNumber, newStatus);

            var (statusIcon, statusColor, statusMessage) = newStatus switch
            {
                "Accepted" => ("✅", "#2c7744", "Your order has been accepted by the farmer and is being prepared!"),
                "Rejected" => ("❌", "#c0392b", "Unfortunately, the farmer was unable to fulfill this item."),
                "Shipped" => ("🚚", "#3498db", "Your order is on its way! It will be delivered soon."),
                "Delivered" => ("📦", "#27ae60", "Your order has been delivered. Enjoy your fresh produce!"),
                _ => ("📋", "#666666", $"Your order status has been updated to: {newStatus}")
            };

            var subject = $"{statusIcon} Order Update - {productName} is {newStatus}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <div style='background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                            <h2 style='color: {statusColor}; margin-top: 0;'>{statusIcon} Order Status Update</h2>
                            <p>Hello <strong>{consumerName}</strong>,</p>
                            <p>{statusMessage}</p>
                            
                            <div style='background-color: #f0f9f0; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; font-size: 14px; color: #666;'>Order Number</p>
                                <p style='margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2c7744;'>#{orderNumber}</p>
                            </div>
                            
                            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                                <tr>
                                    <td style='padding: 12px; background-color: #f5f5f5; border-radius: 8px 0 0 8px;'>
                                        <strong>Product:</strong>
                                    </td>
                                    <td style='padding: 12px; background-color: #f5f5f5; border-radius: 0 8px 8px 0;'>
                                        {productName}
                                    </td>
                                </tr>
                                <tr><td colspan='2' style='padding: 4px;'></td></tr>
                                <tr>
                                    <td style='padding: 12px; background-color: #f5f5f5; border-radius: 8px 0 0 8px;'>
                                        <strong>Farm:</strong>
                                    </td>
                                    <td style='padding: 12px; background-color: #f5f5f5; border-radius: 0 8px 8px 0;'>
                                        {farmerName}
                                    </td>
                                </tr>
                                <tr><td colspan='2' style='padding: 4px;'></td></tr>
                                <tr>
                                    <td style='padding: 12px; background-color: #f5f5f5; border-radius: 8px 0 0 8px;'>
                                        <strong>New Status:</strong>
                                    </td>
                                    <td style='padding: 12px; background-color: #f5f5f5; border-radius: 0 8px 8px 0;'>
                                        <span style='color: {statusColor}; font-weight: bold;'>{newStatus}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                            <p style='color: #888; font-size: 12px; text-align: center;'>
                                This notification was sent from GAUHATT Farmer Consumer Platform.<br>
                                Thank you for supporting local farmers!
                            </p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(consumerEmail, subject, body);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings["SmtpServer"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var senderEmail = emailSettings["SenderEmail"] ?? "";
            var senderName = emailSettings["SenderName"] ?? "Farmer Consumer Platform";
            var username = emailSettings["Username"] ?? "";
            var password = emailSettings["Password"] ?? "";

            try
            {
                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(username, password)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to: {Email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to: {Email}", to);
                // Don't throw - log the error but don't break the registration flow
                // In production, you might want to queue this for retry
            }
        }
    }
}
