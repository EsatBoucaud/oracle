import React, { Suspense, useMemo, useState } from 'react';
import { DashboardScreen } from './components/DashboardScreen';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { EventModal } from './components/EventModal';
import { SettingsModal } from './components/SettingsModal';
import { mockEvents, CalendarEvent, CALENDARS, getInitialFocusDate } from './data/mockData';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

export type ViewMode = 'Day' | 'Week' | 'Month';
export type AppScreen = 'dashboard' | 'calendar' | 'arbor';

const ArborAuraApp = React.lazy(() => import('../arbor-&-aura/src/App'));

function MascotDock() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 hidden sm:block">
      <div className="mascot-float flex items-end gap-3 rounded-2xl border border-white/10 bg-zinc-950/75 px-3 py-2 shadow-[0_20px_60px_rgba(2,12,15,0.45)] backdrop-blur">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Oracle</p>
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
  const { backgroundImage } = useTheme();
  const [currentDate, setCurrentDate] = useState(() => getInitialFocusDate(mockEvents));
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [activeScreen, setActiveScreen] = useState<AppScreen>('dashboard');
  const [view, setView] = useState<ViewMode>('Week');
  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(
    () => new Set(CALENDARS.map((calendar) => calendar.id)),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCalendar = selectedCalendars.has(event.calendarId);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.description?.toLowerCase().includes(normalizedQuery) ||
        event.location?.toLowerCase().includes(normalizedQuery);

      return matchesCalendar && matchesSearch;
    });
  }, [events, selectedCalendars, searchQuery]);

  const handleToggleCalendar = (id: string) => {
    setSelectedCalendars((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setSelectedTime(null);
    setIsModalOpen(true);
  };

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
    <div className="relative min-h-screen overflow-hidden font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(199,70,52,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(243,178,57,0.16),_transparent_32%),linear-gradient(180deg,_#140806_0%,_#04090b_100%)]" />

      <div className="relative p-3 sm:p-4 lg:p-6">
        <div className="glass-panel relative flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-white/88 text-zinc-900 shadow-[0_32px_120px_rgba(3,12,15,0.48)] dark:bg-zinc-950/78 dark:text-zinc-100 lg:flex-row">
          {backgroundImage && (
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(199,70,52,0.08),transparent_38%,rgba(243,178,57,0.08))]" />

          <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col lg:flex-row">
            <Sidebar
              activeScreen={activeScreen}
              onScreenChange={setActiveScreen}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              events={filteredEvents}
              onAddEvent={handleAddEvent}
              onEventClick={handleEventClick}
              selectedCalendars={selectedCalendars}
              onToggleCalendar={handleToggleCalendar}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
            {activeScreen === 'dashboard' ? (
              <DashboardScreen
                currentDate={currentDate}
                events={filteredEvents}
                onOpenCalendar={() => setActiveScreen('calendar')}
              />
            ) : activeScreen === 'arbor' ? (
              <Suspense
                fallback={
                  <section className="flex h-full min-h-0 flex-1 items-center justify-center bg-zinc-950/40">
                    <div className="rounded-3xl border border-white/10 bg-black/30 px-6 py-5 text-center backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Loading</p>
                      <p className="mt-2 text-sm text-zinc-200">Oracle research workspace is being prepared.</p>
                    </div>
                  </section>
                }
              >
                <ArborAuraApp embedded />
              </Suspense>
            ) : (
              <MainContent
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                events={filteredEvents}
                onEventClick={handleEventClick}
                onGridClick={handleGridClick}
                view={view}
                onViewChange={setView}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={activeScreen === 'calendar' && isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={currentDate}
        selectedTime={selectedTime}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <MascotDock />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
