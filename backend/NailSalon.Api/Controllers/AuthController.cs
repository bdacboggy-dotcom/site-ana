using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NailSalon.Api.Data;
using NailSalon.Api.DTOs;
using NailSalon.Api.Services;

namespace NailSalon.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
    {
        var user = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email sau parolă incorectă." });

        var token = _tokenService.GenerateToken(user);
        return Ok(new LoginResponseDto(token, user.Email));
    }
}
