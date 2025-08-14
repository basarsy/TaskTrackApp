namespace MainService.Dtos;

public class CreateUserDto
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string UserPassword { get; set; }
    public bool RoleType { get; set; }
}