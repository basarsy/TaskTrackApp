using MainService.Data;
using MainService.Dtos;
using MainService.Enums;
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
    private readonly ILogger<AuthController> _logger;
    
    public AuthController(AppDbContext context, JwtTokenService tokenService, ILogger<AuthController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }
    
    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login(UserAuthDto authDto)
    {
        _logger.LogInformation("Login attempt for user: {Username}", authDto.UserName);
        
        try
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == authDto.UserName);
            if (user == null)
            {
                _logger.LogWarning("Login failed: User not found - {Username}", authDto.UserName);
                return BadRequest("Invalid username or password.");
            }

            var hasher = new PasswordHasher<UserModel>();
            var result = hasher.VerifyHashedPassword(user, user.UserPassword, authDto.UserPassword);

            if (result == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Login failed: Invalid password for user - {Username}", authDto.UserName);
                return BadRequest("Invalid username or password.");
            }

            var token = _tokenService.GenerateToken(user);
            _logger.LogInformation("Login successful for user: {Username} (ID: {UserId})", authDto.UserName, user.UserId);
            
            return Ok(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {Username}", authDto.UserName);
            return StatusCode(500, "An error occurred during login.");
        }
    }

    [AllowAnonymous]
    [HttpGet]
    [Route("authtest/{userId:int}")]
    public async Task<IActionResult> AuthTest(CancellationToken ct = default)
    {
        if (User.IsInRole("Admin"))
        {
            return Ok("Admin");
        }
        if (User.IsInRole("User"))
        {
            return Ok("User");
        }
        return Unauthorized("Unauthorized");
    }
}