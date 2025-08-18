using MainService.Data;
using MainService.Dtos;
using MainService.Models;
using MainService.Enums;
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
    [Route("create")]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto taskDto, CancellationToken ct = default)
    {
        var task = new TaskModel()
        {
            TaskName = taskDto.TaskName,
            TaskDescription = taskDto.TaskDescription,
            TaskPriority = 0,
            IsTaskCompleted = false,
            TaskDate = DateTime.UtcNow
        };
        
        await _context.Tasks.AddAsync(task, ct);
        await _context.SaveChangesAsync(ct);
        return Ok($"Task {task.TaskName} created successfully.");
    }

    [HttpDelete]
    [Route("delete/{taskId:int}")]
    public async Task<IActionResult> DeleteTask(int taskId, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        if (task == null)
        {
            return BadRequest($"There are no task with id {taskId}.");
        }
        
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(ct);
        return Ok($"Task with id {task.TaskId} has been deleted successfully.");       
    }
    
    [HttpGet]
    [Route("get")]
    public async Task<IActionResult> GetTasks(CancellationToken ct = default)
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
            .ToListAsync(ct);

        if (tasks.Count == 0)
        {
            return NotFound($"There are no tasks.");
        }
        return Ok(tasks);
    }

    [HttpGet]
    [Route("/get/{taskId:int}")]
    public async Task<IActionResult> GetTask(int taskId, CancellationToken ct = default)
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
            .ToListAsync(ct);
        
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
    [Route("update/{taskId:int}")]
    public async Task<IActionResult> UpdateTask(int taskId, TaskDetailsDto updateDto, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }

        task.TaskName = updateDto.TaskName;
        task.TaskDescription = updateDto.TaskDescription;
        await _context.SaveChangesAsync(ct);
        return Ok($"Task with {task.TaskId} updated successfully.");
    }
    
    [HttpPatch]
    [Route("changeStatus/{taskId:int}")]
    public async Task<IActionResult> ChangeTaskStatus(int taskId, TaskStatusDto statusDto, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (task.IsTaskCompleted == statusDto.TaskStatus)
        {
            return BadRequest($"Task with {task.TaskId} already has status {statusDto.TaskStatus}.");      
        }

        task.IsTaskCompleted = statusDto.TaskStatus;
        await _context.SaveChangesAsync(ct);
        return Ok($"Task with {task.TaskId} updated successfully.");
    }

    [HttpPatch]
    [Route("prio/{taskId:int}")]
    public async Task<IActionResult> AddTaskPriority(int taskId, TaskPrioDto priorityDto, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t=>t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (task.TaskPriority == priorityDto.TaskPriority)
        {
            return BadRequest($"Task with {task.TaskId} already has priority {priorityDto.TaskPriority}.");      
        }
        
        task.TaskPriority = priorityDto.TaskPriority;
        await _context.SaveChangesAsync(ct);
        return Ok($"Task with {task.TaskId} id updated with {priorityDto.TaskPriority} priority successfully.");
    }
    
    [HttpGet]
    [Route("priofilter/{prioLevel}")]
    public async Task<IActionResult> FilterTasksByPriority([FromRoute]int prioLevel,CancellationToken ct = default)
    {
        var tasks = await _context.Tasks
            .Where(p => p.TaskPriority.HasValue && (int)p.TaskPriority.Value == prioLevel)
            .Select(p => new TaskDetailsDto()
            {
                TaskId = p.TaskId,
                TaskName = p.TaskName,
                TaskDescription = p.TaskDescription,
                TaskDate = p.TaskDate,
                TaskStatus = p.IsTaskCompleted,
                TaskPriority = p.TaskPriority
            })
            .ToListAsync(ct);
        if (tasks.Count == 0)
        {
            return NotFound($"There are no tasks with priority {prioLevel}.");
        }
        return Ok(tasks);
    }

    [HttpPatch]
    [Route("{taskId:int}/assign")]
    public async Task<IActionResult> AssignTask([FromRoute]int taskId, [FromBody]AssignUserDto assignDto, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }

        var user = await _context.Users
            .Where(u => u.UserId == assignDto.UserId)
            .FirstOrDefaultAsync(ct);
        if (user == null)
        {
            return NotFound($"There are no user with id {assignDto.UserId}.");
        }

        if (assignDto.UserId != _context.Users
                .Select(u => u.UserId)
                .FirstOrDefault())
        {
            return BadRequest($"There are no user with id {assignDto.UserId}.");
        }
        if (task.UserId == assignDto.UserId)
        {
            return BadRequest($"Task with {task.TaskId} is already assigned to user with id {assignDto.UserId}.");     
        }
        
        task.UserId = assignDto.UserId;
        await _context.SaveChangesAsync(ct);
        return Ok($"Task with {task.TaskId} assigned to user with id {assignDto.UserId} successfully.");       
    }

    [HttpPatch]
    [Route("reassign/{taskId:int}")]
    public async Task<IActionResult> ReassignTask(int taskId, AssignUserDto reassignDto, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (reassignDto.UserId == task.UserId)
        {
            return BadRequest($"Task with {task.TaskId} is already assigned to user with id {reassignDto.UserId}.");      
        }
        if (reassignDto.UserId != _context.Users
                .Select(u => u.UserId)
                .FirstOrDefault())
        {
            return BadRequest($"There are no user with id {reassignDto.UserId}.");
        }
        task.UserId = reassignDto.UserId;
        await _context.SaveChangesAsync(ct);
        
        return Ok($"Task with {task.TaskId} reassigned to user with id {reassignDto.UserId} successfully.");       
    }
    
    [HttpPatch]
    [Route("unassign/{taskId:int}")]
    public async Task<IActionResult> UnassignTask(int taskId, CancellationToken ct = default)
    {
        var task = await _context.Tasks
            .Where(t => t.TaskId == taskId)
            .FirstOrDefaultAsync(ct);
        if (task == null)
        {
            return NotFound($"There are no task with id {taskId}.");
        }
        if (task.UserId == null)
        {
            return BadRequest($"Task with {task.TaskId} is not assigned to any user.");     
        }
        
        task.UserId = null;
        await _context.SaveChangesAsync(ct);
        
        return Ok($"Task with {task.TaskId} unassigned successfully.");       
    }
}