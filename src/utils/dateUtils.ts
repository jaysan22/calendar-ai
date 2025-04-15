
import { format, addMinutes, parse, isToday, isTomorrow } from "date-fns";

export const formatDate = (date: Date): string => {
  if (isToday(date)) {
    return "Today";
  } else if (isTomorrow(date)) {
    return "Tomorrow";
  }
  return format(date, "EEE, MMM d");
};

export const formatTime = (time: string): string => {
  // Convert 24 hour format to 12 hour format
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const isPM = hour >= 12;
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes}${isPM ? "PM" : "AM"}`;
};

export const addDurationToTime = (time: string, durationInMinutes: number): string => {
  const [hours, minutes] = time.split(":");
  const dateTime = new Date();
  dateTime.setHours(parseInt(hours));
  dateTime.setMinutes(parseInt(minutes));
  
  const newDateTime = addMinutes(dateTime, durationInMinutes);
  return format(newDateTime, "HH:mm");
};

export const getTimeSlots = (startHour: number = 6, endHour: number = 23): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};

export const getCurrentTimeSlot = (): string => {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = Math.floor(now.getMinutes() / 30) * 30;
  return `${hour}:${minute.toString().padStart(2, '0')}`;
};

export const parseTimeString = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

export const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};
