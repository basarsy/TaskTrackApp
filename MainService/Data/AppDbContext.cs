using MainService.Models;
using Microsoft.EntityFrameworkCore;

namespace MainService.Data;

public class AppDbContext : DbContext
{
    private AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}
    
    public DbSet<UserModel> Users { get; set; }
    public DbSet<TaskModel> Tasks { get; set; }
}