using WorkerService.Services;

namespace WorkerService.Services;

public class LogMonitoringService : BackgroundService
{
    private readonly ILogger<LogMonitoringService> _logger;
    private readonly IEmailService _emailService;
    private readonly TaskApiClient _taskApiClient;
    private readonly string _logFilePath;
    private long _lastLogPosition = 0;

    public LogMonitoringService(
        ILogger<LogMonitoringService> logger, 
        IEmailService emailService, 
        TaskApiClient taskApiClient,
        IConfiguration configuration)
    {
        _logger = logger;
        _emailService = emailService;
        _taskApiClient = taskApiClient;
        _logFilePath = configuration.GetValue<string>("LogMonitoring:LogFilePath") ?? "/app/logs/mainservice-.log";
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Log Monitoring Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await MonitorLogFiles(stoppingToken);
                await CheckIncompleteTasksReport(stoppingToken);
                
                // Wait for 5 minutes before next check
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Log Monitoring Service");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }

    private async Task MonitorLogFiles(CancellationToken cancellationToken)
    {
        try
        {
            var logDirectory = Path.GetDirectoryName(_logFilePath) ?? "/app/logs";
            if (!Directory.Exists(logDirectory))
            {
                _logger.LogWarning("Log directory does not exist: {LogDirectory}", logDirectory);
                return;
            }

            var logFiles = Directory.GetFiles(logDirectory, "mainservice-*.log")
                .OrderByDescending(f => File.GetLastWriteTime(f))
                .ToArray();

            if (!logFiles.Any())
            {
                _logger.LogWarning("No log files found in: {LogDirectory}", logDirectory);
                return;
            }

            var currentLogFile = logFiles.First();
            var fileInfo = new FileInfo(currentLogFile);
            
            if (fileInfo.Length <= _lastLogPosition)
            {
                return;
            }
            
            using var fileStream = new FileStream(currentLogFile, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            fileStream.Seek(_lastLogPosition, SeekOrigin.Begin);
            
            using var reader = new StreamReader(fileStream);
            var newContent = await reader.ReadToEndAsync(cancellationToken);
            _lastLogPosition = fileInfo.Length;
            
            await AnalyzeLogContent(newContent, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error monitoring log files");
        }
    }

    private async Task AnalyzeLogContent(string logContent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(logContent))
            return;

        var lines = logContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var errorLines = lines.Where(line => 
            line.Contains(" ERR ]") || 
            line.Contains(" ERROR ]") ||
            line.Contains("Exception")).ToList();

        if (errorLines.Any())
        {
            _logger.LogWarning("Found {ErrorCount} error entries in logs", errorLines.Count);
            
            var errorSummary = string.Join("\n", errorLines.Take(10)); // Take first 10 errors
            await SendErrorNotification(errorSummary, errorLines.Count, cancellationToken);
        }
    }

    private async Task SendErrorNotification(string errorSummary, int errorCount, CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"TaskTrack System Alert: {errorCount} Error(s) Detected";
            var body = $@"
System Error Alert - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC

{errorCount} error(s) have been detected in the MainService logs.

Recent Errors:
{errorSummary}

Please check the system logs for more details.

This is an automated message from TaskTrack Log Monitoring Service.
";

            await _emailService.SendEmailAsync("admin@tasktrack.com", subject, body);
            _logger.LogInformation("Error notification sent for {ErrorCount} errors", errorCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send error notification");
        }
    }

    private async Task CheckIncompleteTasksReport(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Checking for incomplete tasks report...");
            
            await Task.CompletedTask; 
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking incomplete tasks");
        }
    }
} 