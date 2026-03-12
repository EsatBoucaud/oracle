import React, { useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Video, Check, Settings } from 'lucide-react';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isToday,
  isTomorrow,
} from 'date-fns';
import { cn } from '../utils/cn';
import { CalendarEvent, CALENDARS } from '../data/mockData';
import { AppScreen } from '../App';

interface SidebarProps {
  activeScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
  selectedCalendars: Set<string>;
  onToggleCalendar: (id: string) => void;
  onOpenSettings: () => void;
}

export function Sidebar({
  activeScreen,
  onScreenChange,
  currentDate,
  onDateChange,
  events,
  onAddEvent,
  onEventClick,
  selectedCalendars,
  onToggleCalendar,
  onOpenSettings,
}: SidebarProps) {
  const [calendarDate, setCalendarDate] = React.useState(currentDate);

  useEffect(() => {
    setCalendarDate(currentDate);
  }, [currentDate]);

  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const nextMonth = () => setCalendarDate(addMonths(calendarDate, 1));
  const prevMonth = () => setCalendarDate(subMonths(calendarDate, 1));

  const agendaEvents = useMemo(() => {
    const agenda: Array<{
      date: Date;
      label: string;
      events: Array<{
        id: string;
        title: string;
        time: string;
        color: CalendarEvent['color'];
        icon?: string;
        location?: string;
        isAllDay: boolean;
      }>;
    }> = [];

    for (let i = 0; i < 5; i += 1) {
      const date = addDays(currentDate, i);
      const dayEvents = events
        .filter((event) => isSameDay(event.start, date))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      if (dayEvents.length === 0 && i !== 0) continue;

      let label = format(date, 'EEEE').toUpperCase();
      if (isToday(date) || i === 0) label = 'TODAY';
      if (isTomorrow(date) || i === 1) label = 'TOMORROW';

      agenda.push({
        date,
        label,
        events: dayEvents.map((event) => ({
          id: event.id,
          title: event.title,
          time: event.isAllDay ? 'All day' : `${format(event.start, 'h:mm')} - ${format(event.end, 'h:mm a')}`,
          color: event.color,
          icon: event.icon,
          location: event.location,
          isAllDay: event.isAllDay || false,
        })),
      });
    }

    return agenda;
  }, [events, currentDate]);

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-zinc-950/92 text-zinc-100 lg:h-full lg:w-[340px] lg:border-b-0 lg:border-r lg:border-zinc-800/80">
      <div className="border-b border-white/8 p-5 pb-4">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(199,70,52,0.18),rgba(8,19,22,0.95)_60%)] p-4 shadow-[0_12px_36px_rgba(1,9,10,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#c74634,#7f2318)] text-sm font-semibold uppercase tracking-[0.24em] text-white">
                OR
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Oracle</p>
                <h1 className="text-xl font-semibold tracking-tight text-white">Employee ops portal</h1>
              </div>
            </div>
            <button
              onClick={onAddEvent}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-zinc-950 transition-transform hover:scale-[1.03]"
            >
              <Plus size={18} />
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Oracle employee scheduling, event timing, and research operations in one Infogito workspace.
          </p>

          <div className="mt-5 flex rounded-2xl border border-white/10 bg-white/5 p-1">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'arbor', label: 'Arbor' },
            ].map((screen) => (
              <button
                key={screen.id}
                onClick={() => onScreenChange(screen.id as AppScreen)}
                className={cn(
                  'flex-1 rounded-[14px] px-3 py-2 text-sm font-medium transition-all',
                  activeScreen === screen.id
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white',
                )}
              >
                {screen.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Built by</p>
              <img
                src="/infogito-logo.png"
                alt="Infogito"
                className="mt-2 h-5 w-auto object-contain opacity-75"
              />
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">Focus date</p>
              <p className="mt-1 text-sm font-medium text-zinc-100">{format(currentDate, 'EEE, MMM d')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {format(calendarDate, 'MMMM')} <span className="font-normal text-zinc-500">{format(calendarDate, 'yyyy')}</span>
        </h2>
        <div className="flex space-x-1">
          <button
            onClick={prevMonth}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-800/50 px-5 pb-6">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[11px] font-medium text-zinc-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-1 gap-y-1">
          {days.map((day) => {
            const isSelected = isSameDay(day, currentDate);
            const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
            const dayIsToday = isToday(day);

            return (
              <div key={day.toISOString()} className="flex h-8 flex-col items-center justify-center">
                <button
                  onClick={() => onDateChange(day)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all',
                    !isCurrentMonth && 'text-zinc-600',
                    isCurrentMonth && !isSelected && !dayIsToday && 'hover:bg-zinc-800',
                    dayIsToday && !isSelected && 'font-bold text-accent',
                    isSelected && 'bg-accent text-white shadow-sm shadow-accent/20',
                  )}
                >
                  {format(day, 'd')}
                </button>
                <div className="mt-[1px] flex h-1 space-x-[2px]">
                  {events
                    .filter((event) => isSameDay(event.start, day))
                    .slice(0, 3)
                    .map((event) => (
                      <div
                        key={`${day.toISOString()}-${event.id}`}
                        className={cn(
                          'h-1 w-1 rounded-full',
                          event.color === 'blue' && 'bg-blue-400',
                          event.color === 'purple' && 'bg-purple-400',
                          event.color === 'orange' && 'bg-orange-400',
                          event.color === 'red' && 'bg-pink-400',
                          event.color === 'green' && 'bg-emerald-400',
                        )}
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-b border-zinc-800/50 px-5 py-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Workstreams</h3>
        <div className="space-y-2">
          {CALENDARS.map((calendar) => {
            const isSelected = selectedCalendars.has(calendar.id);

            return (
              <label key={calendar.id} className="group flex cursor-pointer items-center space-x-3">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => onToggleCalendar(calendar.id)}
                />
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors',
                    isSelected
                      ? calendar.color === 'blue'
                        ? 'border-blue-500 bg-blue-500'
                        : calendar.color === 'purple'
                          ? 'border-purple-500 bg-purple-500'
                          : calendar.color === 'orange'
                            ? 'border-orange-500 bg-orange-500'
                            : calendar.color === 'red'
                              ? 'border-pink-500 bg-pink-500'
                              : 'border-emerald-500 bg-emerald-500'
                      : 'border-zinc-600 bg-transparent group-hover:border-zinc-500',
                  )}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm text-zinc-300 transition-colors group-hover:text-zinc-100">
                  {calendar.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Next five days</h3>
        {agendaEvents.map((dayGroup) => (
          <div key={dayGroup.date.toISOString()} className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline space-x-2">
                <span
                  className={cn(
                    'text-xs font-bold tracking-wider',
                    dayGroup.label === 'TODAY' ? 'text-accent' : 'text-zinc-400',
                  )}
                >
                  {dayGroup.label}
                </span>
                <span className="text-xs text-zinc-600">{format(dayGroup.date, 'M/d')}</span>
              </div>
            </div>

            <div className="space-y-3">
              {dayGroup.events.length === 0 ? (
                <div className="text-xs italic text-zinc-600">No scheduled items</div>
              ) : (
                dayGroup.events.map((event) => (
                  <div
                    key={event.id}
                    className="group -mx-2 flex cursor-pointer flex-col rounded-lg p-2 transition-colors hover:bg-zinc-800/50"
                    onClick={() => {
                      const fullEvent = events.find((entry) => entry.id === event.id);
                      if (fullEvent) onEventClick(fullEvent);
                    }}
                  >
                    {event.isAllDay ? (
                      <div
                        className={cn(
                          'mb-1 inline-block w-fit rounded-md px-2 py-1 text-xs font-medium text-white',
                          event.color === 'blue' && 'bg-blue-500',
                          event.color === 'purple' && 'bg-purple-500',
                          event.color === 'orange' && 'bg-orange-500',
                          event.color === 'red' && 'bg-pink-500',
                          event.color === 'green' && 'bg-emerald-500',
                        )}
                      >
                        {event.title}
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            event.color === 'blue' && 'bg-blue-400',
                            event.color === 'purple' && 'bg-purple-400',
                            event.color === 'orange' && 'bg-orange-400',
                            event.color === 'red' && 'bg-pink-400',
                            event.color === 'green' && 'bg-emerald-400',
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-tight text-zinc-200 transition-colors group-hover:text-white">
                            {event.title}
                          </span>
                          <div className="mt-1 flex items-center space-x-1 text-xs text-zinc-500">
                            <span>{event.time}</span>
                            {event.icon === 'video' && <Video size={12} className="ml-1" />}
                          </div>
                          {event.location && (
                            <span className="mt-0.5 truncate text-xs text-zinc-500">{event.location}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-zinc-800/50 p-4">
        <div className="space-y-2">
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center justify-center space-x-2 rounded-lg py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Settings size={16} />
            <span>Portal settings</span>
          </button>
          <p className="text-center text-[11px] uppercase tracking-[0.26em] text-zinc-600">
            Active screen: {activeScreen}
          </p>
        </div>
      </div>
    </aside>
  );
}
