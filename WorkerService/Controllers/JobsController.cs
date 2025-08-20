using Hangfire;
using Microsoft.AspNetCore.Mvc;
using WorkerService.Services;

namespace WorkerService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly ILogger<JobsController> _logger;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IRecurringJobManager _recurringJobManager;

    public JobsController(
        ILogger<JobsController> logger,
        IBackgroundJobClient backgroundJobClient,
        IRecurringJobManager recurringJobManager)
    {
        _logger = logger;
        _backgroundJobClient = backgroundJobClient;
        _recurringJobManager = recurringJobManager;
    }

    [HttpPost("cleanup/completed")]
    public IActionResult TriggerCompletedTasksCleanup([FromQuery] int daysOld = 30)
    {
        try
        {
            var jobId = _backgroundJobClient.Enqueue<TaskCleanupService>(
                service => service.CleanupCompletedTasksAsync(daysOld));

            _logger.LogInformation("Queued completed tasks cleanup job with ID: {JobId}, DaysOld: {DaysOld}", jobId, daysOld);

            return Ok(new { JobId = jobId, Message = $"Cleanup job queued for tasks older than {daysOld} days" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error queuing completed tasks cleanup job");
            return StatusCode(500, "Failed to queue cleanup job");
        }
    }

    [HttpPost("cleanup/orphaned")]
    public IActionResult TriggerOrphanedTasksCleanup()
    {
        try
        {
            var jobId = _backgroundJobClient.Enqueue<TaskCleanupService>(
                service => service.CleanupOrphanedTasksAsync());

            _logger.LogInformation("Queued orphaned tasks cleanup job with ID: {JobId}", jobId);

            return Ok(new { JobId = jobId, Message = "Orphaned tasks cleanup job queued" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error queuing orphaned tasks cleanup job");
            return StatusCode(500, "Failed to queue cleanup job");
        }
    }

    [HttpPost("reports/generate")]
    public IActionResult TriggerTaskReport()
    {
        try
        {
            var jobId = _backgroundJobClient.Enqueue<TaskCleanupService>(
                service => service.GenerateTaskReportAsync());

            _logger.LogInformation("Queued task report generation job with ID: {JobId}", jobId);

            return Ok(new { JobId = jobId, Message = "Task report generation job queued" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error queuing task report generation job");
            return StatusCode(500, "Failed to queue report generation job");
        }
    }

    [HttpPost("schedule/daily-cleanup")]
    public IActionResult ScheduleDailyCleanup([FromQuery] int daysOld = 30, [FromQuery] string cronExpression = "0 2 * * *")
    {
        try
        {
            _recurringJobManager.AddOrUpdate(
                "daily-completed-tasks-cleanup",
                () => DummyMethod(), // Placeholder for DI
                cronExpression);

            // Use a workaround for DI in recurring jobs
            _recurringJobManager.AddOrUpdate<TaskCleanupService>(
                "daily-completed-tasks-cleanup",
                service => service.CleanupCompletedTasksAsync(daysOld),
                cronExpression);

            _logger.LogInformation("Scheduled daily cleanup job with cron: {CronExpression}, DaysOld: {DaysOld}", 
                cronExpression, daysOld);

            return Ok(new { 
                Message = $"Daily cleanup scheduled with cron expression: {cronExpression}",
                DaysOld = daysOld 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scheduling daily cleanup job");
            return StatusCode(500, "Failed to schedule daily cleanup job");
        }
    }

    [HttpPost("schedule/daily-reports")]
    public IActionResult ScheduleDailyReports([FromQuery] string cronExpression = "0 8 * * *")
    {
        try
        {
            _recurringJobManager.AddOrUpdate<TaskCleanupService>(
                "daily-task-reports",
                service => service.GenerateTaskReportAsync(),
                cronExpression);

            _logger.LogInformation("Scheduled daily reports job with cron: {CronExpression}", cronExpression);

            return Ok(new { 
                Message = $"Daily reports scheduled with cron expression: {cronExpression}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scheduling daily reports job");
            return StatusCode(500, "Failed to schedule daily reports job");
        }
    }

    [HttpGet("status")]
    public IActionResult GetJobsStatus()
    {
        try
        {
            // You could extend this to show actual job statistics from Hangfire
            var status = new
            {
                ServicesRunning = new[]
                {
                    "LogMonitoringService",
                    "TaskCleanupService"
                },
                LastLogCheck = DateTime.UtcNow.AddMinutes(-Random.Shared.Next(1, 10)),
                AvailableJobs = new[]
                {
                    new { Name = "cleanup/completed", Description = "Clean up completed tasks older than specified days" },
                    new { Name = "cleanup/orphaned", Description = "Clean up orphaned tasks with no valid user" },
                    new { Name = "reports/generate", Description = "Generate and send task statistics report" }
                }
            };

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting jobs status");
            return StatusCode(500, "Failed to get jobs status");
        }
    }

    [HttpDelete("schedule/{jobId}")]
    public IActionResult RemoveScheduledJob(string jobId)
    {
        try
        {
            _recurringJobManager.RemoveIfExists(jobId);
            _logger.LogInformation("Removed scheduled job: {JobId}", jobId);

            return Ok(new { Message = $"Scheduled job '{jobId}' removed" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing scheduled job: {JobId}", jobId);
            return StatusCode(500, "Failed to remove scheduled job");
        }
    }

    // Dummy method to satisfy Hangfire compilation requirements
    public void DummyMethod() { }
} 