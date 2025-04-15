
import React from 'react';
import { Task } from '../types';
import { formatDuration } from '../utils/dateUtils';
import { Clock, CheckCircle2, AlarmClock, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isCurrentTask?: boolean;
  onComplete?: () => void;
  className?: string;
  isDraggable?: boolean;
  onDragStart?: (event: React.DragEvent, task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  isCurrentTask = false,
  onComplete,
  className,
  isDraggable = true,
  onDragStart
}) => {
  const priorityColors = {
    low: 'border-blue-400',
    medium: 'border-yellow-400',
    high: 'border-red-400'
  };

  const handleDragStart = (event: React.DragEvent) => {
    if (onDragStart && isDraggable) {
      onDragStart(event, task);
    }
  };

  return (
    <div 
      className={cn(
        'task-card',
        priorityColors[task.priority],
        task.completed && 'opacity-60 bg-gray-50',
        task.isNonNegotiable && 'non-negotiable',
        isCurrentTask && 'current-task',
        isDraggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{task.title}</h3>
        <div className="flex items-center">
          {isDraggable && (
            <Move size={14} className="text-gray-400 mr-1" />
          )}
          <div className="flex space-x-1 items-center text-xs text-gray-500">
            <Clock size={14} />
            <span>{formatDuration(task.duration)}</span>
          </div>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center text-xs">
          {task.scheduled && (
            <div className="flex items-center text-gray-500 mr-2">
              <AlarmClock size={14} className="mr-1" />
              <span>{task.scheduled.startTime}</span>
            </div>
          )}
          {task.category && (
            <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
              {task.category}
            </span>
          )}
        </div>
        
        {!task.completed && onComplete && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto"
            onClick={onComplete}
          >
            <CheckCircle2 size={16} className="text-green-500" />
          </Button>
        )}
        
        {task.completed && (
          <CheckCircle2 size={16} className="text-green-500" />
        )}
      </div>
    </div>
  );
};

export default TaskCard;
