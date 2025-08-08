namespace UserService.Dtos;

public class CreateUserDto
{
    public string UserName { get; set; }
    public string UserPassword { get; set; }
    public bool RoleType { get; set; }
}