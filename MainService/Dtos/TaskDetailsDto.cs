using MainService.Models;

namespace MainService.Dtos;

public class TaskDetailsDto
{
    public int TaskId { get; set; }
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
    public bool TaskStatus { get; set; }
    public TaskPriority? TaskPriority { get; set; }
    public DateTime TaskDate { get; set; }
    
}