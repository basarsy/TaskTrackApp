using System.Net;

namespace TaskService.Services;

public class UserClient: IUserClient
{
    private readonly HttpClient _httpClient;
    public UserClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<UserInfo?> GetAsync(int userId, CancellationToken ct = default)
    {
        var response = await _httpClient.GetAsync($"api/users/exists/{userId}", ct);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<UserInfo>(cancellationToken: ct);
    }
}