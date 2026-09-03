namespace NailSalon.Api.DTOs;

public record WorkingHoursDto(int Id, DayOfWeek DayOfWeek, TimeSpan StartTime, TimeSpan EndTime, bool IsWorkingDay);

public record WorkingHoursUpsertDto(TimeSpan StartTime, TimeSpan EndTime, bool IsWorkingDay);

public record BlockedDateDto(int Id, DateOnly Date, TimeSpan? StartTime, TimeSpan? EndTime, string? Reason);

public record CreateBlockedDateDto(DateOnly Date, TimeSpan? StartTime, TimeSpan? EndTime, string? Reason);
