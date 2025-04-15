
export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  dueDate: Date;
  scheduled?: {
    day: string; // ISO string format (YYYY-MM-DD)
    startTime: string; // HH:MM format
  };
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  isNonNegotiable?: boolean;
}

export interface TimeBlock {
  id: string;
  task: Task;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  day: string; // ISO string format (YYYY-MM-DD)
}

export interface DaySchedule {
  date: string; // ISO string format (YYYY-MM-DD)
  timeBlocks: TimeBlock[];
}

export interface DragItem {
  taskId: string;
  type: 'task' | 'timeblock';
}
