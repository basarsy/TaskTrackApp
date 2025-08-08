using System.ComponentModel.DataAnnotations;

namespace TaskService.Models;

public enum TaskPriority
{
    Low = 1,
    Medium = 2, 
    High = 3
}

public class TaskItem
{
    [Key]
    public int TaskId { get; set; }
    
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
    public bool TaskStatus { get; set; }
    
    public TaskPriority? TaskPriority { get; set; }
    public DateTime TaskDate { get; set; }
}