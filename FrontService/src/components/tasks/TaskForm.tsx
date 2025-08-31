import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task, User } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { TaskPriorityValue, getPriorityLabel } from '@/utils/taskUtils';
import { toast } from '@/components/ui/use-toast';

interface TaskFormProps {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, open, onOpenChange }) => {
  const { createTask, updateTask, users } = useTask();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    taskName: task?.taskName || '',
    taskDescription: task?.taskDescription || '',
    taskPriority: task?.taskPriority || null as TaskPriorityValue | null,
    userId: task?.userId || null as number | null
  });

  // Update form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        taskPriority: task.taskPriority,
        userId: task.userId
      });
    } else {
      // Reset form for new task creation
      setFormData({
        taskName: '',
        taskDescription: '',
        taskPriority: null,
        userId: null
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.taskName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task name cannot be empty."
      });
      return;
    }

    try {
      if (task) {
        // Update existing task - only include fields that have changed
        const updateData: any = {};
        
        if (formData.taskName !== task.taskName) {
          updateData.taskName = formData.taskName;
        }
        if (formData.taskDescription !== task.taskDescription) {
          updateData.taskDescription = formData.taskDescription;
        }
        if (formData.taskPriority !== task.taskPriority) {
          updateData.taskPriority = formData.taskPriority;
        }
        // Fix type comparison issues - handle null values and type conversion
        const formUserId = formData.userId;
        const taskUserId = task.userId;
        if (formUserId !== taskUserId) {

          updateData.userId = formData.userId;
        }
        
        // Only proceed if there are actual changes
        if (Object.keys(updateData).length === 0) {
          toast({
            title: "No Changes",
            description: "No changes detected to update."
          });
          onOpenChange(false);
          return;
        }
        
        await updateTask(task.taskId, updateData);
        
        toast({
          title: "Success",
          description: "Task updated successfully!"
        });
      } else {
        // Create new task - auto-assign to current user if user is not admin
        const taskUserId = user?.roleType === 'Admin' ? formData.userId : user?.userId;
        
        await createTask({
          taskName: formData.taskName,
          taskDescription: formData.taskDescription,
          isTaskCompleted: false,
          taskPriority: formData.taskPriority,
          userId: taskUserId
        });
        
        toast({
          title: "Success",
          description: "Task created successfully!"
        });
      }

      // Close dialog (form will be reset by useEffect when task prop changes)
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while saving the task."
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? 'Update the task details below.' 
              : 'Fill in the details to create a new task.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={formData.taskName}
                onChange={(e) => handleInputChange('taskName', e.target.value)}
                placeholder="Enter task name..."
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={formData.taskDescription}
                onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                placeholder="Enter task description..."
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="taskPriority">Priority</Label>
              <Select 
                value={formData.taskPriority?.toString() || 'none'} 
                onValueChange={(value) => handleInputChange('taskPriority', value === 'none' ? null : Number(value) as TaskPriorityValue)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Priority</SelectItem>
                  <SelectItem value="1">Low Priority</SelectItem>
                  <SelectItem value="2">Medium Priority</SelectItem>
                  <SelectItem value="3">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {user?.roleType === 'Admin' && (
              <div className="grid gap-2">
                <Label htmlFor="assignedUser">Assign to User</Label>
                <Select 
                  value={formData.userId?.toString() || 'none'} 
                  onValueChange={(value) => handleInputChange('userId', value === 'none' ? null : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.userId} value={u.userId.toString()}>
                        {u.userName} ({u.roleType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {user?.roleType !== 'Admin' && !task && (
              <div className="grid gap-2">
                <Label>Assignment</Label>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  📋 This task will be automatically assigned to you ({user?.userName})
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ background: 'var(--gradient-primary)' }}>
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};