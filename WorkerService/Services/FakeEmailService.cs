namespace WorkerService.Services;

public class FakeEmailService : IEmailService
{
    private readonly ILogger<FakeEmailService> _logger;
    public FakeEmailService(ILogger<FakeEmailService> logger)
    {
        _logger = logger;
    }
    public Task SendEmailAsync(string email, string subject, string body)
    {
        _logger.LogInformation($"[MOCK EMAIL] sent to {email}" +
                               $"Subject: {subject}" +
                               $"Message: {body}", email, subject, body);
        return Task.CompletedTask;
    }
}