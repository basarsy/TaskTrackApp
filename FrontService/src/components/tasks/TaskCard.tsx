import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Task, User } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Edit, Trash2, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPriorityLabel, getPriorityColor, formatTaskDate } from '@/utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { changeTaskStatus, users } = useTask();
  const { user } = useAuth();
  
  const assignedUser = users.find(u => u.userId === task.userId);
  
  const handleToggleComplete = () => {
    changeTaskStatus(task.taskId, !task.isTaskCompleted);
  };

  // Remove the local getPriorityColor function - we'll use the one from utils

  const canEdit = user?.roleType === 'Admin' || user?.userId === task.userId;
  const canDelete = user?.roleType === 'Admin';

  return (
    <Card className={cn(
      'task-card transition-all duration-200',
      task.isTaskCompleted && 'opacity-75'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={task.isTaskCompleted}
              onCheckedChange={handleToggleComplete}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold text-sm leading-tight',
                task.isTaskCompleted && 'line-through text-muted-foreground'
              )}>
                {task.taskName}
              </h3>
              {task.taskDescription && (
                <p className={cn(
                  'text-sm text-muted-foreground mt-1 line-clamp-2',
                  task.isTaskCompleted && 'line-through'
                )}>
                  {task.taskDescription}
                </p>
              )}
            </div>
          </div>
          
          {task.taskPriority && (
            <Badge className={cn('text-xs', getPriorityColor(task.taskPriority))}>
              {getPriorityLabel(task.taskPriority)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatTaskDate(task.taskDate)}</span>
          </div>
          
          {assignedUser && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {assignedUser.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{assignedUser.userName}</span>
            </div>
          )}
          
          {!assignedUser && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <UserIcon className="h-3 w-3" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}
        </div>
      </CardContent>

      {(canEdit || canDelete) && (
        <CardFooter className="pt-2 pb-3">
          <div className="flex items-center space-x-2 w-full">
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 text-xs flex-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.taskId)}
                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};