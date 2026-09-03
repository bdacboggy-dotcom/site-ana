using NailSalon.Api.Models;

namespace NailSalon.Api.DTOs;

public record CreateAppointmentDto(
    string ClientFirstName,
    string ClientLastName,
    string ClientPhone,
    string? ClientEmail,
    int ServiceId,
    DateOnly Date,
    TimeSpan StartTime,
    string? Notes);

public record AppointmentDto(
    int Id,
    string ClientFirstName,
    string ClientLastName,
    string ClientPhone,
    string? ClientEmail,
    int ServiceId,
    string ServiceName,
    DateTime StartsAt,
    DateTime EndsAt,
    AppointmentStatus Status,
    string? Notes,
    Guid ManageToken);
