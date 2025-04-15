
import React, { useEffect, useState } from 'react';
import { useTimeFlow } from '../context/TimeFlowContext';
import { formatTime } from '../utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CurrentTaskCard: React.FC = () => {
  const { getCurrentTask, completeTask } = useTimeFlow();
  const currentTask = getCurrentTask();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  if (!currentTask) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-medium mb-2">
            {formatTime(`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`)}
          </div>
          <div className="text-gray-500">Free time - No current task</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "bg-white rounded-lg shadow p-6",
      currentTask.isNonNegotiable ? "border-l-4 border-secondary-foreground" : "border-l-4 border-primary"
    )}>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-medium mb-1">
            {formatTime(`${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`)}
          </div>
          <h2 className="text-lg font-semibold">
            Current: {currentTask.title}
          </h2>
          {currentTask.description && (
            <p className="text-gray-600 text-sm mt-1">{currentTask.description}</p>
          )}
        </div>
        
        <div className="flex items-center">
          {!currentTask.completed && (
            <Button 
              variant="outline" 
              className="ml-4"
              onClick={() => completeTask(currentTask.id)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center mt-4 text-sm text-gray-500">
        <Clock size={16} className="mr-1" />
        <span>
          {currentTask.scheduled ? `Scheduled: ${currentTask.scheduled.startTime} - ${
            new Date(
              new Date(`2000-01-01T${currentTask.scheduled.startTime}`).getTime() + 
              currentTask.duration * 60000
            ).toTimeString().substring(0, 5)
          }` : 'Not scheduled'}
        </span>
      </div>
    </div>
  );
};

export default CurrentTaskCard;
