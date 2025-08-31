using Hangfire;
using Hangfire.Dashboard.BasicAuthorization;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using WorkerService;
using WorkerService.Data;
using WorkerService.Jobs;
using WorkerService.Services;
using Serilog;
using Serilog.Events;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .MinimumLevel.Override("Hangfire", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File("logs/workerservice-.log", 
        rollingInterval: RollingInterval.Day,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
        retainedFileCountLimit: 30)
    .CreateLogger();

try
{
    Log.Information("Starting WorkerService application");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

    builder.Services.AddHttpClient<TaskApiClient>(client =>
        client.BaseAddress = new Uri("http://mainservice:8080/"));

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddSingleton<IEmailService, FakeEmailService>();
    builder.Services.AddScoped<TaskCleanupService>();

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    builder.Services.AddHostedService<Worker>();
    builder.Services.AddHostedService<LogMonitoringService>();

    builder.Services.AddHangfire(config =>
        config.UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
    builder.Services.AddHangfireServer();

    var app = builder.Build();

    var hfUser = builder.Configuration["HangfireDashboard:User"] ?? "admin";
    var hfPass = builder.Configuration["HangfireDashboard:Password"] ?? "admin123";
    var requireSsl = bool.TryParse(builder.Configuration["HangfireDashboard:RequireSsl"], out var r) && r;
    app.MapHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[]
        {
            new BasicAuthAuthorizationFilter(new BasicAuthAuthorizationFilterOptions
            {
                RequireSsl = requireSsl,
                SslRedirect = false,
                LoginCaseSensitive = true,
                Users = new[]
                {
                    new BasicAuthAuthorizationUser
                    {
                        Login = hfUser,
                        PasswordClear = hfPass
                    }
                }
            })
        }
    });

    // Configure Swagger
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "WorkerService API V1");
            c.RoutePrefix = "swagger";
        });
    }

    app.MapControllers();
        
    RecurringJob.AddOrUpdate<DailyReminderJobs>(
        "check-incomplete-tasks",
        job => job.SendIncompleteTasksReminder(),
        "0 2 * * *"
        );

    Log.Information("WorkerService started successfully");
    Log.Information("Hangfire Dashboard available at: /hangfire");
    Log.Information("API endpoints available at: /api/jobs");
    if (app.Environment.IsDevelopment())
    {
        Log.Information("Swagger UI available at: /swagger");
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
