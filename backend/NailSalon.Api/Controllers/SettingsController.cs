using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;
using NailSalon.Api.DTOs;
using NailSalon.Api.Models;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SettingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<SettingsDto>> Get()
    {
        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        return Ok(new SettingsDto(settings?.SlotGranularityMinutes ?? 15));
    }

    [HttpPut]
    public async Task<ActionResult<SettingsDto>> Update(UpdateSettingsDto dto)
    {
        if (dto.SlotGranularityMinutes < 5 || dto.SlotGranularityMinutes > 240)
            return BadRequest(new { message = "Intervalul trebuie să fie între 5 și 240 de minute." });

        var settings = await _db.AppSettings.FirstOrDefaultAsync();
        if (settings is null)
        {
            settings = new AppSettings();
            _db.AppSettings.Add(settings);
        }

        settings.SlotGranularityMinutes = dto.SlotGranularityMinutes;
        await _db.SaveChangesAsync();

        return Ok(new SettingsDto(settings.SlotGranularityMinutes));
    }
}
