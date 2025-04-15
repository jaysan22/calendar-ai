
import React, { useState } from 'react';
import { useTimeFlow } from '../context/TimeFlowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { formatDuration } from '../utils/dateUtils';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  onClose: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onClose }) => {
  const { addTask } = useTimeFlow();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30); // default 30 minutes
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    addTask({
      title,
      description,
      duration,
      dueDate,
      completed: false,
      priority,
      category: category || undefined,
    });
    
    onClose();
  };

  const handleDurationChange = (value: string) => {
    const hours = parseInt(value.split(':')[0]) || 0;
    const minutes = parseInt(value.split(':')[1]) || 0;
    setDuration(hours * 60 + minutes);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto animate-slide-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Add New Task</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
          <X size={18} />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task title</Label>
          <Input
            id="title"
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            placeholder="Add details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex items-center space-x-2">
              <Select 
                onValueChange={handleDurationChange}
                defaultValue="00:30"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="00:15">15 minutes</SelectItem>
                  <SelectItem value="00:30">30 minutes</SelectItem>
                  <SelectItem value="00:45">45 minutes</SelectItem>
                  <SelectItem value="01:00">1 hour</SelectItem>
                  <SelectItem value="01:30">1.5 hours</SelectItem>
                  <SelectItem value="02:00">2 hours</SelectItem>
                  <SelectItem value="03:00">3 hours</SelectItem>
                  <SelectItem value="04:00">4 hours</SelectItem>
                </SelectContent>
              </Select>
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 flex-1">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              defaultValue="medium"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && setDueDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            placeholder="e.g., Work, Study, Personal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Task</Button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;
