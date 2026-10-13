using Microsoft.EntityFrameworkCore;
using KarnelTravelGuide.API.Models;

namespace KarnelTravelGuide.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<City> Cities => Set<City>();
        public DbSet<Hotel> Hotels => Set<Hotel>();
        public DbSet<TouristSpot> TouristSpots => Set<TouristSpot>();
        public DbSet<Resort> Resorts => Set<Resort>();
        public DbSet<Restaurant> Restaurants => Set<Restaurant>();
        public DbSet<TransportOption> TransportOptions => Set<TransportOption>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Entity Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);
                entity.HasIndex(u => u.Email)
                      .IsUnique();
                entity.Property(u => u.Role)
                      .IsRequired()
                      .HasMaxLength(50);
                entity.Property(u => u.FullName)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(u => u.PasswordHash)
                      .IsRequired()
                      .HasMaxLength(255);
                entity.Property(u => u.Phone)
                      .IsRequired()
                      .HasMaxLength(20);
                entity.Property(u => u.IsVerified)
                      .HasDefaultValue(false);
                entity.Property(u => u.CreatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // City Entity Configuration
            modelBuilder.Entity<City>(entity =>
            {
                entity.HasKey(c => c.CityId);
                entity.Property(c => c.Name)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(c => c.Region)
                      .IsRequired()
                      .HasMaxLength(100);
            });

            // Hotel Entity Configuration
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.HasKey(h => h.HotelId);
                entity.Property(h => h.Name)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(h => h.Address)
                      .IsRequired()
                      .HasMaxLength(250);
                entity.Property(h => h.PricePerNight)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();
                entity.Property(h => h.StarRating)
                      .IsRequired();
                entity.Property(h => h.Amenities)
                      .HasMaxLength(500);
                entity.Property(h => h.RoomsAvailable)
                      .IsRequired();
                entity.Property(h => h.Image)
                      .HasMaxLength(500);
                entity.Property(h => h.IsActive)
                      .HasDefaultValue(true);

                entity.HasOne(h => h.City)
                      .WithMany(c => c.Hotels)
                      .HasForeignKey(h => h.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // TouristSpot Entity Configuration
            modelBuilder.Entity<TouristSpot>(entity =>
            {
                entity.HasKey(ts => ts.SpotId);
                entity.Property(ts => ts.Name)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(ts => ts.Type)
                      .IsRequired()
                      .HasMaxLength(50);
                entity.Property(ts => ts.Description)
                      .IsRequired()
                      .HasMaxLength(1000);
                entity.Property(ts => ts.BestSeason)
                      .HasMaxLength(50);
                entity.Property(ts => ts.Image)
                      .HasMaxLength(500);
                entity.Property(ts => ts.IsActive)
                      .HasDefaultValue(true);

                entity.HasOne(ts => ts.City)
                      .WithMany(c => c.TouristSpots)
                      .HasForeignKey(ts => ts.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Resort Entity Configuration
            modelBuilder.Entity<Resort>(entity =>
            {
                entity.HasKey(r => r.ResortId);
                entity.Property(r => r.Name)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(r => r.PricePerNight)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();
                entity.Property(r => r.Rating)
                      .HasColumnType("decimal(3,1)")
                      .IsRequired();
                entity.Property(r => r.Amenities)
                      .HasMaxLength(500);
                entity.Property(r => r.Activities)
                      .HasMaxLength(500);
                entity.Property(r => r.RoomsAvailable)
                      .IsRequired();
                entity.Property(r => r.Image)
                      .HasMaxLength(500);
                entity.Property(r => r.IsActive)
                      .HasDefaultValue(true);

                entity.HasOne(r => r.City)
                      .WithMany(c => c.Resorts)
                      .HasForeignKey(r => r.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Restaurant Entity Configuration
            modelBuilder.Entity<Restaurant>(entity =>
            {
                entity.HasKey(res => res.RestaurantId);
                entity.Property(res => res.Name)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(res => res.Cuisine)
                      .HasMaxLength(100);
                entity.Property(res => res.AvgPrice)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();
                entity.Property(res => res.Rating)
                      .HasColumnType("decimal(3,1)")
                      .IsRequired();
                entity.Property(res => res.Timings)
                      .HasMaxLength(100);
                entity.Property(res => res.Image)
                      .HasMaxLength(500);
                entity.Property(res => res.IsActive)
                      .HasDefaultValue(true);

                entity.HasOne(res => res.City)
                      .WithMany(c => c.Restaurants)
                      .HasForeignKey(res => res.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // TransportOption Entity Configuration (Dual City foreign key relationships with Restrict)
            modelBuilder.Entity<TransportOption>(entity =>
            {
                entity.HasKey(t => t.TransportId);
                entity.Property(t => t.Mode)
                      .IsRequired()
                      .HasMaxLength(50);
                entity.Property(t => t.Operator)
                      .HasMaxLength(100);
                entity.Property(t => t.Price)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();
                entity.Property(t => t.Schedule)
                      .HasMaxLength(200);
                entity.Property(t => t.SeatsAvailable)
                      .IsRequired();
                entity.Property(t => t.IsActive)
                      .HasDefaultValue(true);

                entity.HasOne(t => t.FromCity)
                      .WithMany(c => c.OutgoingTransports)
                      .HasForeignKey(t => t.FromCityId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.ToCity)
                      .WithMany(c => c.IncomingTransports)
                      .HasForeignKey(t => t.ToCityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Booking Entity Configuration
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.BookingId);
                entity.HasIndex(b => b.ReferenceNo)
                      .IsUnique();
                entity.Property(b => b.ReferenceNo)
                      .IsRequired()
                      .HasMaxLength(50);
                entity.Property(b => b.ItemType)
                      .IsRequired()
                      .HasMaxLength(50);
                entity.Property(b => b.ItemId)
                      .IsRequired();
                entity.Property(b => b.StartDate)
                      .IsRequired();
                entity.Property(b => b.EndDate)
                      .IsRequired();
                entity.Property(b => b.Quantity)
                      .IsRequired();
                entity.Property(b => b.TotalPrice)
                      .HasColumnType("decimal(18,2)")
                      .IsRequired();
                entity.Property(b => b.Status)
                      .IsRequired()
                      .HasMaxLength(20);
                entity.Property(b => b.AdminRemark)
                      .HasMaxLength(500);
                entity.Property(b => b.CreatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(b => b.User)
                      .WithMany(u => u.Bookings)
                      .HasForeignKey(b => b.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
