using MainService.Data;
using MainService.Dtos;
using MainService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MainService.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]

public class UserController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createDto, CancellationToken ct = default)
    {
        var userName = createDto.UserName?.Trim();
        if (string.IsNullOrWhiteSpace(userName))
        {
            return BadRequest("Username cannot be empty.");       
        }
        var exists = await _context.Users
            .AnyAsync(u => u.UserName == userName, ct);
        if (exists)
        {
            return Conflict($"User with name {createDto.UserName} already exists.");      
        }
        var user = new UserModel()
        {
            UserName = createDto.UserName,
            RoleType = createDto.RoleType
        };
        var hasher = new PasswordHasher<UserModel>();
        user.UserPassword = hasher.HashPassword(user, createDto.UserPassword);
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync(ct);
        return Ok($"User {user.UserName} created successfully.");
    }

    [HttpDelete]
    [Route("delete/{userId:int}")]
    public async Task<IActionResult> DeleteUser(int userId, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .FirstOrDefaultAsync(ct);
        if (user == null)
        {
            return BadRequest($"User with id {userId} not found.");
        }
        
        _context.Users.Remove(user);
        await _context.SaveChangesAsync(ct);
        return Ok($"User with id {userId} deleted successfully.");       
    }

    [HttpGet]
    [Route("get")]
    public async Task<IActionResult> GetUsers(CancellationToken ct = default)
    {
        var users = await _context.Users
            .Select(u => new UserDetailsDto()
            {
                UserId = u.UserId,
                UserName = u.UserName,
                RoleType = u.RoleType
            })
            .ToListAsync(ct);
        if (users.Count() == 0)
        {
            return NotFound($"There are no users.");
        }
        
        return Ok(users);
    }

    [HttpGet]
    [Route("get/{userId:int}")]
    public async Task<IActionResult> GetUser(int userId, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Where(u=>u.UserId == userId)
            .Select(u => new UserDetailsDto()
            {
                UserId = u.UserId,
                UserName = u.UserName,
                RoleType = u.RoleType
            })
            .ToListAsync(ct);
        if (userId != _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => u.UserId)
                .FirstOrDefault())
        {
            return BadRequest($"There are no user with id {userId}.");
        }
        return Ok(user);
    }

    [HttpPut]
    [Route("update/{userId:int}")]
    public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserDto update, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .FirstOrDefaultAsync(ct);
        if (user == null)
        {
            return NotFound($"User with id {userId} not found.");
        }
        
        user.UserName = update.UserName;
        await _context.SaveChangesAsync(ct);
        return Ok($"User with id {userId} updated successfully.");
    }

    [HttpPatch]
    [Route("changeRole/{userId:int}")]
    public async Task<IActionResult> ChangeUserRole(int userId, [FromBody] UpdateRoleDto roleDto, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .FirstOrDefaultAsync(ct);
        if (user == null)
        {
            return NotFound($"User with id {userId} not found.");
        }

        if (user.RoleType == roleDto.RoleType)
        {
            return BadRequest($"User with id {userId} already has role {roleDto.RoleType}.");      
        }
        
        user.RoleType = roleDto.RoleType;
        await _context.SaveChangesAsync(ct);
        return Ok($"User with id {userId} updated successfully.");
    }
}