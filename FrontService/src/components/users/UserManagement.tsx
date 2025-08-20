import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User } from '@/types';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Shield, User as UserIcon, BarChart3, Eye, CheckCircle, Circle, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getPriorityLabel, getPriorityColor, formatTaskDate } from '@/utils/taskUtils';

export const UserManagement: React.FC = () => {
  const { users, tasks, createUser, updateUser, deleteUser } = useTask();
  const { user: currentUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUserTasksOpen, setIsUserTasksOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeleteingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
    roleType: 'User' as 'User' | 'Admin'
  });

  // Only allow access for Admin users
  if (currentUser?.roleType !== 'Admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Access Denied</h3>
            <p className="text-muted-foreground">You need admin privileges to access user management.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUserTaskCount = (userId: number) => {
    return tasks.filter(task => task.userId === userId).length;
  };

  const getUserCompletedTaskCount = (userId: number) => {
    return tasks.filter(task => task.userId === userId && task.isTaskCompleted).length;
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({ userName: '', userPassword: '', roleType: 'User' });
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({ userName: user.userName, userPassword: '', roleType: user.roleType });
    setIsFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteingUser(user);
    setIsDeleteOpen(true);
  };

  const handleViewUserTasks = (user: User) => {
    setSelectedUser(user);
    setIsUserTasksOpen(true);
  };

  const getUserTasks = (userId: number) => {
    return tasks.filter(task => task.userId === userId);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.userId);
      setIsDeleteOpen(false);
      setDeleteingUser(null);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username cannot be empty."
      });
      return;
    }
    
    if (!editingUser && !formData.userPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password cannot be empty."
      });
      return;
    }

    try {
      if (editingUser) {
        // For editing, only send userName and roleType
        await updateUser(editingUser.userId, { userName: formData.userName, roleType: formData.roleType });
        
        toast({
          title: "Success",
          description: "User updated successfully!"
        });
      } else {
        // For creating, send all fields including password
        await createUser({
          userName: formData.userName,
          userPassword: formData.userPassword,
          roleType: formData.roleType
        });
        
        toast({
          title: "Success",
          description: "User created successfully!"
        });
      }

      setIsFormOpen(false);
      setFormData({ userName: '', userPassword: '', roleType: 'User' });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while saving the user."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage team members and their roles</p>
        </div>
        <Button onClick={handleCreateUser} style={{ background: 'var(--gradient-primary)' }}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Team Members ({users.length})
          </CardTitle>
          <CardDescription>
            View and manage all team members and their task assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => {
                const taskCount = getUserTaskCount(user.userId);
                const completedCount = getUserCompletedTaskCount(user.userId);
                
                return (
                  <TableRow 
                    key={user.userId} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewUserTasks(user)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.userName}</span>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.roleType === 'Admin' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {user.roleType === 'Admin' ? (
                          <><Shield className="w-3 h-3 mr-1" />Admin</>
                        ) : (
                          <><UserIcon className="w-3 h-3 mr-1" />User</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{taskCount}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-green-600">{completedCount}</span>
                        <span className="text-sm text-muted-foreground">
                          ({taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={user.userId === currentUser?.userId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Update the user details below.' 
                : 'Fill in the details to create a new user account.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitForm}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder="Enter username..."
                  required
                />
              </div>
              
              {!editingUser && (
                <div className="grid gap-2">
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={formData.userPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, userPassword: e.target.value }))}
                    placeholder="Enter password..."
                    required
                  />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="roleType">Role</Label>
                <Select 
                  value={formData.roleType} 
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, roleType: value as 'User' | 'Admin' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        User
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" style={{ background: 'var(--gradient-primary)' }}>
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.userName}</strong>? 
              This action cannot be undone and will unassign all tasks currently assigned to this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Tasks Dialog */}
      <Dialog open={isUserTasksOpen} onOpenChange={setIsUserTasksOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {selectedUser?.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{selectedUser?.userName}'s Tasks</span>
              <Badge 
                variant={selectedUser?.roleType === 'Admin' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {selectedUser?.roleType === 'Admin' ? (
                  <><Shield className="w-3 h-3 mr-1" />Admin</>
                ) : (
                  <><UserIcon className="w-3 h-3 mr-1" />User</>
                )}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              View all tasks assigned to {selectedUser?.userName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUser && (() => {
              const userTasks = getUserTasks(selectedUser.userId);
              const completedTasks = userTasks.filter(task => task.isTaskCompleted);
              
              return (
                <>
                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{userTasks.length}</div>
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                          {userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Tasks ({userTasks.length})</h4>
                    {userTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks assigned to this user yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3 max-h-60 overflow-y-auto">
                        {userTasks.map(task => (
                          <Card key={task.taskId} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="mt-1">
                                  {task.isTaskCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className={`font-medium ${task.isTaskCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.taskName}
                                  </h5>
                                  <p className={`text-sm ${task.isTaskCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                    {task.taskDescription}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatTaskDate(task.taskDate)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {task.taskPriority && (
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs ${getPriorityColor(task.taskPriority)}`}
                                  >
                                    {getPriorityLabel(task.taskPriority)}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={task.isTaskCompleted ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {task.isTaskCompleted ? "Completed" : "In Progress"}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserTasksOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};