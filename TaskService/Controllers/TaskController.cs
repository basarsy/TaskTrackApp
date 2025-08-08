using Microsoft.AspNetCore.Mvc;
using TaskService.Data;
using TaskService.Dtos;
using TaskService.Models;

namespace TaskService.Controllers;


[Route("api/{controller}")]
[ApiController]
public class TaskController : ControllerBase
{
    private readonly TaskDbContext _context;
    public TaskController(TaskDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Route("getTasks")]
    public IActionResult GetTasks()
    {
        var tasks = _context.Tasks
            .Select(t => new TaskDetailsDto()
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskDescription = t.TaskDescription,
                TaskDate = t.TaskDate,
                TaskStatus = t.TaskStatus,
                TaskPriority = t.TaskPriority
            });
        
        return Ok(tasks);
    }
    
    [HttpGet]
    [Route("getTask/{taskId}")]
    public IActionResult GetTask(int taskId)
    {
        var task = _context.Tasks
            .Where(t => t.TaskId == taskId)
            .Select(t => new TaskDetailsDto()
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskDescription = t.TaskDescription,
                TaskDate = t.TaskDate
            });
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        return Ok(task);
    }

    [HttpPost]
    [Route("createTask")]
    public async Task<IActionResult> CreateTask([FromBody]CreateTaskDto taskDto)
    {
        if (string.IsNullOrWhiteSpace(taskDto.TaskName))
        {
            return BadRequest("TaskName is required.");
        }
        var exists = _context.Tasks.Any(t => t.TaskName == taskDto.TaskName);
        if (exists)
        {
            return BadRequest("Task with this name already exists.");
        }

        var task = new TaskItem()
        {
            TaskName = taskDto.TaskName,
            TaskDescription = taskDto.TaskDescription,
            TaskStatus = false,
            TaskPriority = null,
            TaskDate = DateTime.UtcNow
        };
        
        _context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok($"Task {task.TaskName} created successfully.");
        
    }
    
}