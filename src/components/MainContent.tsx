import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Video } from 'lucide-react';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { cn } from '../utils/cn';
import { CalendarEvent } from '../data/mockData';
import { ViewMode } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

interface MainContentProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onGridClick: (date: Date, time: string) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface CalendarViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onGridClick: (date: Date, time: string) => void;
}

interface WeekViewProps extends CalendarViewProps {
  view: ViewMode;
}

const HOUR_HEIGHT = 64;

const getEventColorClasses = (color: string, isAllDay = false) => {
  if (isAllDay) {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      case 'red':
        return 'bg-pink-500 text-white';
      case 'green':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-zinc-500 text-white';
    }
  }

  switch (color) {
    case 'blue':
      return 'border-l-4 border-blue-500 bg-blue-50/90 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100';
    case 'purple':
      return 'border-l-4 border-purple-500 bg-purple-50/90 text-purple-700 dark:bg-purple-500/15 dark:text-purple-100';
    case 'orange':
      return 'border-l-4 border-orange-500 bg-orange-50/90 text-orange-700 dark:bg-orange-500/15 dark:text-orange-100';
    case 'red':
      return 'border-l-4 border-pink-500 bg-pink-50/90 text-pink-700 dark:bg-pink-500/15 dark:text-pink-100';
    case 'green':
      return 'border-l-4 border-emerald-500 bg-emerald-50/90 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100';
    default:
      return 'border-l-4 border-zinc-400 bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';
  }
};

function MonthView({ currentDate, events, onEventClick, onGridClick }: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rows = days.length / 7;

  return (
    <div className="flex h-full flex-1 flex-col bg-white/95 dark:bg-zinc-950/70">
      <div className="grid shrink-0 grid-cols-7 border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r border-zinc-200 py-2 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 last:border-r-0 dark:border-zinc-800 dark:text-zinc-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayEvents = events.filter((event) => isSameDay(event.start, day));

          return (
            <div
              key={day.toISOString()}
              onClick={() => onGridClick(day, '09:00')}
              className={cn(
                'flex cursor-pointer flex-col gap-1 border-b border-r border-zinc-200 p-1 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900',
                !isCurrentMonth && 'bg-zinc-50/50 text-zinc-400 dark:bg-zinc-900/50 dark:text-zinc-600',
                (index + 1) % 7 === 0 && 'border-r-0',
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span
                  className={cn(
                    'mt-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium',
                    isSameDay(day, new Date())
                      ? 'bg-accent text-white'
                      : isCurrentMonth
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-400 dark:text-zinc-600',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
                {dayEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={cn(
                      'truncate rounded-sm px-1.5 py-0.5 text-[10px] font-semibold transition-transform hover:scale-[1.02]',
                      event.isAllDay ? getEventColorClasses(event.color, true) : getEventColorClasses(event.color),
                    )}
                  >
                    {!event.isAllDay && <span className="mr-1 opacity-75">{format(event.start, 'h:mm')}</span>}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <div className="px-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    +{dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ currentDate, events, onEventClick, onGridClick, view }: WeekViewProps) {
  const weekStart = view === 'Day' ? currentDate : startOfWeek(currentDate);
  const daysCount = view === 'Day' ? 1 : 7;
  const days = Array.from({ length: daysCount }, (_, index) => addDays(weekStart, index));
  const hours = Array.from({ length: 11 }, (_, index) => index + 7);

  const getEventStyle = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();
    const top = ((startHour - 7) * 60 + startMinute) * (HOUR_HEIGHT / 60);
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    const height = duration * (HOUR_HEIGHT / 60);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto bg-white/95 dark:bg-zinc-950/70">
      <div className="sticky top-0 z-20 flex shrink-0 border-b border-zinc-200 bg-white/95 shadow-sm shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-zinc-950/50">
        <div className="w-16 shrink-0 border-r border-zinc-200 dark:border-zinc-800" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex flex-1 flex-col items-center border-r border-zinc-200 p-3 dark:border-zinc-800"
          >
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {format(day, 'EEE')}
            </span>
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-2xl font-semibold',
                isSameDay(day, new Date()) ? 'bg-accent text-white' : 'text-zinc-900 dark:text-zinc-100',
              )}
            >
              {format(day, 'd')}
            </span>
          </div>
        ))}
        <div className="w-4 shrink-0" />
      </div>

      <div className="relative flex flex-1">
        <div className="z-10 flex w-16 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {hours.map((hour) => (
            <div key={hour} className="relative h-16 border-b border-zinc-100 dark:border-zinc-800/50">
              <span className="absolute -top-2.5 right-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-1">
          {days.map((day) => {
            const dayEvents = events.filter((event) => isSameDay(event.start, day));
            const now = new Date();
            const showTimeLine =
              isSameDay(day, now) && now.getHours() >= 7 && now.getHours() <= 17;
            const timeLineTop = showTimeLine
              ? (now.getHours() - 7) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT
              : 0;

            return (
              <div key={day.toISOString()} className="relative flex-1 border-r border-zinc-200 dark:border-zinc-800">
                {hours.map((hour) => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    onClick={() => onGridClick(day, `${String(hour).padStart(2, '0')}:00`)}
                    className="h-16 cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
                  />
                ))}

                {showTimeLine && (
                  <div
                    className="pointer-events-none absolute z-20 flex w-full items-center"
                    style={{ top: `${timeLineTop}px`, transform: 'translateY(-50%)' }}
                  >
                    <div className="-ml-[5px] h-2.5 w-2.5 rounded-full bg-accent" />
                    <div className="flex-1 border-t-2 border-accent" />
                  </div>
                )}

                <div className="absolute left-0 right-0 top-0 z-30 flex flex-col gap-1 p-1">
                  {dayEvents
                    .filter((event) => event.isAllDay)
                    .map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          'cursor-pointer truncate rounded-sm px-2 py-1 text-xs font-semibold shadow-sm transition-transform hover:scale-[1.02]',
                          getEventColorClasses(event.color, true),
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                </div>

                {dayEvents
                  .filter((event) => !event.isAllDay)
                  .map((event) => {
                    const overlappingEvents = dayEvents.filter(
                      (entry) =>
                        !entry.isAllDay &&
                        ((entry.start >= event.start && entry.start < event.end) ||
                          (entry.end > event.start && entry.end <= event.end) ||
                          (entry.start <= event.start && entry.end >= event.end)),
                    );

                    const overlapIndex = overlappingEvents.findIndex((entry) => entry.id === event.id);
                    const style = getEventStyle(event);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={cn(
                          'absolute cursor-pointer overflow-hidden rounded-md p-2 transition-all hover:z-10 hover:shadow-md',
                          getEventColorClasses(event.color),
                          overlappingEvents.length > 1
                            ? overlapIndex === 0
                              ? 'left-1 right-[51%]'
                              : 'left-[51%] right-1'
                            : 'left-1 right-1',
                        )}
                        style={style}
                      >
                        <div className="flex items-start space-x-1">
                          <span className="whitespace-nowrap text-xs font-semibold">
                            {format(event.start, 'h:mm a')}
                          </span>
                          {event.icon === 'video' ? (
                            <Video size={12} className="mt-0.5 shrink-0" />
                          ) : null}
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-xs font-semibold leading-tight">
                          {event.title}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        <div className="w-4 shrink-0 border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />
      </div>
    </div>
  );
}

export function MainContent({
  currentDate,
  onDateChange,
  events,
  onEventClick,
  onGridClick,
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
}: MainContentProps) {
  const nextPeriod = () => {
    if (view === 'Month') onDateChange(addMonths(currentDate, 1));
    else if (view === 'Week') onDateChange(addWeeks(currentDate, 1));
    else onDateChange(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (view === 'Month') onDateChange(subMonths(currentDate, 1));
    else if (view === 'Week') onDateChange(subWeeks(currentDate, 1));
    else onDateChange(addDays(currentDate, -1));
  };

  const goToday = () => onDateChange(new Date());

  const getHeaderLabel = () => {
    if (view === 'Month') return format(currentDate, 'MMMM yyyy');
    if (view === 'Day') return format(currentDate, 'EEEE, MMMM d, yyyy');

    const rangeStart = startOfWeek(currentDate);
    const rangeEnd = endOfWeek(currentDate);

    if (isSameMonth(rangeStart, rangeEnd)) {
      return format(rangeStart, 'MMMM yyyy');
    }

    return `${format(rangeStart, 'MMM')} - ${format(rangeEnd, 'MMM yyyy')}`;
  };

  const visibleEvents = useMemo(() => {
    if (view === 'Month') {
      return events.filter((event) => isSameMonth(event.start, currentDate));
    }

    if (view === 'Day') {
      return events.filter((event) => isSameDay(event.start, currentDate));
    }

    const rangeStart = startOfWeek(currentDate);
    const rangeEnd = endOfWeek(currentDate);

    return events.filter((event) =>
      isWithinInterval(event.start, { start: rangeStart, end: rangeEnd }),
    );
  }, [currentDate, events, view]);

  const upcomingVisibleEvents = useMemo(
    () => visibleEvents.slice().sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 4),
    [visibleEvents],
  );

  const nextScheduledEvent = useMemo(() => {
    const now = Date.now();
    const futureEvents = events
      .filter((event) => event.end.getTime() >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (futureEvents.length > 0) {
      return futureEvents[0];
    }

    return events.slice().sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  }, [events]);

  const summaryCards = useMemo(
    () => [
      {
        label: 'Selected day',
        value: events.filter((event) => isSameDay(event.start, currentDate)).length,
        caption: 'Items locked to this date',
      },
      {
        label: 'Fusion AI',
        value: events.filter((event) => event.calendarId === 'fusion-ai').length,
        caption: 'Agent and app items in view',
      },
      {
        label: 'Live briefings',
        value: events.filter((event) => event.icon === 'video').length,
        caption: 'Remote reviews still in play',
      },
    ],
    [events, currentDate],
  );

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800/80 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent-text)] dark:text-[color:var(--color-accent)]">
                Oracle operations board
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Working window for Oracle launches, field events, and enablement.
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {getHeaderLabel()}
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Keep Oracle scheduling front and center. The overview stays on the dashboard screen.
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {visibleEvents.length} pre-filled item{visibleEvents.length === 1 ? '' : 's'} in this {view.toLowerCase()} view.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                    {card.label}
                  </p>
                  <div className="mt-1.5 flex items-end justify-between gap-3">
                    <p className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{card.value}</p>
                    <p className="text-xs text-right text-zinc-600 dark:text-zinc-400">{card.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-3 xl:items-end">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search Oracle products, events, or locations"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200/70 bg-white/85 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/10 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-white/80 p-1 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/80">
                <button
                  onClick={prevPeriod}
                  className="rounded-xl p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goToday}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Today
                </button>
                <button
                  onClick={nextPeriod}
                  className="rounded-xl p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center rounded-2xl border border-zinc-200/70 bg-white/80 p-1 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/80">
                {['Day', 'Week', 'Month'].map((value) => (
                  <button
                    key={value}
                    onClick={() => onViewChange(value as ViewMode)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                      view === value
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden bg-transparent p-3 sm:p-4">
        <div className="absolute inset-4 flex flex-col overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-950/75">
          <div className="border-b border-zinc-200/80 bg-zinc-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
            {visibleEvents.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {upcomingVisibleEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80',
                      event.color === 'blue' && 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-100',
                      event.color === 'purple' && 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/15 dark:text-purple-100',
                      event.color === 'orange' && 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-100',
                      event.color === 'red' && 'border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-500/40 dark:bg-pink-500/15 dark:text-pink-100',
                      event.color === 'green' && 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100',
                    )}
                  >
                    {format(event.start, 'EEE h:mm a')} - {event.title}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    No scheduled items in this {view.toLowerCase()} window
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Jump back to the nearest Oracle program block.
                  </p>
                </div>
                {nextScheduledEvent && (
                  <button
                    onClick={() => onDateChange(nextScheduledEvent.start)}
                    className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Jump to {format(nextScheduledEvent.start, 'MMM d')}
                  </button>
                )}
              </div>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${view}-${currentDate.toISOString()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex h-full flex-1 flex-col"
            >
              {view === 'Month' ? (
                <MonthView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={onEventClick}
                  onGridClick={onGridClick}
                />
              ) : (
                <WeekView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={onEventClick}
                  onGridClick={onGridClick}
                  view={view}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
