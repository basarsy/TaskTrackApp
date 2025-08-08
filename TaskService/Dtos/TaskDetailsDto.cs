using TaskService.Models;
using TaskStatus = System.Threading.Tasks.TaskStatus;

namespace TaskService.Dtos;
public class TaskDetailsDto
{
    public int TaskId { get; set; }
    public required string TaskName { get; set; }
    public required string TaskDescription { get; set; }
    public bool TaskStatus { get; set; }
    public TaskPriority? TaskPriority { get; set; }
    public DateTime TaskDate { get; set; }
}