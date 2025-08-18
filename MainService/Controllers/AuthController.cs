using MainService.Data;
using MainService.Dtos;
using MainService.Models;
using MainService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MainService.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtTokenService _tokenService;
    public AuthController(AppDbContext context, JwtTokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }
    
    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login(UserAuthDto authDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == authDto.UserName);
        if (user == null)
        {
            return Unauthorized();
        }
        
        var hasher = new PasswordHasher<UserModel>();
        var result = hasher.VerifyHashedPassword(user, user.UserPassword, authDto.UserPassword);
        if (result != PasswordVerificationResult.Success)
        {
            return Unauthorized("Username or password is incorrect.");
        }

        var token = _tokenService.GenerateToken();
        return Ok(token);
    }

    [Authorize]
    [HttpGet]
    [Route("authtest")]
    public async Task<IActionResult> AuthTest(CancellationToken ct = default)
    {
        var users = await _context.Users
            .Select(u => new UserDetailsDto()
            {
                UserId = u.UserId,
                UserName = u.UserName
            })
            .ToListAsync(ct);
        
        return Ok(users);
    }
}