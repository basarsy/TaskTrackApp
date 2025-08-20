import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { UserManagement } from '@/components/users/UserManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskFilter } from '@/types';
import { type TaskPriorityValue } from '@/utils/taskUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users,
  BarChart3
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks, users, deleteTask } = useTask();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityValue | 'all'>('all');
  const [userFilter, setUserFilter] = useState<number | 'all'>('all');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Filter tasks based on user role and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Role-based filtering
    if (user?.roleType === 'User') {
      filtered = filtered.filter(task => task.userId === user.userId);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter(task => task.isTaskCompleted);
    } else if (statusFilter === 'incomplete') {
      filtered = filtered.filter(task => !task.isTaskCompleted);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.taskPriority === priorityFilter);
    }

    // User filter (Admin only)
    if (user?.roleType === 'Admin' && userFilter !== 'all') {
      filtered = filtered.filter(task => task.userId === userFilter);
    }

    return filtered;
  }, [tasks, user, searchTerm, statusFilter, priorityFilter, userFilter]);

  // Statistics
  const stats = useMemo(() => {
    const userTasks = user?.roleType === 'User' 
      ? tasks.filter(task => task.userId === user.userId)
      : tasks;
    
    return {
      total: userTasks.length,
      completed: userTasks.filter(task => task.isTaskCompleted).length,
      pending: userTasks.filter(task => !task.isTaskCompleted).length,
      highPriority: userTasks.filter(task => task.taskPriority === 3 && !task.isTaskCompleted).length
    };
  }, [tasks, user]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    setDeletingTaskId(taskId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      setIsDeleteOpen(false);
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            {user?.roleType === 'Admin' && (
              <TabsTrigger value="users">Users</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {user?.roleType === 'Admin' ? 'Task Management' : 'My Tasks'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {user?.roleType === 'Admin' 
                    ? 'Manage all tasks and team members' 
                    : 'Track your assigned tasks and progress'
                  }
                </p>
              </div>
              
              <Button onClick={handleCreateTask} style={{ background: 'var(--gradient-primary)' }}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    High Priority
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={(value: TaskFilter) => setStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="incomplete">In Progress</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter?.toString() || 'all'} onValueChange={(value: string) => setPriorityFilter(value === 'all' ? 'all' : Number(value) as TaskPriorityValue)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="3">High Priority</SelectItem>
                      <SelectItem value="2">Medium Priority</SelectItem>
                      <SelectItem value="1">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  {user?.roleType === 'Admin' && (
                    <Select value={userFilter.toString()} onValueChange={(value: string) => setUserFilter(value === 'all' ? 'all' : Number(value))}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.userId} value={u.userId.toString()}>
                            {u.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasks Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Tasks ({filteredTasks.length})
                </h2>
                <div className="flex items-center space-x-2">
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary">{statusFilter}</Badge>
                  )}
                  {priorityFilter !== 'all' && (
                    <Badge variant="secondary">{priorityFilter} priority</Badge>
                  )}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <Card className="dashboard-card text-center py-12">
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 rounded-full bg-muted">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">No tasks found</h3>
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first task to get started'
                          }
                        </p>
                      </div>
                      <Button onClick={handleCreateTask} style={{ background: 'var(--gradient-primary)' }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <TaskCard
                      key={task.taskId}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {user?.roleType === 'Admin' && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>

        {/* Task Form Dialog */}
        <TaskForm
          task={editingTask}
          open={isTaskFormOpen}
          onOpenChange={(open) => {
            setIsTaskFormOpen(open);
            if (!open) setEditingTask(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Dashboard;