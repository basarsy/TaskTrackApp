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
    public AuthController(AppDbContext context, JwtTokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }
    
    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login(UserAuthDto authDto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == authDto.UserName);
        if (user == null)
        {
            return Unauthorized("Invalid username or password.");       
        }
        var hasher = new PasswordHasher<UserModel>();
        var result = hasher.VerifyHashedPassword(user, user.UserPassword, authDto.UserPassword);
        if (result != PasswordVerificationResult.Success)
        {
            return Unauthorized("Invalid username or password.");      
        }
        
        var token = _tokenService.GenerateToken(user);
        return Ok(token);
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