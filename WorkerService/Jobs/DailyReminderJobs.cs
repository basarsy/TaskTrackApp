using Microsoft.AspNetCore.Http.HttpResults;
using WorkerService.Data;
using WorkerService.Services;

namespace WorkerService.Jobs;

public class DailyReminderJobs
{
    private readonly TaskApiClient _apiClient;
    public DailyReminderJobs(TaskApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task SendIncompleteTasksReminder()
    {
        var tasks = await _apiClient.GetInCompleteTasks();
        Console.WriteLine($"[JOB] Incomplete tasks: {tasks.Count}");
        foreach (var var in tasks)
        {
            Console.WriteLine($"[JOB] Task: {var.TaskName} : {var.TaskDescription}." +
                              $" Assigned to {var.UserId} with priority {var.TaskPriority}." +
                              $"Task status: {var.TaskStatus}");
        }
        
    }

    public async Task SendCompleteTasksReminder()
    {
        var tasks= await _apiClient.GetCompleteTasks();
        Console.WriteLine($"[JOB] Complete tasks: {tasks.Count}. ");
        foreach (var var in tasks)
        {
            Console.WriteLine($"[JOB] Task: {var.TaskName} : {var.TaskDescription}." +
                              $" Assigned to {var.UserId} with priority {var.TaskPriority}." +
                              $"Task status: {var.TaskStatus}");
        }
    }
}