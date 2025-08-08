using System.ComponentModel.DataAnnotations;

namespace UserService.Models;

public class User
{
    [Key]
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string UserPassword { get; set; }
    public bool RoleType { get; set; }
}