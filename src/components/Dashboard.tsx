
import React, { useState } from 'react';
import { useTimeFlow } from '../context/TimeFlowContext';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import CurrentTaskCard from './CurrentTaskCard';
import TimeGrid from './TimeGrid';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Dashboard: React.FC = () => {
  const { currentDate, setCurrentDate, autoScheduleTasks } = useTimeFlow();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  const handlePrevDay = () => {
    const prevDate = subDays(new Date(currentDate), 1);
    setCurrentDate(format(prevDate, 'yyyy-MM-dd'));
  };
  
  const handleNextDay = () => {
    const nextDate = addDays(new Date(currentDate), 1);
    setCurrentDate(format(nextDate, 'yyyy-MM-dd'));
  };
  
  const handleToday = () => {
    setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">TimeFlow Pilot</h1>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={autoScheduleTasks}>
            <Clock className="mr-2 h-4 w-4" />
            Auto Schedule
          </Button>
          <Button onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <CurrentTaskCard />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={handlePrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold">
            {format(new Date(currentDate), 'EEEE, MMMM d')}
          </h2>
        </div>
        
        <Button variant="ghost" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeGrid />
        </div>
        <div>
          <TaskList />
        </div>
      </div>
      
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <AddTaskForm onClose={() => setIsAddTaskOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
