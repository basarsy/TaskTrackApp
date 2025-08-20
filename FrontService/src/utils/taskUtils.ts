// Utility functions for task management

export type TaskPriorityValue = 1 | 2 | 3;
export type TaskPriorityLabel = 'Low' | 'Medium' | 'High';

export const PRIORITY_MAP: Record<TaskPriorityValue, TaskPriorityLabel> = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};

export const PRIORITY_REVERSE_MAP: Record<TaskPriorityLabel, TaskPriorityValue> = {
  'Low': 1,
  'Medium': 2,
  'High': 3
};

export const getPriorityLabel = (priority: TaskPriorityValue | null): TaskPriorityLabel | null => {
  return priority ? PRIORITY_MAP[priority] : null;
};

export const getPriorityValue = (label: TaskPriorityLabel): TaskPriorityValue => {
  return PRIORITY_REVERSE_MAP[label];
};

export const getPriorityColor = (priority: TaskPriorityValue | null): string => {
  switch (priority) {
    case 1: return 'text-green-600 bg-green-100';
    case 2: return 'text-yellow-600 bg-yellow-100';
    case 3: return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const formatTaskDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}; 