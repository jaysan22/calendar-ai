
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task, TimeBlock, DaySchedule } from '../types';
import { getCurrentTimeSlot, addDurationToTime } from '../utils/dateUtils';

interface TimeFlowState {
  tasks: Task[];
  schedule: DaySchedule[];
  currentDate: string; // ISO format date string
  nonNegotiables: Task[];
}

type TimeFlowAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'SCHEDULE_TASK'; payload: { taskId: string; startTime: string; day: string } }
  | { type: 'AUTO_SCHEDULE_TASKS' }
  | { type: 'ADD_NON_NEGOTIABLE'; payload: Task }
  | { type: 'UPDATE_NON_NEGOTIABLE'; payload: Task }
  | { type: 'DELETE_NON_NEGOTIABLE'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; startTime: string; day: string } }
  | { type: 'REGENERATE_SCHEDULE' };

const initialState: TimeFlowState = {
  tasks: [],
  schedule: [],
  currentDate: new Date().toISOString().split('T')[0],
  nonNegotiables: [
    {
      id: 'sleep',
      title: 'Sleep',
      duration: 480, // 8 hours
      dueDate: new Date(),
      scheduled: {
        day: new Date().toISOString().split('T')[0],
        startTime: '22:00',
      },
      completed: false,
      priority: 'high',
      isNonNegotiable: true,
    },
  ],
};

// Function to generate schedule based on tasks and non-negotiables
const generateSchedule = (state: TimeFlowState): DaySchedule[] => {
  const { tasks, nonNegotiables, currentDate } = state;
  
  // Get all scheduled tasks for each day (both regular tasks and non-negotiables)
  const scheduledTasksByDay: Record<string, Task[]> = {};
  
  // Add scheduled non-negotiables
  nonNegotiables
    .filter(task => task.scheduled)
    .forEach(task => {
      const day = task.scheduled!.day;
      if (!scheduledTasksByDay[day]) {
        scheduledTasksByDay[day] = [];
      }
      scheduledTasksByDay[day].push(task);
    });
  
  // Add scheduled tasks
  tasks
    .filter(task => task.scheduled && !task.completed)
    .forEach(task => {
      const day = task.scheduled!.day;
      if (!scheduledTasksByDay[day]) {
        scheduledTasksByDay[day] = [];
      }
      scheduledTasksByDay[day].push(task);
    });
  
  // Generate schedule for each day
  return Object.entries(scheduledTasksByDay).map(([date, dayTasks]) => {
    const timeBlocks: TimeBlock[] = dayTasks.map(task => ({
      id: `block-${task.id}`,
      task,
      startTime: task.scheduled!.startTime,
      endTime: addDurationToTime(task.scheduled!.startTime, task.duration),
      day: date,
    }));
    
    return {
      date,
      timeBlocks,
    };
  });
};

// Simple scheduler algorithm
const autoScheduleTasks = (state: TimeFlowState): TimeFlowState => {
  const { tasks, nonNegotiables, currentDate } = state;
  
  // Get all non-negotiable time blocks for the current day
  const nonNegotiableBlocks: TimeBlock[] = nonNegotiables
    .filter(task => task.scheduled && task.scheduled.day === currentDate)
    .map(task => ({
      id: `block-${task.id}`,
      task,
      startTime: task.scheduled!.startTime,
      endTime: addDurationToTime(task.scheduled!.startTime, task.duration),
      day: currentDate,
    }));

  // Find available time slots
  const availableSlots: { startTime: string; duration: number }[] = [];
  
  // This is a simplified version - in a real app, you'd implement a more sophisticated algorithm
  // For now, let's just add a slot in the afternoon
  const sleepBlock = nonNegotiableBlocks.find(block => block.task.id === 'sleep');
  
  if (sleepBlock) {
    const sleepStartTime = sleepBlock.startTime;
    
    // Add a slot in the afternoon
    availableSlots.push({
      startTime: '14:00',
      duration: 180, // 3 hours
    });
  } else {
    // If no sleep blocks, just add a default slot
    availableSlots.push({
      startTime: '14:00',
      duration: 180,
    });
  }
  
  // Schedule unscheduled tasks
  const updatedTasks = [...tasks];
  let currentSlotIndex = 0;
  
  for (let i = 0; i < updatedTasks.length; i++) {
    const task = updatedTasks[i];
    
    // Skip tasks that are already scheduled or completed
    if (task.scheduled || task.completed) continue;
    
    // Get the next available slot
    const slot = availableSlots[currentSlotIndex % availableSlots.length];
    if (!slot) continue;
    
    // Schedule the task
    updatedTasks[i] = {
      ...task,
      scheduled: {
        day: currentDate,
        startTime: slot.startTime,
      },
    };
    
    // Move to next slot for next task
    currentSlotIndex++;
  }
  
  const newState = {
    ...state,
    tasks: updatedTasks
  };
  
  // Generate updated schedule
  const updatedSchedule = generateSchedule(newState);
  
  return {
    ...newState,
    schedule: updatedSchedule
  };
};

const timeFlowReducer = (state: TimeFlowState, action: TimeFlowAction): TimeFlowState => {
  let updatedState: TimeFlowState;
  
  switch (action.type) {
    case 'ADD_TASK':
      updatedState = {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'UPDATE_TASK':
      updatedState = {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'DELETE_TASK':
      updatedState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'COMPLETE_TASK':
      updatedState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: true } : task
        ),
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'SET_CURRENT_DATE':
      return {
        ...state,
        currentDate: action.payload,
      };
      
    case 'SCHEDULE_TASK': {
      // Update the scheduled task
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? {
              ...task,
              scheduled: {
                day: action.payload.day,
                startTime: action.payload.startTime,
              },
            }
          : task
      );
      
      updatedState = {
        ...state,
        tasks: updatedTasks
      };
      
      // Generate updated schedule
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
    }
      
    case 'MOVE_TASK': {
      // Handle both tasks and non-negotiables for dragging
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? {
              ...task,
              scheduled: {
                day: action.payload.day,
                startTime: action.payload.startTime,
              },
            }
          : task
      );

      const updatedNonNegotiables = state.nonNegotiables.map(task =>
        task.id === action.payload.taskId
          ? {
              ...task,
              scheduled: {
                day: action.payload.day,
                startTime: action.payload.startTime,
              },
            }
          : task
      );

      updatedState = {
        ...state,
        tasks: updatedTasks,
        nonNegotiables: updatedNonNegotiables,
      };
      
      // Generate updated schedule
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
    }
      
    case 'AUTO_SCHEDULE_TASKS':
      return autoScheduleTasks(state);
      
    case 'ADD_NON_NEGOTIABLE':
      updatedState = {
        ...state,
        nonNegotiables: [...state.nonNegotiables, action.payload],
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'UPDATE_NON_NEGOTIABLE':
      updatedState = {
        ...state,
        nonNegotiables: state.nonNegotiables.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'DELETE_NON_NEGOTIABLE':
      updatedState = {
        ...state,
        nonNegotiables: state.nonNegotiables.filter(task => task.id !== action.payload),
      };
      return {
        ...updatedState,
        schedule: generateSchedule(updatedState)
      };
      
    case 'REGENERATE_SCHEDULE':
      return {
        ...state,
        schedule: generateSchedule(state)
      };
      
    default:
      return state;
  }
};

interface TimeFlowContextType extends TimeFlowState {
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  setCurrentDate: (date: string) => void;
  scheduleTask: (taskId: string, startTime: string, day: string) => void;
  autoScheduleTasks: () => void;
  addNonNegotiable: (task: Omit<Task, 'id'>) => void;
  updateNonNegotiable: (task: Task) => void;
  deleteNonNegotiable: (taskId: string) => void;
  getCurrentTask: () => Task | null;
  moveTask: (taskId: string, startTime: string, day: string) => void;
}

const TimeFlowContext = createContext<TimeFlowContextType | undefined>(undefined);

export const TimeFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(timeFlowReducer, initialState);

  // Auto-schedule tasks when first loaded
  useEffect(() => {
    dispatch({ type: 'AUTO_SCHEDULE_TASKS' });
  }, []);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const completeTask = (taskId: string) => {
    dispatch({ type: 'COMPLETE_TASK', payload: taskId });
  };

  const setCurrentDate = (date: string) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  };

  const scheduleTask = (taskId: string, startTime: string, day: string) => {
    dispatch({
      type: 'SCHEDULE_TASK',
      payload: { taskId, startTime, day },
    });
  };

  const moveTask = (taskId: string, startTime: string, day: string) => {
    dispatch({
      type: 'MOVE_TASK',
      payload: { taskId, startTime, day },
    });
  };

  const autoScheduleTasks = () => {
    dispatch({ type: 'AUTO_SCHEDULE_TASKS' });
  };

  const addNonNegotiable = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `non-${Date.now()}`,
      isNonNegotiable: true,
    };
    dispatch({ type: 'ADD_NON_NEGOTIABLE', payload: newTask });
  };

  const updateNonNegotiable = (task: Task) => {
    dispatch({ type: 'UPDATE_NON_NEGOTIABLE', payload: task });
  };

  const deleteNonNegotiable = (taskId: string) => {
    dispatch({ type: 'DELETE_NON_NEGOTIABLE', payload: taskId });
  };

  const getCurrentTask = (): Task | null => {
    const currentTime = getCurrentTimeSlot();
    const todaySchedule = state.schedule.find(day => day.date === state.currentDate);
    
    if (!todaySchedule) return null;
    
    const currentBlock = todaySchedule.timeBlocks.find(block => {
      return block.startTime <= currentTime && block.endTime > currentTime;
    });
    
    return currentBlock ? currentBlock.task : null;
  };

  return (
    <TimeFlowContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        setCurrentDate,
        scheduleTask,
        autoScheduleTasks,
        addNonNegotiable,
        updateNonNegotiable,
        deleteNonNegotiable,
        getCurrentTask,
        moveTask,
      }}
    >
      {children}
    </TimeFlowContext.Provider>
  );
};

export const useTimeFlow = (): TimeFlowContextType => {
  const context = useContext(TimeFlowContext);
  if (context === undefined) {
    throw new Error('useTimeFlow must be used within a TimeFlowProvider');
  }
  return context;
};
