using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;

namespace NailSalon.Api.Services;

public class AvailabilityService
{
    private readonly AppDbContext _db;

    public AvailabilityService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TimeSpan>> GetAvailableSlotsAsync(DateOnly date, int serviceId)
    {
        var service = await _db.Services.FindAsync(serviceId);
        if (service is null || !service.IsActive)
            return new List<TimeSpan>();

        var workingHours = await _db.WorkingHours
            .FirstOrDefaultAsync(w => w.DayOfWeek == date.DayOfWeek);

        if (workingHours is null || !workingHours.IsWorkingDay)
            return new List<TimeSpan>();

        var blockedDates = await _db.BlockedDates
            .Where(b => b.Date == date)
            .ToListAsync();

        if (blockedDates.Any(b => b.StartTime == null && b.EndTime == null))
            return new List<TimeSpan>();

        var dayStart = date.ToDateTime(TimeOnly.MinValue);

        var existingAppointments = await _db.Appointments
            .Where(a => a.Status != Models.AppointmentStatus.Cancelled
                        && a.StartsAt < dayStart.AddDays(1)
                        && a.EndsAt > dayStart)
            .Select(a => new { a.StartsAt, a.EndsAt })
            .ToListAsync();

        var busyIntervals = existingAppointments
            .Select(a => (Start: a.StartsAt.TimeOfDay, End: a.EndsAt.TimeOfDay))
            .Concat(blockedDates
                .Where(b => b.StartTime != null && b.EndTime != null)
                .Select(b => (Start: b.StartTime!.Value, End: b.EndTime!.Value)))
            .ToList();

        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        var slotGranularityMinutes = settings?.SlotGranularityMinutes ?? 15;

        var duration = TimeSpan.FromMinutes(service.DurationMinutes);
        var slots = new List<TimeSpan>();
        var now = DateTime.Now;
        var isToday = date == DateOnly.FromDateTime(now);

        for (var slotStart = workingHours.StartTime;
             slotStart + duration <= workingHours.EndTime;
             slotStart = slotStart.Add(TimeSpan.FromMinutes(slotGranularityMinutes)))
        {
            var slotEnd = slotStart + duration;

            if (isToday && slotStart <= now.TimeOfDay)
                continue;

            var overlaps = busyIntervals.Any(b => slotStart < b.End && slotEnd > b.Start);
            if (overlaps)
                continue;

            slots.Add(slotStart);
        }

        return slots;
    }

    public async Task<bool> IsSlotAvailableAsync(DateOnly date, int serviceId, TimeSpan startTime)
    {
        var slots = await GetAvailableSlotsAsync(date, serviceId);
        return slots.Contains(startTime);
    }

    public async Task<HashSet<DateOnly>> GetAvailableDaysInMonthAsync(int year, int month, int serviceId)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var result = new HashSet<DateOnly>();

        for (var day = 1; day <= daysInMonth; day++)
        {
            var date = new DateOnly(year, month, day);
            if (date < DateOnly.FromDateTime(DateTime.Now))
                continue;

            var slots = await GetAvailableSlotsAsync(date, serviceId);
            if (slots.Count > 0)
                result.Add(date);
        }

        return result;
    }
}
