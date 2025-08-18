using MainService.Models;

namespace MainService.Dtos;
using MainService.Enums;

public class CreateUserDto
{
    public string UserName { get; set; }
    public string UserPassword { get; set; }
    public RoleType RoleType { get; set; } = RoleType.User;
}