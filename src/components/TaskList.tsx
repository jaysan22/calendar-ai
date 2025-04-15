import React from 'react';
import { useTimeFlow } from '../context/TimeFlowContext';
import TaskCard from './TaskCard';
import { formatDate } from '../utils/dateUtils';
import { Task } from '../types';

const TaskList: React.FC = () => {
  const { tasks, completeTask, currentDate } = useTimeFlow();
  
  const unscheduledTasks = tasks.filter(task => !task.scheduled && !task.completed);
  const upcomingTasks = tasks.filter(task => task.scheduled && !task.completed)
    .sort((a, b) => {
      if (!a.scheduled || !b.scheduled) return 0;
      
      // First by date
      if (a.scheduled.day !== b.scheduled.day) {
        return a.scheduled.day.localeCompare(b.scheduled.day);
      }
      
      // Then by time
      return a.scheduled.startTime.localeCompare(b.scheduled.startTime);
    });
  
  const completedTasks = tasks.filter(task => task.completed);
  
  const groupTasksByDate = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (!task.scheduled) return;
      
      const day = task.scheduled.day;
      if (!groups[day]) {
        groups[day] = [];
      }
      
      groups[day].push(task);
    });
    
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  };
  
  const groupedUpcomingTasks = groupTasksByDate(upcomingTasks);

  const handleDragStart = (event: React.DragEvent, task: Task) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      taskId: task.id,
      type: 'task',
    }));
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-y-auto max-h-[calc(100vh-240px)] space-y-6">
      {unscheduledTasks.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-2 text-gray-600">Unscheduled Tasks</h3>
          <div className="space-y-2">
            {unscheduledTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={() => completeTask(task.id)}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      )}
      
      {groupedUpcomingTasks.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-2 text-gray-600">Upcoming</h3>
          <div className="space-y-4">
            {groupedUpcomingTasks.map(([date, tasks]) => (
              <div key={date}>
                <h4 className="text-xs font-medium text-gray-500 mb-1">
                  {formatDate(new Date(date))}
                </h4>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      onComplete={() => completeTask(task.id)}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-2 text-gray-600">Completed</h3>
          <div className="space-y-2 opacity-70">
            {completedTasks.slice(0, 5).map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isDraggable={false}
              />
            ))}
            {completedTasks.length > 5 && (
              <p className="text-xs text-center text-gray-500">
                + {completedTasks.length - 5} more completed tasks
              </p>
            )}
          </div>
        </div>
      )}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks yet. Add your first task to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
