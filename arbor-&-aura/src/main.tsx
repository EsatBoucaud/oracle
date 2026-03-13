import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { mockEvents, getInitialFocusDate } from '../../src/data/mockData';
import type { CalendarEvent } from '../../src/data/mockData';
import type { ViewMode } from '../../src/types/app';

function StandaloneArborApp() {
  const [currentDate, setCurrentDate] = useState(() => getInitialFocusDate(mockEvents));
  const [events] = useState<CalendarEvent[]>(mockEvents);
  const [calendarView, setCalendarView] = useState<ViewMode>('Week');
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');

  return (
    <App
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      events={events}
      onEventClick={() => {}}
      onGridClick={() => {}}
      calendarView={calendarView}
      onCalendarViewChange={setCalendarView}
      calendarSearchQuery={calendarSearchQuery}
      onCalendarSearchChange={setCalendarSearchQuery}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandaloneArborApp />
  </StrictMode>,
);
