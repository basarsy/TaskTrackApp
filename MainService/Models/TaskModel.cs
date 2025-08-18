using System.ComponentModel.DataAnnotations;
using MainService.Enums;

namespace MainService.Models;

public class TaskModel
{
    [Key]
    public int TaskId { get; set; }
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
    public bool IsTaskCompleted { get; set; }
    public TaskPriority? TaskPriority { get; set; }
    public DateTime TaskDate { get; set; }
    public int? UserId { get; set; }
}