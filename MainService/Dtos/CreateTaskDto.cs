using MainService.Models;
using MainService.Enums;

namespace MainService.Dtos;

public class CreateTaskDto
{
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
    public bool IsTaskCompleted { get; set; }
    public TaskPriority? TaskPriority { get; set; }
    public int? UserId { get; set; }
}