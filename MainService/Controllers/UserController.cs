using MainService.Data;
using MainService.Dtos;
using MainService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MainService.Controllers;

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
    [Route("/create")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createDto)
    {
        var user = new UserModel()
        {
            UserName = createDto.UserName,
            RoleType = false
        };
        if (createDto.UserName == _context.Users.Select(u => u.UserName).FirstOrDefault())
        {
            return BadRequest($"User with name {createDto.UserName} already exists.");
        }
        var hasher = new PasswordHasher<UserModel>();
        user.UserPassword = hasher.HashPassword(user, createDto.UserPassword);
        
        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok($"User {user.UserName} created successfully.");
    }

    [HttpDelete]
    [Route("/delete/{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .FirstOrDefaultAsync();
        if (user == null)
        {
            return BadRequest($"User with id {userId} not found.");
        }
        
        _context.Users.Remove(user);
        _context.SaveChanges();
        return Ok($"User with id {userId} deleted successfully.");       
    }

    [HttpGet]
    [Route("/get")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserDetailsDto()
            {
                UserId = u.UserId,
                UserName = u.UserName,
                RoleType = u.RoleType
            })
            .ToListAsync();
        if (users.Count() == 0)
        {
            return NotFound($"There are no users.");
        }
        
        return Ok(users);
    }

    [HttpGet]
    [Route("/get/[userId]")]
    public async Task<IActionResult> GetUser(int userId)
    {
        var user = await _context.Users
            .Select(u => new UserDetailsDto()
            {
                UserId = u.UserId,
                UserName = u.UserName,
                RoleType = u.RoleType
            })
            .ToListAsync();
        if (userId != _context.Users.Select(u => u.UserId).FirstOrDefault())
        {
            return NotFound($"User with id {userId} not found.");
        }
        
        return Ok(user);
    }

    [HttpPut]
    [Route("update/[userId]")]
    public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserDetailsDto userDto)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound($"User with id {userId} not found.");
        }
        
        user.UserName = userDto.UserName;
        _context.SaveChanges();
        return Ok($"User with id {userId} updated successfully.");
    }

    [HttpPatch]
    [Route("changeRole/[userId]")]
    public async Task<IActionResult> ChangeUserRole(int userId, [FromBody] UserDetailsDto userDto)
    {
        var user = await _context.Users
            .Where(u => u.UserId == userId)
            .FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound($"User with id {userId} not found.");
        }

        if (user.RoleType == userDto.RoleType)
        {
            return BadRequest($"User with id {userId} already has role {userDto.RoleType}.");      
        }
        
        user.RoleType = userDto.RoleType;
        _context.SaveChanges();
        return Ok($"User with id {userId} updated successfully.");
    }
}