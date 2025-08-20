using Microsoft.AspNetCore.Http.HttpResults;
using WorkerService.Data;
using WorkerService.Services;

namespace WorkerService.Jobs;

public class DailyReminderJobs
{
    private readonly TaskApiClient _apiClient;
    private readonly IEmailService _emailService;
    private readonly ILogger<DailyReminderJobs> _logger;
    public DailyReminderJobs(TaskApiClient apiClient, IEmailService emailService, ILogger<DailyReminderJobs> logger)
    {
        _apiClient = apiClient;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task SendIncompleteTasksReminder()
    {
        var tasks = await _apiClient.GetInCompleteTasks();
        
        Console.WriteLine($"[JOB] Incomplete tasks: {tasks.Count}");
        foreach (var task in tasks)
        {
            Console.WriteLine($"[JOB] Task: {task.TaskName} : {task.TaskDescription}." +
                              $" Assigned to {task.UserId} with priority {task.TaskPriority}." +
                              $"Task status: {task.IsTaskCompleted}");

            await _emailService.SendEmailAsync(
                $"user{task.UserId}@example.com",
                $"Incomplete Task Reminder: {task.TaskName}",
                $"Task '{task.TaskName}' is still incomplete. Please complete it as soon as possible. " +
                $"Task Description: {task.TaskDescription}"
            );
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
                              $"Task status: {var.IsTaskCompleted}");
        }
    }
}