using TaskService.Models;

namespace TaskService.Dtos;

public class PrioritizeTaskDto
{
    public TaskPriority? TaskPriority { get; set; }
}