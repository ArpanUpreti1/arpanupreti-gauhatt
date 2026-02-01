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
        }
    }
}
