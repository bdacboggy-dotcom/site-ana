using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;
using NailSalon.Api.DTOs;
using NailSalon.Api.Models;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServicesController(AppDbContext db)
    {
        _db = db;
    }

    // Public: doar serviciile active, pentru pagina de programare
    [HttpGet]
    public async Task<ActionResult<List<ServiceDto>>> GetActive()
    {
        var services = await _db.Services
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new ServiceDto(s.Id, s.Name, s.Description, s.DurationMinutes, s.Price, s.IsActive))
            .ToListAsync();

        return Ok(services);
    }

    // Admin: toate serviciile, inclusiv cele dezactivate
    [Authorize]
    [HttpGet("all")]
    public async Task<ActionResult<List<ServiceDto>>> GetAll()
    {
        var services = await _db.Services
            .OrderBy(s => s.Name)
            .Select(s => new ServiceDto(s.Id, s.Name, s.Description, s.DurationMinutes, s.Price, s.IsActive))
            .ToListAsync();

        return Ok(services);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ServiceDto>> Create(ServiceUpsertDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            DurationMinutes = dto.DurationMinutes,
            Price = dto.Price,
            IsActive = dto.IsActive
        };

        _db.Services.Add(service);
        await _db.SaveChangesAsync();

        return Ok(new ServiceDto(service.Id, service.Name, service.Description, service.DurationMinutes, service.Price, service.IsActive));
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ServiceDto>> Update(int id, ServiceUpsertDto dto)
    {
        var service = await _db.Services.FindAsync(id);
        if (service is null) return NotFound();

        service.Name = dto.Name;
        service.Description = dto.Description;
        service.DurationMinutes = dto.DurationMinutes;
        service.Price = dto.Price;
        service.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();

        return Ok(new ServiceDto(service.Id, service.Name, service.Description, service.DurationMinutes, service.Price, service.IsActive));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await _db.Services.FindAsync(id);
        if (service is null) return NotFound();

        var hasAppointments = await _db.Appointments.AnyAsync(a => a.ServiceId == id);
        if (hasAppointments)
        {
            // Păstrăm istoricul programărilor — doar dezactivăm serviciul.
            service.IsActive = false;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Serviciul are programări asociate și a fost dezactivat în loc de șters." });
        }

        _db.Services.Remove(service);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
