// importing namespace
using Microsoft.EntityFrameworkCore;
using API_BurgerMania.Models;

// current namespace
namespace API_BurgerMania.Data
{
    public class BurgerManiaDbContext : DbContext
    {
        public DbSet<Burger> Burgers { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; } // Add this line

        public BurgerManiaDbContext(DbContextOptions<BurgerManiaDbContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=(LocalDB)\\MsSqlLocalDB;Database=BurgerManiaDB;Trusted_Connection=True;MultipleActiveResultSets=True;Trust Server Certificate=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // relation between Cart and CartItems
            modelBuilder.Entity<Cart>()
                .HasMany(c => c.CartItems)
                .WithOne()  // No navigation property
                .HasForeignKey(ci => ci.CartId) // Link CartItem to Cart
                .OnDelete(DeleteBehavior.Cascade); // Optional: define delete behavior

            // Linking Burger and User
            modelBuilder.Entity<Burger>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(b => b.UserId);

            // Linking Order and User
            modelBuilder.Entity<Order>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(o => o.UserId);

            // Linking Order and OrderItems
            modelBuilder.Entity<OrderItem>()
                .HasOne<Order>()
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId);

            modelBuilder.Entity<CartItem>()
                .Property(ci => ci.Price)
                .HasColumnType("decimal(18,2)"); // Ensure Price has the correct precision

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalPrice)
                .HasColumnType("decimal(18,2)"); // Ensure TotalPrice has the correct precision

            modelBuilder.Entity<Order>()
                .Property(o => o.Discount)
                .HasColumnType("decimal(5,2)"); // Ensure Discount has the correct precision

            modelBuilder.Entity<Order>()
                .Property(o => o.FinalPrice)
                .HasColumnType("decimal(18,2)"); // Ensure FinalPrice has the correct precision

            modelBuilder.Entity<OrderItem>()
                .Property(o => o.Price)
                .HasColumnType("decimal(18,2)"); // Ensure Price has the correct precision
        }
    }
}