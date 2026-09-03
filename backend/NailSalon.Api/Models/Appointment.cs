namespace NailSalon.Api.Models;

public enum AppointmentStatus
{
    Confirmed,
    Cancelled,
    Completed
}

public class Appointment
{
    public int Id { get; set; }
    public string ClientFirstName { get; set; } = string.Empty;
    public string ClientLastName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string? ClientEmail { get; set; }

    public int ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Confirmed;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ManageToken { get; set; } = Guid.NewGuid();
}
