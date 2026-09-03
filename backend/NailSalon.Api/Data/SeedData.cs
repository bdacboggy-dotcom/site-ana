using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Models;

namespace NailSalon.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration configuration)
    {
        if (!await db.WorkingHours.AnyAsync())
        {
            var days = Enum.GetValues<DayOfWeek>();
            foreach (var day in days)
            {
                db.WorkingHours.Add(new WorkingHours
                {
                    DayOfWeek = day,
                    StartTime = new TimeSpan(10, 0, 0),
                    EndTime = new TimeSpan(19, 0, 0),
                    IsWorkingDay = day != DayOfWeek.Sunday
                });
            }
        }

        if (!await db.Services.AnyAsync())
        {
            db.Services.AddRange(
                new Service { Name = "Manichiură simplă", DurationMinutes = 45, Price = 80 },
                new Service { Name = "Manichiură cu gel", DurationMinutes = 75, Price = 130 },
                new Service { Name = "Pedichiură", DurationMinutes = 60, Price = 100 }
            );
        }

        if (!await db.AdminUsers.AnyAsync())
        {
            var email = configuration["AdminSeed:Email"];
            var password = configuration["AdminSeed:Password"];

            if (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(password))
            {
                db.AdminUsers.Add(new AdminUser
                {
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
