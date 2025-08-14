using System.ComponentModel.DataAnnotations;

namespace MainService.Models;

enum TaskPriority
{
    Low = 1,
    Medium = 2, 
    High = 3   
}

public class TaskModel
{
    [Key]
    public int TaskId { get; set; }
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
    public bool IsTaskCompleted { get; set; }
    public TaskPriority? TaskPriority { get; set; }
    public DateTime TaskDate { get; set; }
    public int? AssignedUserId { get; set; }
}