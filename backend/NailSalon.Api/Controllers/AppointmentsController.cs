using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;
using NailSalon.Api.DTOs;
using NailSalon.Api.Models;
using NailSalon.Api.Services;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AvailabilityService _availability;
    private readonly EmailService _email;

    public AppointmentsController(AppDbContext db, AvailabilityService availability, EmailService email)
    {
        _db = db;
        _availability = availability;
        _email = email;
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> Create(CreateAppointmentDto dto)
    {
        var service = await _db.Services.FindAsync(dto.ServiceId);
        if (service is null || !service.IsActive)
            return BadRequest(new { message = "Serviciul selectat nu este disponibil." });

        var isAvailable = await _availability.IsSlotAvailableAsync(dto.Date, dto.ServiceId, dto.StartTime);
        if (!isAvailable)
            return Conflict(new { message = "Intervalul selectat nu mai este disponibil. Te rugăm alege alt interval." });

        var startsAt = dto.Date.ToDateTime(TimeOnly.FromTimeSpan(dto.StartTime));
        var endsAt = startsAt.AddMinutes(service.DurationMinutes);

        var appointment = new Appointment
        {
            ClientFirstName = dto.ClientFirstName,
            ClientLastName = dto.ClientLastName,
            ClientPhone = dto.ClientPhone,
            ClientEmail = dto.ClientEmail,
            ServiceId = dto.ServiceId,
            StartsAt = startsAt,
            EndsAt = endsAt,
            Notes = dto.Notes
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(dto.ClientEmail))
        {
            var manageUrl = $"{Request.Scheme}://{Request.Host}/programarea-mea/{appointment.ManageToken}";
            var html = $"""
                <p>Bună, {dto.ClientFirstName}!</p>
                <p>Programarea ta a fost confirmată:</p>
                <ul>
                    <li><b>Serviciu:</b> {service.Name}</li>
                    <li><b>Data:</b> {startsAt:dd.MM.yyyy}</li>
                    <li><b>Ora:</b> {startsAt:HH:mm}</li>
                </ul>
                <p>Dacă vrei să anulezi programarea, poți face asta <a href="{manageUrl}">aici</a>.</p>
                """;
            await _email.SendAsync(dto.ClientEmail, "Confirmare programare", html);
        }

        return Ok(ToDto(appointment, service.Name));
    }

    [HttpGet("manage/{token:guid}")]
    public async Task<ActionResult<AppointmentDto>> GetByToken(Guid token)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Service)
            .FirstOrDefaultAsync(a => a.ManageToken == token);

        if (appointment is null) return NotFound();

        return Ok(ToDto(appointment, appointment.Service.Name));
    }

    [HttpPost("manage/{token:guid}/cancel")]
    public async Task<IActionResult> CancelByToken(Guid token)
    {
        var appointment = await _db.Appointments.FirstOrDefaultAsync(a => a.ManageToken == token);
        if (appointment is null) return NotFound();

        appointment.Status = AppointmentStatus.Cancelled;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Programarea a fost anulată." });
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<AppointmentDto>>> GetAll([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var query = _db.Appointments.Include(a => a.Service).AsQueryable();

        if (from is not null)
            query = query.Where(a => a.StartsAt >= from.Value.ToDateTime(TimeOnly.MinValue));
        if (to is not null)
            query = query.Where(a => a.StartsAt < to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue));

        var appointments = await query.OrderBy(a => a.StartsAt).ToListAsync();

        return Ok(appointments.Select(a => ToDto(a, a.Service.Name)).ToList());
    }

    [Authorize]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] AppointmentStatus status)
    {
        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment is null) return NotFound();

        appointment.Status = status;
        await _db.SaveChangesAsync();

        return Ok();
    }

    private static AppointmentDto ToDto(Appointment a, string serviceName) => new(
        a.Id, a.ClientFirstName, a.ClientLastName, a.ClientPhone, a.ClientEmail,
        a.ServiceId, serviceName, a.StartsAt, a.EndsAt, a.Status, a.Notes, a.ManageToken);
}
