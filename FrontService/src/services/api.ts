// Use environment variable for API base URL
// In development: http://localhost:5091/api  
// In production/Docker: /api (proxied by nginx)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5091/api');

// Types matching your backend DTOs
export interface LoginRequest {
    userName: string;
    userPassword: string;
}

export interface LoginResponse {
    token?: string;
    // Backend returns just a string token, not an object
}

export interface CreateUserRequest {
    userName: string;
    userPassword: string;
    roleType: 1 | 2; // 1 = User, 2 = Admin (matching backend enum)
}

export interface UpdateUserRequest {
    userName: string;
}

export interface UpdateRoleRequest {
    roleType: 'Admin' | 'User';
}

export interface CreateTaskRequest {
    taskName: string;
    taskDescription: string;
    taskPriority: 1 | 2 | 3; // Low=1, Medium=2, High=3 to match backend enum
    isTaskCompleted: boolean;
    userId?: number | null;
}

export interface UpdateTaskRequest {
    taskName: string;
    taskDescription: string;
}

export interface TaskStatusRequest {
    taskStatus: boolean;
}

export interface TaskPriorityRequest {
    taskPriority: 1 | 2 | 3; // Low=1, Medium=2, High=3 to match backend enum
}

export interface AssignUserRequest {
    userId: number;
}

export interface User {
    userId: number;
    userName: string;
    roleType: 'Admin' | 'User';
}

export interface Task {
    taskId: number;
    taskName: string;
    taskDescription: string;
    taskDate: string;
    taskStatus: boolean;
    taskPriority: 1 | 2 | 3 | null; // Low=1, Medium=2, High=3 to match backend enum
    userId: number | null;
}

class ApiService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('tasktrack-token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('tasktrack-token');
            localStorage.removeItem('tasktrack-user');
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('API Response:', data);
            return data;
        }

        const textData = await response.text();
        console.log('API Text Response:', textData);
        return textData as unknown as T;
    }

    // Auth endpoints
    async login(credentials: LoginRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        return this.handleResponse<string>(response);
    }

    async authTest(): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/auth/authtest/1`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<string>(response);
    }

    // User endpoints
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}/user/get`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<User[]>(response);
    }

    async getUser(userId: number): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}/user/get/${userId}`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<User[]>(response);
    }

    async createUser(userData: CreateUserRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/user/create`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(userData),
        });

        return this.handleResponse<string>(response);
    }

    async updateUser(userId: number, userData: UpdateUserRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/user/update/${userId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(userData),
        });

        return this.handleResponse<string>(response);
    }

    async changeUserRole(userId: number, roleData: UpdateRoleRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/user/changeRole/${userId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ roleType: roleData.roleType === 'Admin' ? 2 : 1 }),
        });

        return this.handleResponse<string>(response);
    }

    async deleteUser(userId: number): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/user/delete/${userId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<string>(response);
    }

    // Task endpoints
    async getTasks(): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/task/get`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<Task[]>(response);
    }

    async getTask(taskId: number): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/task/get/${taskId}`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<Task[]>(response);
    }

    async getTasksByUser(userId: number): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/task/gettasksbyuser/${userId}`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<Task[]>(response);
    }

    async createTask(taskData: CreateTaskRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/create`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(taskData),
        });

        return this.handleResponse<string>(response);
    }

    async updateTask(taskId: number, taskData: UpdateTaskRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/update/${taskId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(taskData),
        });

        return this.handleResponse<string>(response);
    }

    async deleteTask(taskId: number): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/delete/${taskId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<string>(response);
    }

    async changeTaskStatus(taskId: number, statusData: TaskStatusRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/changeStatus/${taskId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(statusData),
        });

        return this.handleResponse<string>(response);
    }

    async changeTaskPriority(taskId: number, priorityData: TaskPriorityRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/prio/${taskId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(priorityData),
        });

        return this.handleResponse<string>(response);
    }

    async filterTasksByPriority(priorityLevel: number): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/task/priofilter/${priorityLevel}`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<Task[]>(response);
    }

    async assignTask(taskId: number, assignData: AssignUserRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/${taskId}/assign`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(assignData),
        });

        return this.handleResponse<string>(response);
    }

    async reassignTask(taskId: number, reassignData: AssignUserRequest): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/reassign/${taskId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(reassignData),
        });

        return this.handleResponse<string>(response);
    }

    async unassignTask(taskId: number): Promise<string> {
        const response = await fetch(`${API_BASE_URL}/task/unassign/${taskId}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<string>(response);
    }

    async getIncompleteTasks(): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/task/getIncompleteTasks`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<Task[]>(response);
    }

    async getCompleteTasks(): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/task/getCompleteTasks`, {
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<Task[]>(response);
    }
}

export const apiService = new ApiService();