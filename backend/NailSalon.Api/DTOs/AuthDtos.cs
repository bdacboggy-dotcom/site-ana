namespace NailSalon.Api.DTOs;

public record LoginDto(string Email, string Password);

public record LoginResponseDto(string Token, string Email);
