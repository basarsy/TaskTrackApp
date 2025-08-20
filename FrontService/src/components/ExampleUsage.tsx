// src/components/ExampleUsage.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { handleApiError } from '@/utils/errorHandler';

export const ExampleUsage: React.FC = () => {
    const { user, login, logout, isLoading: authLoading } = useAuth();
    const {
        tasks,
        users,
        createTask,
        updateTask,
        deleteTask,
        changeTaskStatus,
        isLoading: taskLoading,
        error
    } = useTask();

    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [taskForm, setTaskForm] = useState({
        taskName: '',
        taskDescription: '',
        taskPriority: 'Medium' as 'Low' | 'Medium' | 'High',
        isTaskCompleted: false,
        userId: null as number | null
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        try {
            const success = await login(loginForm.username, loginForm.password);
            if (!success) {
                setErrorMessage('Invalid username or password');
            }
        } catch (err) {
            setErrorMessage(handleApiError(err));
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        try {
            await createTask(taskForm);
            setTaskForm({
                taskName: '',
                taskDescription: '',
                taskPriority: 'Medium',
                isTaskCompleted: false,
                userId: null
            });
        } catch (err) {
            setErrorMessage(handleApiError(err));
        }
    };

    const handleToggleTaskStatus = async (taskId: number, currentStatus: boolean) => {
        try {
            await changeTaskStatus(taskId, !currentStatus);
        } catch (err) {
            setErrorMessage(handleApiError(err));
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        try {
            await deleteTask(taskId);
        } catch (err) {
            setErrorMessage(handleApiError(err));
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Sign in to TaskTrack
                        </h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {errorMessage}
                            </div>
                        )}

                        <div className="rounded-md shadow-sm -space-y-px">
                            <input
                                type="text"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Username"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                            />
                            <input
                                type="password"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {authLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">TaskTrack Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user.userName} ({user.roleType})
              </span>
                            <button
                                onClick={logout}
                                className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {errorMessage && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {errorMessage}
                        <button
                            onClick={() => setErrorMessage(null)}
                            className="float-right text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Create Task Form - Only for Admins */}
                {user.roleType === 'Admin' && (
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Create New Task
                            </h3>

                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Task Name"
                                        required
                                        value={taskForm.taskName}
                                        onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />

                                    <select
                                        value={taskForm.taskPriority}
                                        onChange={(e) => setTaskForm({ ...taskForm, taskPriority: e.target.value as 'Low' | 'Medium' | 'High' })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                </div>

                                <textarea
                                    placeholder="Task Description"
                                    required
                                    value={taskForm.taskDescription}
                                    onChange={(e) => setTaskForm({ ...taskForm, taskDescription: e.target.value })}
                                    rows={3}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />

                                <div className="flex items-center justify-between">
                                    <select
                                        value={taskForm.userId || ''}
                                        onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value ? Number(e.target.value) : null })}
                                        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(user => (
                                            <option key={user.userId} value={user.userId}>
                                                {user.userName}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={taskLoading}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {taskLoading ? 'Creating...' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Tasks ({tasks.length})
                        </h3>

                        {taskLoading && (
                            <div className="text-center py-4">
                                <span className="text-gray-500">Loading tasks...</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {tasks.map(task => {
                                const assignedUser = users.find(u => u.userId === task.userId);

                                return (
                                    <div
                                        key={task.taskId}
                                        className="border rounded-lg p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleToggleTaskStatus(task.taskId, task.isTaskCompleted)}
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                            task.isTaskCompleted
                                                                ? 'bg-green-500 border-green-500'
                                                                : 'border-gray-300 hover:border-green-500'
                                                        }`}
                                                    >
                                                        {task.isTaskCompleted && (
                                                            <span className="text-white text-xs">✓</span>
                                                        )}
                                                    </button>

                                                    <h4 className={`font-medium ${
                                                        task.isTaskCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                                    }`}>
                                                        {task.taskName}
                                                    </h4>

                                                    {task.taskPriority && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            task.taskPriority === 'High' ? 'bg-red-100 text-red-800' :
                                                                task.taskPriority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                        }`}>
                              {task.taskPriority}
                            </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    {task.taskDescription}
                                                </p>

                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                    <span>Created: {new Date(task.taskDate).toLocaleDateString()}</span>
                                                    {assignedUser && (
                                                        <span>Assigned to: {assignedUser.userName}</span>
                                                    )}
                                                    {!assignedUser && <span>Unassigned</span>}
                                                </div>
                                            </div>

                                            {user.roleType === 'Admin' && (
                                                <button
                                                    onClick={() => handleDeleteTask(task.taskId)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {tasks.length === 0 && !taskLoading && (
                                <div className="text-center py-8 text-gray-500">
                                    No tasks found. {user.roleType === 'Admin' ? 'Create your first task above!' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};