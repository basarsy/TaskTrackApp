using Hangfire;

namespace WorkerService.Services;

public class TaskCleanupService
{
    private readonly ILogger<TaskCleanupService> _logger;
    private readonly TaskApiClient _taskApiClient;
    private readonly IEmailService _emailService;

    public TaskCleanupService(
        ILogger<TaskCleanupService> logger,
        TaskApiClient taskApiClient,
        IEmailService emailService)
    {
        _logger = logger;
        _taskApiClient = taskApiClient;
        _emailService = emailService;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task CleanupCompletedTasksAsync(int daysOld = 30)
    {
        _logger.LogInformation("Starting task cleanup job for tasks older than {DaysOld} days", daysOld);
        
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
            var cleanupSummary = new TaskCleanupSummary();
            
            _logger.LogInformation("Cleanup cutoff date: {CutoffDate}", cutoffDate);
            
            // In a real implementation, you would:
            // 1. Get all completed tasks older than cutoff date
            // 2. Archive or delete them
            // 3. Update related data
            
            // Mock implementation:
            await SimulateTaskCleanup(cutoffDate, cleanupSummary);
            
            // Send completion notification
            await SendCleanupNotification(cleanupSummary);
            
            _logger.LogInformation("Task cleanup completed. Tasks processed: {ProcessedCount}, Errors: {ErrorCount}", 
                cleanupSummary.ProcessedCount, cleanupSummary.ErrorCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during task cleanup job");
            await SendCleanupErrorNotification(ex);
            throw; // Re-throw to trigger Hangfire retry
        }
    }

    [AutomaticRetry(Attempts = 2)]
    public async Task CleanupOrphanedTasksAsync()
    {
        _logger.LogInformation("Starting orphaned tasks cleanup job");
        
        try
        {
            var cleanupSummary = new TaskCleanupSummary();
            
            // Mock implementation for orphaned tasks cleanup
            await SimulateOrphanedTasksCleanup(cleanupSummary);
            
            await SendOrphanedTasksCleanupNotification(cleanupSummary);
            
            _logger.LogInformation("Orphaned tasks cleanup completed. Tasks processed: {ProcessedCount}", 
                cleanupSummary.ProcessedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during orphaned tasks cleanup job");
            throw;
        }
    }

    [AutomaticRetry(Attempts = 1)]
    public async Task GenerateTaskReportAsync()
    {
        _logger.LogInformation("Generating task statistics report");
        
        try
        {
            var report = await GenerateTaskStatistics();
            await SendTaskReport(report);
            
            _logger.LogInformation("Task report generated and sent successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating task report");
            throw;
        }
    }

    private async Task SimulateTaskCleanup(DateTime cutoffDate, TaskCleanupSummary summary)
    {
        // Simulate processing tasks
        await Task.Delay(TimeSpan.FromSeconds(2));
        
        // Mock data
        summary.ProcessedCount = Random.Shared.Next(10, 50);
        summary.DeletedCount = Random.Shared.Next(5, summary.ProcessedCount);
        summary.ArchivedCount = summary.ProcessedCount - summary.DeletedCount;
        summary.ErrorCount = Random.Shared.Next(0, 3);
        
        _logger.LogInformation("Simulated cleanup: {ProcessedCount} processed, {DeletedCount} deleted, {ArchivedCount} archived",
            summary.ProcessedCount, summary.DeletedCount, summary.ArchivedCount);
    }

    private async Task SimulateOrphanedTasksCleanup(TaskCleanupSummary summary)
    {
        await Task.Delay(TimeSpan.FromSeconds(1));
        
        summary.ProcessedCount = Random.Shared.Next(0, 10);
        summary.DeletedCount = summary.ProcessedCount;
        
        _logger.LogInformation("Simulated orphaned tasks cleanup: {ProcessedCount} orphaned tasks removed",
            summary.ProcessedCount);
    }

    private async Task<TaskStatisticsReport> GenerateTaskStatistics()
    {
        await Task.Delay(TimeSpan.FromSeconds(3));
        
        // Mock statistics
        return new TaskStatisticsReport
        {
            TotalTasks = Random.Shared.Next(100, 500),
            CompletedTasks = Random.Shared.Next(50, 200),
            PendingTasks = Random.Shared.Next(20, 100),
            OverdueTasks = Random.Shared.Next(0, 20),
            TasksCreatedToday = Random.Shared.Next(5, 25),
            TasksCompletedToday = Random.Shared.Next(3, 20),
            GeneratedAt = DateTime.UtcNow
        };
    }

    private async Task SendCleanupNotification(TaskCleanupSummary summary)
    {
        var subject = "TaskTrack - Cleanup Job Completed";
        var body = $@"
Task Cleanup Job Completed - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC

Cleanup Summary:
- Tasks Processed: {summary.ProcessedCount}
- Tasks Deleted: {summary.DeletedCount}
- Tasks Archived: {summary.ArchivedCount}
- Errors Encountered: {summary.ErrorCount}

The cleanup job has completed successfully.

This is an automated message from TaskTrack Cleanup Service.
";

        await _emailService.SendEmailAsync("admin@tasktrack.com", subject, body);
    }

    private async Task SendOrphanedTasksCleanupNotification(TaskCleanupSummary summary)
    {
        var subject = "TaskTrack - Orphaned Tasks Cleanup Completed";
        var body = $@"
Orphaned Tasks Cleanup Job Completed - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC

Cleanup Summary:
- Orphaned Tasks Found: {summary.ProcessedCount}
- Orphaned Tasks Removed: {summary.DeletedCount}

The orphaned tasks cleanup job has completed successfully.

This is an automated message from TaskTrack Cleanup Service.
";

        await _emailService.SendEmailAsync("admin@tasktrack.com", subject, body);
    }

    private async Task SendTaskReport(TaskStatisticsReport report)
    {
        var subject = "TaskTrack - Daily Task Statistics Report";
        var body = $@"
Daily Task Statistics Report - {report.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC

Current Statistics:
- Total Tasks: {report.TotalTasks}
- Completed Tasks: {report.CompletedTasks}
- Pending Tasks: {report.PendingTasks}
- Overdue Tasks: {report.OverdueTasks}

Today's Activity:
- Tasks Created: {report.TasksCreatedToday}
- Tasks Completed: {report.TasksCompletedToday}

Completion Rate: {(report.TotalTasks > 0 ? (double)report.CompletedTasks / report.TotalTasks * 100 : 0):F1}%

This is an automated message from TaskTrack Reporting Service.
";

        await _emailService.SendEmailAsync("admin@tasktrack.com", subject, body);
    }

    private async Task SendCleanupErrorNotification(Exception ex)
    {
        var subject = "TaskTrack - Cleanup Job Failed";
        var body = $@"
Task Cleanup Job Failed - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC

Error Details:
{ex.Message}

Stack Trace:
{ex.StackTrace}

Please check the system logs for more details.

This is an automated message from TaskTrack Cleanup Service.
";

        try
        {
            await _emailService.SendEmailAsync("admin@tasktrack.com", subject, body);
        }
        catch (Exception emailEx)
        {
            _logger.LogError(emailEx, "Failed to send cleanup error notification");
        }
    }
}

public class TaskCleanupSummary
{
    public int ProcessedCount { get; set; }
    public int DeletedCount { get; set; }
    public int ArchivedCount { get; set; }
    public int ErrorCount { get; set; }
}

public class TaskStatisticsReport
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int TasksCreatedToday { get; set; }
    public int TasksCompletedToday { get; set; }
    public DateTime GeneratedAt { get; set; }
} 