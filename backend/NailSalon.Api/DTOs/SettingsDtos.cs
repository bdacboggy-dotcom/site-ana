namespace NailSalon.Api.DTOs;

public record SettingsDto(int SlotGranularityMinutes);

public record UpdateSettingsDto(int SlotGranularityMinutes);
