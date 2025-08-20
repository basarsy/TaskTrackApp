// TaskTrackApp - Type Definitions

export type TaskFilter = 'all' | 'completed' | 'incomplete';

export interface User {
  userId: number;
  userName: string;
  roleType: 'User' | 'Admin';
}

export interface Task {
  taskId: number;
  taskName: string;
  taskDescription: string;
  isTaskCompleted: boolean;
  taskPriority: 1 | 2 | 3 | null; // Low=1, Medium=2, High=3 to match backend enum
  taskDate: string;
  userId: number | null;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

export interface TaskContextType {
  tasks: Task[];
  users: User[];
  createTask: (task: Omit<Task, 'taskId' | 'taskDate'>) => Promise<void>;
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  createUser: (user: { userName: string; userPassword: string; roleType: 'User' | 'Admin' }) => Promise<void>;
  updateUser: (userId: number, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  changeTaskStatus: (taskId: number, status: boolean) => Promise<void>;
  changeTaskPriority: (taskId: number, priority: 1 | 2 | 3) => Promise<void>;
  assignTask: (taskId: number, userId: number) => Promise<void>;
  unassignTask: (taskId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
