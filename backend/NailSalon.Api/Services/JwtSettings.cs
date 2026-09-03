namespace NailSalon.Api.Services;

public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "NailSalon.Api";
    public int ExpiryHours { get; set; } = 24;
}
