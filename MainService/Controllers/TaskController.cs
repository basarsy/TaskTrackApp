using MainService.Data;
using MainService.Dtos;
using MainService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MainService.Controllers;

[ApiController]
[Route("/api/[controller]")]

public class TaskController : ControllerBase
{
    private readonly AppDbContext _context;
    public TaskController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Route("/create")]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto taskDto)
    {
        var task = new TaskModel()
        {
            TaskName = taskDto.TaskName,
            TaskDescription = taskDto.TaskDescription,
            TaskPriority = 0,
            IsTaskCompleted = false,
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
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync();
        if (task == null)
        {
            return BadRequest($"There are no task with id {taskId}.");
        }
        
        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok($"Task with {task.TaskId} deleted successfully.");       
    }
    
    [HttpGet]
    [Route("/get")]
    public async Task<IActionResult> GetTasks()
    {
        var tasks = await _context.Tasks
            .Select(t => new TaskDetailsDto()
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskDescription = t.TaskDescription,
                TaskDate = t.TaskDate,
                TaskStatus = t.IsTaskCompleted,
                TaskPriority = t.TaskPriority
            })
            .ToListAsync();

        if (tasks.Count == 0)
        {
            return NotFound($"There are no tasks.");
        }
        return Ok(tasks);
    }

    [HttpGet]
    [Route("/get/{taskId}")]
    public async Task<IActionResult> GetTask(int taskId, TaskDetailsDto taskDto)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .Select(t => new TaskDetailsDto()
            {
                TaskId = t.TaskId,
                TaskName = t.TaskName,
                TaskDescription = t.TaskDescription,
                TaskDate = t.TaskDate,
                TaskStatus = t.IsTaskCompleted,
                TaskPriority = t.TaskPriority
                
            })
            .ToListAsync();
        
        if (taskId != _context.Tasks
                .Where(t => t.TaskId == taskId)
                .Select(t => t.TaskId)
                .FirstOrDefault())
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        return Ok(task);
    }
    
    [HttpPut]
    [Route("/update/{taskId}")]
    public async Task<IActionResult> UpdateTask(int taskId, TaskDetailsDto updateDto)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync();
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }

        task.TaskName = updateDto.TaskName;
        task.TaskDescription = updateDto.TaskDescription;
        _context.SaveChanges();
        return Ok($"Task with {task.TaskId} updated successfully.");
    }
    
    [HttpPatch]
    [Route("/changeStatus/{taskId}")]
    public async Task<IActionResult> ChangeTaskStatus(int taskId, TaskDetailsDto statusDto)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync();
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (task.IsTaskCompleted == statusDto.TaskStatus)
        {
            return BadRequest($"Task with {task.TaskId} already has status {statusDto.TaskStatus}.");      
        }

        task.IsTaskCompleted = statusDto.TaskStatus;
        _context.SaveChanges();
        return Ok($"Task with {task.TaskId} updated successfully.");
    }

    [HttpPatch]
    [Route("prio/{taskId}")]
    public async Task<IActionResult> AddTaskPriority(int taskId, TaskDetailsDto priorityDto)
    {
        var task = await _context.Tasks
            .Where(t=>t.TaskId == taskId)
            .FirstOrDefaultAsync();
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (task.TaskPriority == priorityDto.TaskPriority)
        {
            return BadRequest($"Task with {task.TaskId} already has priority {priorityDto.TaskPriority}.");      
        }
        
        task.TaskPriority = priorityDto.TaskPriority;
        _context.SaveChanges();
        return Ok($"Task with {task.TaskId} id updated with {priorityDto.TaskPriority} priority successfully.");
    }
}