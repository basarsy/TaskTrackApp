using MainService.Models;

namespace MainService.Dtos;
using MainService.Enums;

public class UpdateRoleDto
{
    public RoleType RoleType { get; set; }
}