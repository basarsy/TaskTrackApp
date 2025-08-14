using System.ComponentModel.DataAnnotations;

namespace MainService.Models;

public class UserModel
{
    [Key]
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string UserPassword { get; set; }
    public bool RoleType { get; set; }
    public bool TaskStatus { get; set; }
}