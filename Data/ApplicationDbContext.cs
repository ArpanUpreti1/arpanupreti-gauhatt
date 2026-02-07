using Microsoft.EntityFrameworkCore;
using FarmerConsumerAPI.Models.Entities;
using FarmerConsumerAPI.Models.Enums;

namespace FarmerConsumerAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<District> Districts { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Story> Stories { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ProductRating> ProductRatings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                
                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(50);
                entity.HasIndex(e => e.Username).IsUnique();

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(e => e.Role)
                    .IsRequired()
                    .HasConversion<string>()
                    .HasMaxLength(50);
                entity.HasIndex(e => e.Role);

                entity.Property(e => e.EmailVerificationToken).HasMaxLength(255);
                entity.Property(e => e.FarmName).HasMaxLength(200);
                entity.Property(e => e.District).HasMaxLength(100);
                entity.Property(e => e.FarmAddress).HasMaxLength(500);
                entity.Property(e => e.FarmPhotoUrl).HasMaxLength(500);
                entity.Property(e => e.IdentityProofUrl).HasMaxLength(500);
                entity.Property(e => e.PhoneNumber).HasMaxLength(15);
                entity.Property(e => e.FullName).HasMaxLength(100);
                entity.Property(e => e.Department).HasMaxLength(100);
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).HasMaxLength(50);
            });

            // RefreshToken entity configuration
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                
                entity.Property(e => e.Token)
                    .IsRequired()
                    .HasMaxLength(500);
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ExpiresAt);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // District entity configuration
            modelBuilder.Entity<District>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Province).HasMaxLength(100);
            });

            // Product entity configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);
                entity.HasIndex(e => e.Name);

                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.Unit).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.FarmerId);

                entity.HasOne(e => e.Farmer)
                    .WithMany()
                    .HasForeignKey(e => e.FarmerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Story entity configuration
            modelBuilder.Entity<Story>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                
                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Content)
                    .IsRequired()
                    .HasMaxLength(5000);

                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.VideoUrl).HasMaxLength(500);
                
                entity.HasIndex(e => e.FarmerId);
                entity.HasIndex(e => e.ProductId);
                entity.HasIndex(e => e.IsPublished);

                entity.HasOne(e => e.Farmer)
                    .WithMany()
                    .HasForeignKey(e => e.FarmerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Product)
                    .WithMany(p => p.Stories)
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Comment entity configuration
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                
                entity.Property(e => e.Content)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.HasIndex(e => e.StoryId);
                entity.HasIndex(e => e.UserId);

                entity.HasOne(e => e.Story)
                    .WithMany(s => s.Comments)
                    .HasForeignKey(e => e.StoryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Order entity configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");

                entity.HasOne(e => e.Consumer)
                    .WithMany()
                    .HasForeignKey(e => e.ConsumerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // OrderItem entity configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");

                entity.HasOne(e => e.Order)
                    .WithMany(o => o.Items)
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Product)
                    .WithMany()
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Farmer)
                    .WithMany()
                    .HasForeignKey(e => e.FarmerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ProductRating entity configuration
            modelBuilder.Entity<ProductRating>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasDefaultValueSql("NEWID()");
                
                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Review).HasMaxLength(500);
                
                // Unique constraint: one rating per user per product
                entity.HasIndex(e => new { e.ProductId, e.UserId }).IsUnique();
                
                entity.HasOne(e => e.Product)
                    .WithMany(p => p.Ratings)
                    .HasForeignKey(e => e.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
