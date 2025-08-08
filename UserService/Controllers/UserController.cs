using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using UserService.Data;
using UserService.Dtos;
using UserService.Models;

namespace UserService.Controllers;

[Route("api/[controller]")]

public class UserController : ControllerBase
{
    private readonly UserDbContext _context;

    public UserController(UserDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    [Route("get")]
    public async Task<IActionResult> GetUsers()
    {
        var users = _context.Users.ToList();
        if (users == null)
        {
            return NotFound($"No users found.");
        }
        return Ok(users);
    }
    
    [HttpGet]
    [Route("get/{userId}")]
    public async Task<IActionResult> GetUser(int userId)
    {
        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
        if (user == null)
        {
            return NotFound($"No user found with id {userId}.");
        }
        
        return Ok(user);
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> CreateUser(CreateUserDto createDto)
    {
        var user = new User()
        {
            UserName = createDto.UserName,
            RoleType = false
        };

        var hasher = new PasswordHasher<User>();
        user.UserPassword = hasher.HashPassword(user, createDto.UserPassword);
        
        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok($"User {user.UserName} created successfully.");
    }
    
    [HttpDelete]
    [Route("delete/{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
        if (user == null)
        {
            return NotFound($"No user found with id {userId}.");
        }
        
        _context.Users.Remove(user);
        _context.SaveChanges();
        return Ok($"User {user.UserName} deleted successfully.");
    }

    [HttpPut]
    [Route("update/{id}")]
    public async Task<IActionResult> UpdateUser(int userId, [FromBody] UserDetailsDto userDto)
    {
        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
        if (user == null)
        {
            return NotFound($"No user found with id {userId}.");
        }
        
        user.UserName = userDto.UserName;
        
        _context.SaveChanges();
        return Ok($"User {user.UserName} updated his name to {userDto.UserName} successfully.");
    }
    
    [HttpPatch]
    [Route("changeRole/{userId}")]
    public async Task<IActionResult> ChangeUserRole(int userId, [FromBody] UserDetailsDto userDto)
    {
        var user = _context.Users
            .Where(u => u.UserId == userId)
            .Select(ur => new UserDetailsDto()
            {
                RoleType = userDto.RoleType
            });
        if (user == null)
        {
            NotFound($"No user found with id {userId}.");
        }
        
        userDto.RoleType = !userDto.RoleType;
        
        _context.SaveChanges();
        return Ok($"User with id {userId}'s role has been changed to {userDto.RoleType}.");
    }
}