// src/contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, User, Task as ApiTask } from '@/services/api';
import { useAuth } from './AuthContext';

// Updated Task interface to match your frontend types
export interface Task {
    taskId: number;
    taskName: string;
    taskDescription: string;
    isTaskCompleted: boolean;
    taskPriority: 1 | 2 | 3 | null; // Low=1, Medium=2, High=3 to match backend enum
    taskDate: string;
    userId: number | null;
}

export interface TaskContextType {
    tasks: Task[];
    users: User[];
    createTask: (newTask: Omit<Task, 'taskId' | 'taskDate'>) => Promise<void>;
    updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;
    createUser: (newUser: Omit<User, 'userId'> & { userPassword: string }) => Promise<void>;
    updateUser: (userId: number, updates: Partial<User>) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
    changeTaskStatus: (taskId: number, status: boolean) => Promise<void>;
    changeTaskPriority: (taskId: number, priority: 1 | 2 | 3) => Promise<void>;
    assignTask: (taskId: number, userId: number) => Promise<void>;
    unassignTask: (taskId: number) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
    children: React.ReactNode;
}

// Convert API task response to frontend Task type
const convertApiTaskToTask = (apiTask: any): Task => ({
    taskId: apiTask.taskId,
    taskName: apiTask.taskName,
    taskDescription: apiTask.taskDescription,
    taskDate: apiTask.taskDate,
    isTaskCompleted: apiTask.taskStatus,
    taskPriority: apiTask.taskPriority,
    userId: apiTask.userId
});

// Convert API user response to frontend User type
const convertApiUserToUser = (apiUser: any): User => ({
    userId: apiUser.userId,
    userName: apiUser.userName,
    roleType: apiUser.roleType === 2 ? 'Admin' : 'User' // Convert numeric to string
});

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Load initial data
    useEffect(() => {
        if (user) {
            loadInitialData();
        }
    }, [user]);

    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load tasks based on user role
            let tasksPromise;
            if (user?.roleType === 'Admin') {
                // Admin can see all tasks
                tasksPromise = apiService.getTasks();
            } else if (user?.userId) {
                // Regular users see only their tasks
                tasksPromise = apiService.getTasksByUser(user.userId);
            } else {
                tasksPromise = Promise.resolve([]);
            }

            // Load tasks and users in parallel
            const [tasksResponse, usersResponse] = await Promise.allSettled([
                tasksPromise,
                user?.roleType === 'Admin' ? apiService.getUsers() : Promise.resolve([])
            ]);

            if (tasksResponse.status === 'fulfilled') {
                setTasks(tasksResponse.value.map(convertApiTaskToTask));
            } else {
                console.error('Failed to load tasks:', tasksResponse.reason);
                setError('Failed to load tasks');
            }

            if (usersResponse.status === 'fulfilled') {
                setUsers(usersResponse.value.map(convertApiUserToUser));
            } else if (user?.roleType === 'Admin') {
                console.error('Failed to load users:', usersResponse.reason);
            }

        } catch (err) {
            console.error('Error loading initial data:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const createTask = async (newTask: Omit<Task, 'taskId' | 'taskDate'>) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.createTask({
                taskName: newTask.taskName,
                taskDescription: newTask.taskDescription,
                taskPriority: newTask.taskPriority || 2, // Default to Medium (2)
                isTaskCompleted: newTask.isTaskCompleted,
                userId: newTask.userId
            });

            // Reload tasks based on user role (same logic as loadInitialData)
            if (user?.roleType === 'Admin') {
                const updatedTasks = await apiService.getTasks();
                setTasks(updatedTasks.map(convertApiTaskToTask));
            } else if (user?.userId) {
                const updatedTasks = await apiService.getTasksByUser(user.userId);
                setTasks(updatedTasks.map(convertApiTaskToTask));
            }
        } catch (err) {
            console.error('Error creating task:', err);
            setError(err instanceof Error ? err.message : 'Failed to create task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateTask = async (taskId: number, updates: Partial<Task>) => {
        setIsLoading(true);
        setError(null);

        try {
            // Handle task status change
            if (updates.isTaskCompleted !== undefined) {
                await apiService.changeTaskStatus(taskId, { taskStatus: updates.isTaskCompleted });
            }
            
            // Handle task name/description update
            if (updates.taskName || updates.taskDescription) {
                await apiService.updateTask(taskId, {
                    taskName: updates.taskName || '',
                    taskDescription: updates.taskDescription || ''
                });
            }

            // Handle priority change
            if (updates.taskPriority !== undefined) {
                await apiService.changeTaskPriority(taskId, { taskPriority: updates.taskPriority });
            }

            // Update local state instead of reloading all tasks
            setTasks(prev => prev.map(task =>
                task.taskId === taskId ? { ...task, ...updates } : task
            ));
        } catch (err) {
            console.error('Error updating task:', err);
            setError(err instanceof Error ? err.message : 'Failed to update task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTask = async (taskId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.taskId !== taskId));
        } catch (err) {
            console.error('Error deleting task:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const changeTaskStatus = async (taskId: number, status: boolean) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.changeTaskStatus(taskId, { taskStatus: status });

            // Update local state
            setTasks(prev => prev.map(task =>
                task.taskId === taskId ? { ...task, isTaskCompleted: status } : task
            ));
        } catch (err) {
            console.error('Error changing task status:', err);
            setError(err instanceof Error ? err.message : 'Failed to change task status');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const changeTaskPriority = async (taskId: number, priority: 1 | 2 | 3) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.changeTaskPriority(taskId, { taskPriority: priority });

            // Update local state
            setTasks(prev => prev.map(task =>
                task.taskId === taskId ? { ...task, taskPriority: priority } : task
            ));
        } catch (err) {
            console.error('Error changing task priority:', err);
            setError(err instanceof Error ? err.message : 'Failed to change task priority');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const assignTask = async (taskId: number, userId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.assignTask(taskId, { userId });

            // Update local state
            setTasks(prev => prev.map(task =>
                task.taskId === taskId ? { ...task, userId } : task
            ));
        } catch (err) {
            console.error('Error assigning task:', err);
            setError(err instanceof Error ? err.message : 'Failed to assign task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const unassignTask = async (taskId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.unassignTask(taskId);

            // Update local state
            setTasks(prev => prev.map(task =>
                task.taskId === taskId ? { ...task, userId: null } : task
            ));
        } catch (err) {
            console.error('Error unassigning task:', err);
            setError(err instanceof Error ? err.message : 'Failed to unassign task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createUser = async (newUser: { userName: string; userPassword: string; roleType: 'User' | 'Admin' }) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.createUser({
                userName: newUser.userName,
                userPassword: newUser.userPassword,
                roleType: newUser.roleType === 'Admin' ? 2 : 1 // Convert string to numeric enum
            });

            // Reload users to get the updated list
            const updatedUsers = await apiService.getUsers();
            setUsers(updatedUsers.map(convertApiUserToUser));
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err instanceof Error ? err.message : 'Failed to create user');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (userId: number, updates: Partial<User>) => {
        setIsLoading(true);
        setError(null);

        try {
            if (updates.userName) {
                await apiService.updateUser(userId, { userName: updates.userName });
            }

            if (updates.roleType) {
                await apiService.changeUserRole(userId, { roleType: updates.roleType });
            }

            // Reload users to get the updated list
            const updatedUsers = await apiService.getUsers();
            setUsers(updatedUsers.map(convertApiUserToUser));
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err instanceof Error ? err.message : 'Failed to update user');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (userId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            await apiService.deleteUser(userId);

            // Remove user from local state
            setUsers(prev => prev.filter(user => user.userId !== userId));

            // Unassign tasks from deleted user
            setTasks(prev => prev.map(task =>
                task.userId === userId ? { ...task, userId: null } : task
            ));
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete user');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const value: TaskContextType = {
        tasks,
        users,
        createTask,
        updateTask,
        deleteTask,
        createUser,
        updateUser,
        deleteUser,
        changeTaskStatus,
        changeTaskPriority,
        assignTask,
        unassignTask,
        isLoading,
        error
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTask = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
};