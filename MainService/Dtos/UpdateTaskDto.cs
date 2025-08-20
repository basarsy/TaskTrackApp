using MainService.Enums;

namespace MainService.Dtos;

public class UpdateTaskDto
{
    public string TaskName { get; set; }
    public string TaskDescription { get; set; }
}