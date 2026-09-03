using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Models;

namespace NailSalon.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Service> Services => Set<Service>();
    public DbSet<WorkingHours> WorkingHours => Set<WorkingHours>();
    public DbSet<BlockedDate> BlockedDates => Set<BlockedDate>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Service>()
            .Property(s => s.Price)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Service)
            .WithMany()
            .HasForeignKey(a => a.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.ManageToken)
            .IsUnique();

        modelBuilder.Entity<AdminUser>()
            .HasIndex(a => a.Email)
            .IsUnique();
    }
}
