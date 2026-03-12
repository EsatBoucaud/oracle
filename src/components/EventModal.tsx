import React, { useEffect, useState } from 'react';
import { X, Clock, AlignLeft, MapPin, Palette, Trash2, Folder } from 'lucide-react';
import { CalendarEvent, EventColor, CALENDARS } from '../data/mockData';
import { addHours, format, parse } from 'date-fns';
import { cn } from '../utils/cn';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
  onDelete?: (id: string) => void;
  event?: CalendarEvent | null;
  selectedDate?: Date;
  selectedTime?: string | null;
}

const COLORS: { value: EventColor; hex: string; label: string }[] = [
  { value: 'blue', hex: '#3b82f6', label: 'Blue' },
  { value: 'purple', hex: '#a855f7', label: 'Purple' },
  { value: 'orange', hex: '#f97316', label: 'Orange' },
  { value: 'red', hex: '#ec4899', label: 'Red' },
  { value: 'green', hex: '#10b981', label: 'Green' },
];

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
  selectedTime,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<EventColor>('blue');
  const [calendarId, setCalendarId] = useState<string>(CALENDARS[0].id);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(format(event.start, 'yyyy-MM-dd'));
      setStartTime(format(event.start, 'HH:mm'));
      setEndTime(format(event.end, 'HH:mm'));
      setIsAllDay(event.isAllDay || false);
      setLocation(event.location || '');
      setDescription(event.description || '');
      setColor(event.color);
      setCalendarId(event.calendarId);
      return;
    }

    const initialTime = selectedTime || '09:00';
    const [hours, minutes] = initialTime.split(':');
    const endHours = String((parseInt(hours, 10) + 1) % 24).padStart(2, '0');

    setTitle('');
    setDate(format(selectedDate || new Date(), 'yyyy-MM-dd'));
    setStartTime(initialTime);
    setEndTime(`${endHours}:${minutes}`);
    setIsAllDay(false);
    setLocation('');
    setDescription('');
    setColor('blue');
    setCalendarId(CALENDARS[0].id);
  }, [event, selectedDate, selectedTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = isAllDay
      ? parse(`${date} 00:00`, 'yyyy-MM-dd HH:mm', new Date())
      : parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());

    const parsedEnd = isAllDay
      ? parse(`${date} 23:59`, 'yyyy-MM-dd HH:mm', new Date())
      : parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());

    const end = !isAllDay && parsedEnd <= start ? addHours(start, 1) : parsedEnd;

    onSave({
      ...(event ? { id: event.id } : {}),
      title: title || 'Untitled item',
      start,
      end,
      color,
      description,
      location,
      isAllDay,
      calendarId,
    } as CalendarEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            {event ? 'Edit item' : 'New item'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <input
              autoFocus
              type="text"
              placeholder="ReadWorks review, webinar, or partner sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-0 border-b-2 border-transparent bg-transparent px-0 py-2 text-2xl font-semibold text-zinc-900 transition-colors placeholder:text-zinc-300 hover:border-zinc-200 focus:border-accent focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:hover:border-zinc-700"
            />
          </div>

          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <Clock className="mt-2.5 h-5 w-5 shrink-0 text-zinc-400" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">All-day</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-accent/30 dark:bg-zinc-700" />
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full flex-1 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-accent focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                  />
                  {!isAllDay && (
                    <>
                      <input
                        required
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-32 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-accent focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                      />
                      <span className="text-zinc-400">-</span>
                      <input
                        required
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-32 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-accent focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Folder className="h-5 w-5 shrink-0 text-zinc-400" />
              <select
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                className="w-full flex-1 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm text-zinc-900 transition-colors focus:border-accent focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
              >
                {CALENDARS.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <MapPin className="h-5 w-5 shrink-0 text-zinc-400" />
              <input
                type="text"
                placeholder="Add ReadWorks room, Zoom, or district name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 border-0 border-b border-transparent bg-transparent px-0 py-2 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 hover:border-zinc-200 focus:border-accent focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-700"
              />
            </div>

            <div className="flex items-start space-x-4">
              <AlignLeft className="mt-2.5 h-5 w-5 shrink-0 text-zinc-400" />
              <textarea
                placeholder="Add ReadWorks planning notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full flex-1 resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-accent focus:ring-accent dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Palette className="h-5 w-5 shrink-0 text-zinc-400" />
              <div className="flex space-x-3">
                {COLORS.map((entry) => (
                  <button
                    key={entry.value}
                    type="button"
                    onClick={() => setColor(entry.value)}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:scale-110',
                      color === entry.value && 'ring-2 ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-900',
                    )}
                    style={{ backgroundColor: entry.hex }}
                    title={entry.label}
                  >
                    {color === entry.value && <div className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800">
            {event && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
