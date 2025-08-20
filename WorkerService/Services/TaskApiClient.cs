using WorkerService.Enums;
using System.Net.Http.Json;

namespace WorkerService.Services;

public class TaskApiClient
{
    private readonly HttpClient _client;
    public TaskApiClient(HttpClient client)
    {
        _client = client;
    }

    public async Task<List<TaskDto>> GetInCompleteTasks()
    {
        var result = await _client.GetFromJsonAsync<List<TaskDto>>("api/task/getIncompleteTasks");
        return result ?? new List<TaskDto>();
    }

    public async Task<List<TaskDto>> GetCompleteTasks()
    {
        var result = await _client.GetFromJsonAsync<List<TaskDto>>("api/task/getCompleteTasks");
        return result ?? new List<TaskDto>(); 
    }
    
    
}

public class TaskDto
{
    public int TaskId { get; set; }
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
    public bool IsTaskCompleted { get; set; }
    public TaskPriority? TaskPriority { get; set; }
    public DateTime TaskDate { get; set; }
    public int? UserId { get; set; }
}