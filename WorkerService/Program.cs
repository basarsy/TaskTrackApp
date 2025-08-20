using Hangfire;
using Hangfire.Dashboard.BasicAuthorization;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using WorkerService;
using WorkerService.Data;
using WorkerService.Jobs;
using WorkerService.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<TaskApiClient>(client =>
    client.BaseAddress = new Uri("http://mainservice:8080/"));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddLogging();

builder.Services.AddScoped<IEmailService, FakeEmailService>();

builder.Services.AddHostedService<Worker>();
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
    
RecurringJob.AddOrUpdate<DailyReminderJobs>(
    "check-incomplete-tasks",
    job => job.SendIncompleteTasksReminder(),
    "0 2 * * *"
    );

app.Run();
