import React, { useState } from 'react';
import { EventModal } from './components/EventModal';
import { SettingsModal } from './components/SettingsModal';
import { mockEvents, CalendarEvent, getInitialFocusDate } from './data/mockData';
import { ThemeProvider } from './contexts/ThemeContext';
import { ViewMode } from './types/app';

const ArborAuraApp = React.lazy(() => import('../arbor-&-aura/src/App'));

export type AppScreen = 'dashboard' | 'calendar' | 'arbor';

function MascotDock() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 hidden sm:block">
      <div className="mascot-float flex items-end gap-3 rounded-2xl border border-white/10 bg-zinc-950/75 px-3 py-2 shadow-[0_20px_60px_rgba(2,12,15,0.45)] backdrop-blur">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">ReadWorks</p>
          <p className="text-xs font-medium text-zinc-200">Infogito portal active</p>
        </div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-20 w-20 rounded-xl object-cover"
          src="/mascot-loop.webm"
        />
      </div>
    </div>
  );
}

function AppContent() {
  const [currentDate, setCurrentDate] = useState(() => getInitialFocusDate(mockEvents));
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [view, setView] = useState<ViewMode>('Week');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedTime(null);
    setIsModalOpen(true);
  };

  const handleGridClick = (date: Date, time: string) => {
    setCurrentDate(date);
    setSelectedEvent(null);
    setSelectedTime(time);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    if ('id' in eventData && eventData.id) {
      setEvents((current) =>
        current.map((event) => (event.id === eventData.id ? (eventData as CalendarEvent) : event)),
      );
      return;
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).slice(2, 11),
    };

    setEvents((current) => [...current, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));
  };

  return (
    <>
      <React.Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(5,159,197,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,142,59,0.14),_transparent_32%),linear-gradient(180deg,_#071118_0%,_#02070a_100%)] text-zinc-100">
            <div className="rounded-3xl border border-white/10 bg-black/30 px-6 py-5 text-center backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Loading</p>
              <p className="mt-2 text-sm text-zinc-200">ReadWorks research workspace is being prepared.</p>
            </div>
          </div>
        }
      >
        <ArborAuraApp
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          events={events}
          onEventClick={handleEventClick}
          onGridClick={handleGridClick}
          calendarView={view}
          onCalendarViewChange={setView}
          calendarSearchQuery={calendarSearchQuery}
          onCalendarSearchChange={setCalendarSearchQuery}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </React.Suspense>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={currentDate}
        selectedTime={selectedTime}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <MascotDock />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
