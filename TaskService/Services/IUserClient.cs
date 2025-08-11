namespace TaskService.Services;

public interface IUserClient
{
    Task<UserInfo?> GetAsync(int userId,  CancellationToken ct = default);
}
public record UserInfo(int UserId, string UserName);