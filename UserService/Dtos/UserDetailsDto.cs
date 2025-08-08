using UserService.Models;

namespace UserService.Dtos;

public class UserDetailsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public bool RoleType { get; set;}
}