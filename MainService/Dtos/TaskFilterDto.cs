using MainService.Enums;
using MainService.Models;

namespace MainService.Dtos;

public class TaskFilterDto
{
    public TaskPriority? TaskPriority { get; set; }
    public bool TaskStatus { get; set; }
    public int UserId { get; set; }
}