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
