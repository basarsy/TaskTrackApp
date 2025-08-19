using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using WorkerService;
using WorkerService.Data;
using WorkerService.Jobs;
using WorkerService.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<TaskApiClient>(client =>
    client.BaseAddress = new Uri("http://localhost:5082/"));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddLogging();

builder.Services.AddHostedService<Worker>();
builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

var app = builder.Build();

app.MapHangfireDashboard("/hangfire");
app.UseHangfireDashboard();

RecurringJob.AddOrUpdate<DailyReminderJobs>(
    "check-incomplete-tasks",
    job => job.SendIncompleteTasksReminder(),
    "0 2 * * *"
    );

app.Run();
