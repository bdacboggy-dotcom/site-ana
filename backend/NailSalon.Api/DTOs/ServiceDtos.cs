namespace NailSalon.Api.DTOs;

public record ServiceDto(int Id, string Name, string? Description, int DurationMinutes, decimal Price, bool IsActive);

public record ServiceUpsertDto(string Name, string? Description, int DurationMinutes, decimal Price, bool IsActive);
