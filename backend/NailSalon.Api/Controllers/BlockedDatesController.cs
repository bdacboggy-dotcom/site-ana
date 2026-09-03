using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;
using NailSalon.Api.DTOs;
using NailSalon.Api.Models;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/admin/blocked-dates")]
[Authorize]
public class BlockedDatesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BlockedDatesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlockedDateDto>>> GetAll([FromQuery] DateOnly? from)
    {
        var query = _db.BlockedDates.AsQueryable();
        if (from is not null)
            query = query.Where(b => b.Date >= from.Value);

        var dates = await query
            .OrderBy(b => b.Date)
            .Select(b => new BlockedDateDto(b.Id, b.Date, b.StartTime, b.EndTime, b.Reason))
            .ToListAsync();

        return Ok(dates);
    }

    [HttpPost]
    public async Task<ActionResult<BlockedDateDto>> Create(CreateBlockedDateDto dto)
    {
        var blocked = new BlockedDate
        {
            Date = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Reason = dto.Reason
        };

        _db.BlockedDates.Add(blocked);
        await _db.SaveChangesAsync();

        return Ok(new BlockedDateDto(blocked.Id, blocked.Date, blocked.StartTime, blocked.EndTime, blocked.Reason));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var blocked = await _db.BlockedDates.FindAsync(id);
        if (blocked is null) return NotFound();

        _db.BlockedDates.Remove(blocked);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
