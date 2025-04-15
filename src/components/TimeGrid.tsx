
import React, { useState } from 'react';
import { useTimeFlow } from '../context/TimeFlowContext';
import { getTimeSlots, formatTime, getCurrentTimeSlot } from '../utils/dateUtils';
import TaskCard from './TaskCard';
import { TimeBlock, Task } from '../types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';

const TimeGrid: React.FC = () => {
  const { schedule, currentDate, completeTask, getCurrentTask, moveTask } = useTimeFlow();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  const currentTask = getCurrentTask();
  const currentTimeSlot = getCurrentTimeSlot();
  const timeSlots = getTimeSlots(6, 23); // 6 AM to 11 PM
  
  const todaySchedule = schedule.find(day => day.date === currentDate);
  
  const handleDragStart = (event: React.DragEvent, block: TimeBlock) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      taskId: block.task.id,
      type: 'timeblock',
    }));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, timeSlot: string) => {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      const taskId = data.taskId;
      
      // Move the task to the new time slot
      moveTask(taskId, timeSlot, currentDate);
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };
  
  // Generate a map of which tasks start at which time slots
  const generateTaskStartMap = () => {
    if (!todaySchedule) return new Map();
    
    const taskStartMap = new Map<string, TimeBlock>();
    
    todaySchedule.timeBlocks.forEach(block => {
      taskStartMap.set(block.startTime, block);
    });
    
    return taskStartMap;
  };
  
  // Calculate how many time slots a task spans
  const calculateTaskSpan = (startTime: string, endTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Each slot is 30 minutes, so divide by 30 to get number of slots
    return Math.ceil((endMinutes - startMinutes) / 30);
  };
  
  const taskStartMap = generateTaskStartMap();
  
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-y-auto max-h-[calc(100vh-240px)]">
      <div className="space-y-0">
        {timeSlots.map((time, index) => {
          const isCurrentTimeSlot = time === currentTimeSlot;
          const taskBlock = taskStartMap.get(time);
          const hasTaskStarting = Boolean(taskBlock);
          
          // Calculate task span if a task starts in this slot
          const taskSpan = hasTaskStarting 
            ? calculateTaskSpan(taskBlock.startTime, taskBlock.endTime) 
            : 0;
            
          return (
            <div 
              key={time} 
              className={cn(
                `flex items-start border-t border-gray-100`,
                isCurrentTimeSlot ? 'bg-secondary/30' : ''
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, time)}
            >
              <div className={cn(
                "w-16 p-2 text-sm flex-shrink-0", 
                isCurrentTimeSlot ? "font-semibold text-primary" : "text-gray-500"
              )}>
                {formatTime(time)}
              </div>
              
              <div className="flex-grow min-h-[60px] relative">
                {hasTaskStarting && (
                  <div 
                    className={cn(
                      "absolute left-0 right-0 z-10",
                      taskSpan > 1 ? `h-[${taskSpan * 60}px]` : "h-[60px]"
                    )}
                    style={{ height: `${taskSpan * 60}px` }}
                  >
                    <TaskCard 
                      key={taskBlock.id}
                      task={taskBlock.task}
                      isCurrentTask={currentTask?.id === taskBlock.task.id}
                      onComplete={() => completeTask(taskBlock.task.id)}
                      onDragStart={(e) => handleDragStart(e, taskBlock)}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeGrid;
