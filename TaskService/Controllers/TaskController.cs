using Microsoft.AspNetCore.Mvc;
using TaskService.Data;
using TaskService.Dtos;
using TaskService.Models;

namespace TaskService.Controllers;


[Route("api/[controller]")]
[ApiController]
public class TaskController : ControllerBase
{
    private readonly TaskDbContext _context;
    public TaskController(TaskDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Route("get")]
    public async Task<IActionResult> GetTasks()
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
            })
            .ToList();
        if (tasks.Count == 0)
        {
            return NotFound($"There are no tasks.");
        }
        
        return Ok(tasks);
    }
    
    [HttpGet]
    [Route("get/{taskId}")]
    public async Task<IActionResult> GetTask(int taskId)
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
        if (taskId != _context.Tasks
                .Where(t => t.TaskId == taskId)
                .Select(t => t.TaskId)
                .FirstOrDefault())
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        return Ok(task);
    }

    [HttpPost]
    [Route("create")]
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
            TaskPriority = 0,
            TaskDate = DateTime.UtcNow
        };
        
        _context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok($"Task {task.TaskName} created successfully.");
        
    }
    
    [HttpDelete]
    [Route("delete/{taskId}")]
    public async Task<IActionResult> DeleteTask(int taskId)
    {
        var task = _context.Tasks
            .FirstOrDefault(t => t.TaskId == taskId);
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        
        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok($"Task {task.TaskName} deleted successfully.");
    }

    [HttpPut]
    [Route("update/{taskId}")]
    public async Task<IActionResult> UpdateTask(int taskId, [FromBody] UpdateTaskDto updateDto)
    {
        var task = _context.Tasks
            .FirstOrDefault(t => t.TaskId == taskId);
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        
        task.TaskName = updateDto.TaskName;
        task.TaskDescription = updateDto.TaskDescription;
        
        _context.SaveChanges();
        return Ok($"Task {task.TaskName} updated successfully.");
    }
    
    [HttpPatch]
    [Route("prio/{taskId}")]
    public async Task<IActionResult> PrioritizeTask(int taskId, [FromBody] PrioritizeTaskDto prioritizeDto)
    {
        var task = _context.Tasks
            .FirstOrDefault(t => t.TaskId == taskId);
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (task.TaskPriority == prioritizeDto.TaskPriority)
        {
            return BadRequest($"Task {task.TaskName} already has {prioritizeDto.TaskPriority} priority.");       
        }
        
        task.TaskPriority = prioritizeDto.TaskPriority;
        _context.SaveChanges();
        
        return Ok($"Task {task.TaskName} updated successfully updated with priority {prioritizeDto.TaskPriority}.");
    }

    [HttpPatch]
    [Route("changeStatus/{taskId}")]
    public async Task<IActionResult> ChangeTaskStatus(int taskId, [FromBody] UpdateTaskStatusDto updateDto)
    {
        var task = _context.Tasks
            .FirstOrDefault(t => t.TaskId == taskId);
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }

        if (task.TaskStatus == updateDto.TaskStatus)
        {
            return BadRequest($"Task {task.TaskName} already has status {updateDto.TaskStatus}.");      
        }
        task.TaskStatus = updateDto.TaskStatus;
        
        _context.SaveChanges();
        return Ok($"Task {task.TaskName} has been completed successfully.");
    }
}