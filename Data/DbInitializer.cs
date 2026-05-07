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

            // Seed generic users for testing
            var existingFarmer = await context.Users.FirstOrDefaultAsync(u => u.Email == "farmer@gmail.com");
            var adminUserForFarmer = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            
            if (existingFarmer == null)
            {
                var farmerUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "farmer",
                    Email = "farmer@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Farmer@123", 12),
                    Role = UserRole.Farmer,
                    IsEmailVerified = true,
                    FullName = "Demo Farmer",
                    ApprovalStatus = ApprovalStatus.Approved,
                    ApprovalDate = DateTime.UtcNow,
                    ApprovedByAdminId = adminUserForFarmer?.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(farmerUser);
            }
            else
            {
                existingFarmer.IsEmailVerified = true;
                existingFarmer.ApprovalStatus = ApprovalStatus.Approved;
                existingFarmer.ApprovalDate = DateTime.UtcNow;
                existingFarmer.ApprovedByAdminId = adminUserForFarmer?.Id;
                context.Users.Update(existingFarmer);
            }

            var existingConsumer = await context.Users.FirstOrDefaultAsync(u => u.Email == "consumer@gmail.com");
            if (existingConsumer == null)
            {
                var consumerUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "consumer",
                    Email = "consumer@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Consumer@123", 12),
                    Role = UserRole.Consumer,
                    IsEmailVerified = true,
                    FullName = "Demo Consumer",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(consumerUser);
            }
            else
            {
                existingConsumer.IsEmailVerified = true;
                context.Users.Update(existingConsumer);
            }

            var existingDelivery = await context.Users.FirstOrDefaultAsync(u => u.Email == "delivery@gmail.com");
            if (existingDelivery == null)
            {
                var deliveryUser = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "delivery",
                    Email = "delivery@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Delivery@123", 12),
                    Role = UserRole.DeliveryPerson,
                    IsEmailVerified = true,
                    FullName = "Demo Delivery",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(deliveryUser);
            }
            else
            {
                existingDelivery.IsEmailVerified = true;
                context.Users.Update(existingDelivery);
            }
            await context.SaveChangesAsync();

            // Seed test data if no farmers exist (except real users)
            var testDataExists = await context.Users.AnyAsync(u => u.Email == "ramkrishna.sharma@gmail.com");
            if (!testDataExists)
            {
                await SeedTestDataAsync(context);
            }
        }

        private static async Task SeedTestDataAsync(ApplicationDbContext context)
        {
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Test@123", 12);
            
            // ============================================
            // FARMERS - Nepali farmers from different regions
            // ============================================
            var farmers = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "ramkrishna_farmer",
                    Email = "ramkrishna.sharma@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Farmer,
                    IsEmailVerified = true,
                    ApprovalStatus = ApprovalStatus.Approved,
                    ApprovalDate = DateTime.UtcNow.AddDays(-30),
                    FarmName = "श्री कृष्ण कृषि फार्म",
                    District = "Kathmandu",
                    FarmAddress = "Thankot, Chandragiri-6, Kathmandu",
                    CropTypes = "[\"Vegetables\", \"Fruits\"]",
                    PhoneNumber = "9841234567",
                    Latitude = 27.6915,
                    Longitude = 85.2480,
                    LocationAddress = "Thankot, Kathmandu",
                    CreatedAt = DateTime.UtcNow.AddDays(-60),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "sita_devi_farm",
                    Email = "sita.devi@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Farmer,
                    IsEmailVerified = true,
                    ApprovalStatus = ApprovalStatus.Approved,
                    ApprovalDate = DateTime.UtcNow.AddDays(-25),
                    FarmName = "सीता देवी जैविक फार्म",
                    District = "Lalitpur",
                    FarmAddress = "Godawari, Lalitpur-5",
                    CropTypes = "[\"Dairy\", \"Vegetables\"]",
                    PhoneNumber = "9851234567",
                    Latitude = 27.5946,
                    Longitude = 85.3823,
                    LocationAddress = "Godawari, Lalitpur",
                    CreatedAt = DateTime.UtcNow.AddDays(-50),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "hari_bahadur",
                    Email = "hari.bahadur@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Farmer,
                    IsEmailVerified = true,
                    ApprovalStatus = ApprovalStatus.Approved,
                    ApprovalDate = DateTime.UtcNow.AddDays(-20),
                    FarmName = "हरि बहादुर किसान फार्म",
                    District = "Chitwan",
                    FarmAddress = "Bharatpur-12, Chitwan",
                    CropTypes = "[\"Fruits\", \"Grains\"]",
                    PhoneNumber = "9845123456",
                    Latitude = 27.6768,
                    Longitude = 84.4360,
                    LocationAddress = "Bharatpur, Chitwan",
                    CreatedAt = DateTime.UtcNow.AddDays(-45),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "maya_gurung",
                    Email = "maya.gurung@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Farmer,
                    IsEmailVerified = true,
                    ApprovalStatus = ApprovalStatus.Approved,
                    ApprovalDate = DateTime.UtcNow.AddDays(-15),
                    FarmName = "माया गुरुङ हिमाली फार्म",
                    District = "Kaski",
                    FarmAddress = "Hemja, Pokhara-25",
                    CropTypes = "[\"Vegetables\", \"Spices\"]",
                    PhoneNumber = "9846234567",
                    Latitude = 28.2380,
                    Longitude = 83.9956,
                    LocationAddress = "Hemja, Pokhara",
                    CreatedAt = DateTime.UtcNow.AddDays(-40),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "bhim_tamang",
                    Email = "bhim.tamang@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Farmer,
                    IsEmailVerified = true,
                    ApprovalStatus = ApprovalStatus.Approved,
                    ApprovalDate = DateTime.UtcNow.AddDays(-10),
                    FarmName = "भीम तामाङ अर्गानिक फार्म",
                    District = "Bhaktapur",
                    FarmAddress = "Nagarkot, Bhaktapur-8",
                    CropTypes = "[\"Vegetables\", \"Fruits\", \"Dairy\"]",
                    PhoneNumber = "9847345678",
                    Latitude = 27.7172,
                    Longitude = 85.5200,
                    LocationAddress = "Nagarkot, Bhaktapur",
                    CreatedAt = DateTime.UtcNow.AddDays(-35),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.Users.AddRangeAsync(farmers);

            // ============================================
            // CONSUMERS - Nepali consumers from cities
            // ============================================
            var consumers = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "anita_shrestha",
                    Email = "anita.shrestha@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Consumer,
                    IsEmailVerified = true,
                    FirstName = "Anita",
                    LastName = "Shrestha",
                    PhoneNumber = "9861234567",
                    Latitude = 27.7172,
                    Longitude = 85.3240,
                    LocationAddress = "Baneshwor, Kathmandu",
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "suresh_kc",
                    Email = "suresh.kc@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Consumer,
                    IsEmailVerified = true,
                    FirstName = "Suresh",
                    LastName = "K.C.",
                    PhoneNumber = "9862345678",
                    Latitude = 27.6915,
                    Longitude = 85.3420,
                    LocationAddress = "Pulchowk, Lalitpur",
                    CreatedAt = DateTime.UtcNow.AddDays(-25),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "priya_adhikari",
                    Email = "priya.adhikari@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Consumer,
                    IsEmailVerified = true,
                    FirstName = "Priya",
                    LastName = "Adhikari",
                    PhoneNumber = "9863456789",
                    Latitude = 27.7000,
                    Longitude = 85.3333,
                    LocationAddress = "Jawalakhel, Lalitpur",
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "rajesh_maharjan",
                    Email = "rajesh.maharjan@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Consumer,
                    IsEmailVerified = true,
                    FirstName = "Rajesh",
                    LastName = "Maharjan",
                    PhoneNumber = "9864567890",
                    Latitude = 27.6710,
                    Longitude = 85.4298,
                    LocationAddress = "Bhaktapur Durbar Square",
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "sunita_thapa",
                    Email = "sunita.thapa@gmail.com",
                    PasswordHash = passwordHash,
                    Role = UserRole.Consumer,
                    IsEmailVerified = true,
                    FirstName = "Sunita",
                    LastName = "Thapa",
                    PhoneNumber = "9865678901",
                    Latitude = 28.2096,
                    Longitude = 83.9856,
                    LocationAddress = "Lakeside, Pokhara",
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.Users.AddRangeAsync(consumers);
            await context.SaveChangesAsync();

            // ============================================
            // PRODUCTS - Nepali agricultural products
            // ============================================
            var products = new List<Product>
            {
                // Farmer 1 - Ram Krishna (Kathmandu)
                new Product { Id = Guid.NewGuid(), Name = "गोलभेडा (Golbheda)", Description = "ताजा र रसिलो गोलभेडा, घरको बगैचाबाट। Organic tomatoes from our farm.", Price = 80, StockQuantity = 50, Unit = "kg", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[0].Id, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Product { Id = Guid.NewGuid(), Name = "आलु (Aalu)", Description = "काठमाडौंको ताजा आलु। Fresh potatoes from Kathmandu hills.", Price = 45, StockQuantity = 100, Unit = "kg", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[0].Id, CreatedAt = DateTime.UtcNow.AddDays(-28) },
                new Product { Id = Guid.NewGuid(), Name = "प्याज (Pyaj)", Description = "स्थानीय उत्पादन गरिएको प्याज। Locally grown onions.", Price = 60, StockQuantity = 80, Unit = "kg", Category = "Vegetables", IsOrganic = false, IsActive = true, FarmerId = farmers[0].Id, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Product { Id = Guid.NewGuid(), Name = "स्याउ (Syau)", Description = "नेपाली पहाडको ताजा स्याउ। Fresh Nepali apples from hills.", Price = 180, StockQuantity = 40, Unit = "kg", Category = "Fruits", IsOrganic = true, IsActive = true, FarmerId = farmers[0].Id, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Product { Id = Guid.NewGuid(), Name = "काउली (Kauli)", Description = "ताजा सेतो काउली। Fresh white cauliflower.", Price = 55, StockQuantity = 30, Unit = "piece", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[0].Id, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                
                // Farmer 2 - Sita Devi (Lalitpur)
                new Product { Id = Guid.NewGuid(), Name = "भैंसीको दूध (Bhaisi ko Dudh)", Description = "ताजा भैंसीको दूध, दैनिक उपलब्ध। Fresh buffalo milk daily.", Price = 90, StockQuantity = 30, Unit = "liter", Category = "Dairy", IsOrganic = true, IsActive = true, FarmerId = farmers[1].Id, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Product { Id = Guid.NewGuid(), Name = "गाईको दूध (Gai ko Dudh)", Description = "शुद्ध गाईको दूध। Pure cow milk.", Price = 75, StockQuantity = 40, Unit = "liter", Category = "Dairy", IsOrganic = true, IsActive = true, FarmerId = farmers[1].Id, CreatedAt = DateTime.UtcNow.AddDays(-28) },
                new Product { Id = Guid.NewGuid(), Name = "दही (Dahi)", Description = "घरमा बनाइएको मिठो दही। Homemade sweet curd.", Price = 120, StockQuantity = 25, Unit = "kg", Category = "Dairy", IsOrganic = true, IsActive = true, FarmerId = farmers[1].Id, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Product { Id = Guid.NewGuid(), Name = "घिउ (Ghiu)", Description = "शुद्ध घरेलु घिउ। Pure homemade ghee.", Price = 1800, StockQuantity = 10, Unit = "kg", Category = "Dairy", IsOrganic = true, IsActive = true, FarmerId = farmers[1].Id, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Product { Id = Guid.NewGuid(), Name = "साग (Saag)", Description = "ताजा हरियो साग। Fresh green leafy vegetables.", Price = 40, StockQuantity = 60, Unit = "bundle", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[1].Id, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                
                // Farmer 3 - Hari Bahadur (Chitwan)
                new Product { Id = Guid.NewGuid(), Name = "केरा (Kera)", Description = "चितवनको मिठो केरा। Sweet bananas from Chitwan.", Price = 70, StockQuantity = 80, Unit = "dozen", Category = "Fruits", IsOrganic = false, IsActive = true, FarmerId = farmers[2].Id, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Product { Id = Guid.NewGuid(), Name = "आँप (Aap)", Description = "ताजा रसिलो आँप। Fresh juicy mangoes.", Price = 150, StockQuantity = 50, Unit = "kg", Category = "Fruits", IsOrganic = true, IsActive = true, FarmerId = farmers[2].Id, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Product { Id = Guid.NewGuid(), Name = "लिची (Litchi)", Description = "चितवनको मिठो लिची। Sweet lychees from Chitwan.", Price = 200, StockQuantity = 30, Unit = "kg", Category = "Fruits", IsOrganic = true, IsActive = true, FarmerId = farmers[2].Id, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Product { Id = Guid.NewGuid(), Name = "चामल (Chamal)", Description = "बासमती चामल, नयाँ फसल। Basmati rice, new harvest.", Price = 120, StockQuantity = 200, Unit = "kg", Category = "Grains", IsOrganic = false, IsActive = true, FarmerId = farmers[2].Id, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Product { Id = Guid.NewGuid(), Name = "मकै (Makai)", Description = "ताजा मकैको दाना। Fresh corn kernels.", Price = 60, StockQuantity = 100, Unit = "kg", Category = "Grains", IsOrganic = true, IsActive = true, FarmerId = farmers[2].Id, CreatedAt = DateTime.UtcNow.AddDays(-10) },
                
                // Farmer 4 - Maya Gurung (Kaski/Pokhara)
                new Product { Id = Guid.NewGuid(), Name = "अदुवा (Aduwa)", Description = "पोखराको ताजा अदुवा। Fresh ginger from Pokhara.", Price = 200, StockQuantity = 25, Unit = "kg", Category = "Spices", IsOrganic = true, IsActive = true, FarmerId = farmers[3].Id, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Product { Id = Guid.NewGuid(), Name = "लसुन (Lasun)", Description = "नेपाली लसुन, तीखो र स्वादिलो। Nepali garlic, spicy and tasty.", Price = 300, StockQuantity = 20, Unit = "kg", Category = "Spices", IsOrganic = true, IsActive = true, FarmerId = farmers[3].Id, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Product { Id = Guid.NewGuid(), Name = "बेसार (Besar)", Description = "ताजा बेसार, जैविक। Fresh organic turmeric.", Price = 250, StockQuantity = 15, Unit = "kg", Category = "Spices", IsOrganic = true, IsActive = true, FarmerId = farmers[3].Id, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Product { Id = Guid.NewGuid(), Name = "मुला (Mula)", Description = "सेतो मुला, ताजा। Fresh white radish.", Price = 35, StockQuantity = 50, Unit = "kg", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[3].Id, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Product { Id = Guid.NewGuid(), Name = "गाजर (Gajar)", Description = "रातो गाजर, मिठो। Sweet red carrots.", Price = 50, StockQuantity = 40, Unit = "kg", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[3].Id, CreatedAt = DateTime.UtcNow.AddDays(-10) },
                
                // Farmer 5 - Bhim Tamang (Bhaktapur)
                new Product { Id = Guid.NewGuid(), Name = "भटमास (Bhatmas)", Description = "स्थानीय भटमास, प्रोटिनयुक्त। Local soybeans, protein rich.", Price = 150, StockQuantity = 50, Unit = "kg", Category = "Grains", IsOrganic = true, IsActive = true, FarmerId = farmers[4].Id, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new Product { Id = Guid.NewGuid(), Name = "मास (Maas)", Description = "कालो दाल, पौष्टिक। Black lentils, nutritious.", Price = 180, StockQuantity = 40, Unit = "kg", Category = "Grains", IsOrganic = true, IsActive = true, FarmerId = farmers[4].Id, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new Product { Id = Guid.NewGuid(), Name = "खुर्सानी (Khursani)", Description = "हरियो र रातो खुर्सानी। Green and red chillies.", Price = 120, StockQuantity = 30, Unit = "kg", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[4].Id, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new Product { Id = Guid.NewGuid(), Name = "भन्टा (Bhanta)", Description = "ताजा बैंगन। Fresh brinjal/eggplant.", Price = 60, StockQuantity = 35, Unit = "kg", Category = "Vegetables", IsOrganic = true, IsActive = true, FarmerId = farmers[4].Id, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new Product { Id = Guid.NewGuid(), Name = "छुर्पी (Chhurpi)", Description = "परम्परागत नेपाली पनीर। Traditional Nepali hard cheese.", Price = 800, StockQuantity = 10, Unit = "kg", Category = "Dairy", IsOrganic = true, IsActive = true, FarmerId = farmers[4].Id, CreatedAt = DateTime.UtcNow.AddDays(-10) }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            // ============================================
            // ORDERS - Sample orders with Nepali addresses
            // ============================================
            var random = new Random(42); // Fixed seed for reproducibility
            var orders = new List<Order>();
            var orderItems = new List<OrderItem>();

            // Create orders for the past 3 months
            for (int i = 0; i < 25; i++)
            {
                var consumer = consumers[random.Next(consumers.Count)];
                var orderDate = DateTime.UtcNow.AddDays(-random.Next(1, 90));
                var orderId = Guid.NewGuid();

                var cities = new[] { "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan" };
                var addresses = new[] {
                    "बानेश्वर, काठमाडौं",
                    "पुल्चोक, ललितपुर",
                    "जावलाखेल, ललितपुर",
                    "भक्तपुर दरबार क्षेत्र",
                    "लेकसाइड, पोखरा",
                    "थामेल, काठमाडौं",
                    "बौद्ध, काठमाडौं",
                    "किर्तिपुर, काठमाडौं",
                    "भरतपुर, चितवन"
                };

                var order = new Order
                {
                    Id = orderId,
                    OrderNumber = $"ORD-{orderDate:yyyyMMdd}-{(i + 1).ToString("D4")}",
                    ConsumerId = consumer.Id,
                    FullName = $"{consumer.FirstName} {consumer.LastName}",
                    Phone = consumer.PhoneNumber ?? "9800000000",
                    Address = addresses[random.Next(addresses.Length)],
                    City = cities[random.Next(cities.Length)],
                    Latitude = 27.7 + random.NextDouble() * 0.1,
                    Longitude = 85.3 + random.NextDouble() * 0.1,
                    Notes = random.Next(3) == 0 ? "कृपया बिहान ५ बजे अघि डेलिभरी गर्नुहोस्" : null,
                    PaymentMethod = random.Next(2) == 0 ? "cash" : "esewa",
                    PaymentStatus = "completed",
                    Status = random.Next(5) switch { 0 => "pending", 1 => "confirmed", 2 => "processing", 3 => "shipped", _ => "delivered" },
                    OrderDate = orderDate,
                    CreatedAt = orderDate,
                    UpdatedAt = orderDate.AddHours(random.Next(1, 48))
                };

                // Add 1-3 items per order
                var itemCount = random.Next(1, 4);
                decimal subtotal = 0;
                decimal deliveryFee = 50 + random.Next(0, 100);

                for (int j = 0; j < itemCount; j++)
                {
                    var product = products[random.Next(products.Count)];
                    var quantity = random.Next(1, 5);
                    var itemSubtotal = product.Price * quantity;
                    subtotal += itemSubtotal;

                    orderItems.Add(new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = orderId,
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductImageUrl = product.ImageUrl,
                        FarmerId = product.FarmerId,
                        FarmName = farmers.First(f => f.Id == product.FarmerId).FarmName ?? "",
                        Quantity = quantity,
                        UnitPrice = product.Price,
                        Unit = product.Unit,
                        Subtotal = itemSubtotal,
                        DistanceKm = random.Next(2, 25),
                        DeliveryFee = deliveryFee / itemCount,
                        ItemStatus = order.Status,
                        CreatedAt = orderDate
                    });
                }

                order.Subtotal = subtotal;
                order.DeliveryFee = deliveryFee;
                order.Total = subtotal + deliveryFee;
                orders.Add(order);
            }

            await context.Orders.AddRangeAsync(orders);
            await context.OrderItems.AddRangeAsync(orderItems);
            await context.SaveChangesAsync();
        }
    }
}
