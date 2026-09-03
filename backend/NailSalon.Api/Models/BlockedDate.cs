namespace NailSalon.Api.Models;

public class BlockedDate
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public string? Reason { get; set; }
}
