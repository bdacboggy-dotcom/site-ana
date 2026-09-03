using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;
using NailSalon.Api.DTOs;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/admin/working-hours")]
[Authorize]
public class WorkingHoursController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkingHoursController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkingHoursDto>>> GetAll()
    {
        var hours = await _db.WorkingHours
            .OrderBy(w => w.DayOfWeek)
            .Select(w => new WorkingHoursDto(w.Id, w.DayOfWeek, w.StartTime, w.EndTime, w.IsWorkingDay))
            .ToListAsync();

        return Ok(hours);
    }

    [HttpPut("{dayOfWeek}")]
    public async Task<ActionResult<WorkingHoursDto>> Update(DayOfWeek dayOfWeek, WorkingHoursUpsertDto dto)
    {
        var hours = await _db.WorkingHours.FirstOrDefaultAsync(w => w.DayOfWeek == dayOfWeek);
        if (hours is null)
        {
            hours = new Models.WorkingHours { DayOfWeek = dayOfWeek };
            _db.WorkingHours.Add(hours);
        }

        hours.StartTime = dto.StartTime;
        hours.EndTime = dto.EndTime;
        hours.IsWorkingDay = dto.IsWorkingDay;

        await _db.SaveChangesAsync();

        return Ok(new WorkingHoursDto(hours.Id, hours.DayOfWeek, hours.StartTime, hours.EndTime, hours.IsWorkingDay));
    }
}
