using Microsoft.AspNetCore.Mvc;
using NailSalon.Api.Services;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly AvailabilityService _availability;

    public AvailabilityController(AvailabilityService availability)
    {
        _availability = availability;
    }

    [HttpGet]
    public async Task<ActionResult<List<string>>> GetSlots([FromQuery] int serviceId, [FromQuery] DateOnly date)
    {
        var slots = await _availability.GetAvailableSlotsAsync(date, serviceId);
        return Ok(slots.Select(s => s.ToString(@"hh\:mm")).ToList());
    }

    [HttpGet("month")]
    public async Task<ActionResult<List<string>>> GetAvailableDaysInMonth(
        [FromQuery] int serviceId, [FromQuery] int year, [FromQuery] int month)
    {
        var days = await _availability.GetAvailableDaysInMonthAsync(year, month, serviceId);
        return Ok(days.Select(d => d.ToString("yyyy-MM-dd")).OrderBy(d => d).ToList());
    }
}
