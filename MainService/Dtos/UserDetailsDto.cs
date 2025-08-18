using MainService.Models;

namespace MainService.Dtos;
using MainService.Enums;

public class UserDetailsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public RoleType RoleType { get; set; }
}