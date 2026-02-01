using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FarmerConsumerAPI.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            // Ensure database is created
            await context.Database.MigrateAsync();

            // Seed Districts if empty
            if (!await context.Districts.AnyAsync())
            {
                var districts = new List<District>
                {
                    new District { Name = "Kathmandu", Province = "Bagmati" },
                    new District { Name = "Lalitpur", Province = "Bagmati" },
                    new District { Name = "Bhaktapur", Province = "Bagmati" },
                    new District { Name = "Makwanpur", Province = "Bagmati" },
                    new District { Name = "Chitwan", Province = "Bagmati" },
                    new District { Name = "Kavrepalanchok", Province = "Bagmati" },
                    new District { Name = "Nuwakot", Province = "Bagmati" },
                    new District { Name = "Rasuwa", Province = "Bagmati" },
                    new District { Name = "Dhading", Province = "Bagmati" },
                    new District { Name = "Sindhuli", Province = "Bagmati" },
                    new District { Name = "Ramechhap", Province = "Bagmati" },
                    new District { Name = "Dolakha", Province = "Bagmati" },
                    new District { Name = "Sindhupalchok", Province = "Bagmati" },
                    new District { Name = "Kaski", Province = "Gandaki" },
                    new District { Name = "Lamjung", Province = "Gandaki" },
                    new District { Name = "Tanahu", Province = "Gandaki" },
                    new District { Name = "Gorkha", Province = "Gandaki" },
                    new District { Name = "Syangja", Province = "Gandaki" },
                    new District { Name = "Nawalpur", Province = "Gandaki" },
                    new District { Name = "Parbat", Province = "Gandaki" },
                    new District { Name = "Baglung", Province = "Gandaki" },
                    new District { Name = "Myagdi", Province = "Gandaki" },
                    new District { Name = "Mustang", Province = "Gandaki" },
                    new District { Name = "Manang", Province = "Gandaki" },
                    new District { Name = "Jhapa", Province = "Koshi" },
                    new District { Name = "Morang", Province = "Koshi" },
                    new District { Name = "Sunsari", Province = "Koshi" },
                    new District { Name = "Ilam", Province = "Koshi" },
                    new District { Name = "Panchthar", Province = "Koshi" },
                    new District { Name = "Taplejung", Province = "Koshi" },
                    new District { Name = "Dhankuta", Province = "Koshi" },
                    new District { Name = "Terhathum", Province = "Koshi" },
                    new District { Name = "Sankhuwasabha", Province = "Koshi" },
                    new District { Name = "Bhojpur", Province = "Koshi" },
                    new District { Name = "Solukhumbu", Province = "Koshi" },
                    new District { Name = "Okhaldhunga", Province = "Koshi" },
                    new District { Name = "Khotang", Province = "Koshi" },
                    new District { Name = "Udayapur", Province = "Koshi" },
                    new District { Name = "Rupandehi", Province = "Lumbini" },
                    new District { Name = "Kapilvastu", Province = "Lumbini" },
                    new District { Name = "Palpa", Province = "Lumbini" },
                    new District { Name = "Arghakhanchi", Province = "Lumbini" },
                    new District { Name = "Gulmi", Province = "Lumbini" },
                    new District { Name = "Nawalparasi", Province = "Lumbini" },
                    new District { Name = "Dang", Province = "Lumbini" },
                    new District { Name = "Banke", Province = "Lumbini" },
                    new District { Name = "Bardiya", Province = "Lumbini" },
                    new District { Name = "Pyuthan", Province = "Lumbini" },
                    new District { Name = "Rolpa", Province = "Lumbini" },
                    new District { Name = "Rukum", Province = "Lumbini" },
                    new District { Name = "Sarlahi", Province = "Madhesh" },
                    new District { Name = "Mahottari", Province = "Madhesh" },
                    new District { Name = "Dhanusha", Province = "Madhesh" },
                    new District { Name = "Siraha", Province = "Madhesh" },
                    new District { Name = "Saptari", Province = "Madhesh" },
                    new District { Name = "Rautahat", Province = "Madhesh" },
                    new District { Name = "Bara", Province = "Madhesh" },
                    new District { Name = "Parsa", Province = "Madhesh" },
                    new District { Name = "Kailali", Province = "Sudurpashchim" },
                    new District { Name = "Kanchanpur", Province = "Sudurpashchim" },
                    new District { Name = "Dadeldhura", Province = "Sudurpashchim" },
                    new District { Name = "Baitadi", Province = "Sudurpashchim" },
                    new District { Name = "Darchula", Province = "Sudurpashchim" },
                    new District { Name = "Doti", Province = "Sudurpashchim" },
                    new District { Name = "Achham", Province = "Sudurpashchim" },
                    new District { Name = "Bajhang", Province = "Sudurpashchim" },
                    new District { Name = "Bajura", Province = "Sudurpashchim" },
                    new District { Name = "Surkhet", Province = "Karnali" },
                    new District { Name = "Dailekh", Province = "Karnali" },
                    new District { Name = "Jajarkot", Province = "Karnali" },
                    new District { Name = "Salyan", Province = "Karnali" },
                    new District { Name = "Dolpa", Province = "Karnali" },
                    new District { Name = "Jumla", Province = "Karnali" },
                    new District { Name = "Kalikot", Province = "Karnali" },
                    new District { Name = "Mugu", Province = "Karnali" },
                    new District { Name = "Humla", Province = "Karnali" }
                };

                await context.Districts.AddRangeAsync(districts);
                await context.SaveChangesAsync();
            }

            // Seed Admin user if not exists
            if (!await context.Users.AnyAsync(u => u.Email == "admin.admin@gmail.com"))
            {
                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "admin",
                    Email = "admin.admin@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Uprety23@K", 12),
                    Role = UserRole.Admin,
                    IsEmailVerified = true,
                    FullName = "System Administrator",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
