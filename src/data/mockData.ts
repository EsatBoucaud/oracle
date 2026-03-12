import { addDays, setHours, setMinutes, startOfWeek } from 'date-fns';

export type EventColor = 'blue' | 'purple' | 'orange' | 'red' | 'green';

export interface Calendar {
  id: string;
  name: string;
  color: EventColor;
}

export const CALENDARS: Calendar[] = [
  { id: 'fusion-ai', name: 'Fusion AI', color: 'blue' },
  { id: 'database-oci', name: 'Database + OCI', color: 'orange' },
  { id: 'field-events', name: 'Field Events', color: 'purple' },
  { id: 'enablement', name: 'Enablement', color: 'green' },
];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: EventColor;
  icon?: string;
  link?: string;
  description?: string;
  location?: string;
  isAllDay?: boolean;
  calendarId: string;
}

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

const at = (dayOffset: number, hour: number, minute = 0) =>
  setHours(setMinutes(addDays(weekStart, dayOffset), minute), hour);

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Fusion AI Agent Studio workflow review',
    start: at(0, 9),
    end: at(0, 9, 45),
    color: 'blue',
    calendarId: 'fusion-ai',
    description:
      'Review agent packaging for Oracle Fusion Applications before broader enablement.',
    location: 'Oracle Redwood Shores / hybrid',
  },
  {
    id: '2',
    title: 'AI Agent Studio demo rehearsal',
    start: at(0, 11),
    end: at(0, 12),
    color: 'blue',
    icon: 'video',
    calendarId: 'fusion-ai',
    description:
      'Run through the Fusion AI Agent Studio demo flow built natively on Oracle Cloud Infrastructure.',
    location: 'Remote briefing room',
  },
  {
    id: '3',
    title: 'OCI public regions briefing',
    start: at(0, 14),
    end: at(0, 15),
    color: 'orange',
    calendarId: 'database-oci',
    description:
      'Refresh messaging around Oracle Cloud Infrastructure public regions, countries, and core service coverage.',
    location: 'Platform operations desk',
  },
  {
    id: '4',
    title: 'Oracle University enablement day',
    start: at(1, 0),
    end: at(1, 23, 59),
    color: 'green',
    calendarId: 'enablement',
    isAllDay: true,
    description:
      'Working block for MyLearn paths, AI cert alignment, and role-based learning updates.',
  },
  {
    id: '5',
    title: 'Oracle AI Database 26ai vector search review',
    start: at(1, 10),
    end: at(1, 11),
    color: 'orange',
    calendarId: 'database-oci',
    description:
      'Align product notes for AI Vector Search, in-database large language models, and the AI app development stack.',
    location: 'Database strategy room',
  },
  {
    id: '6',
    title: 'JavaOne 2026 content lock',
    start: at(1, 15),
    end: at(1, 16),
    color: 'purple',
    icon: 'video',
    calendarId: 'field-events',
    description:
      'Finalize speaker operations for JavaOne 2026, scheduled for March 17-19 in Redwood Shores.',
    location: 'Developer events bridge',
  },
  {
    id: '7',
    title: 'Oracle APEX AI app sprint check-in',
    start: at(2, 9),
    end: at(2, 10),
    color: 'blue',
    calendarId: 'fusion-ai',
    description:
      'Review enterprise AI application patterns in Oracle APEX with the platform squad.',
    location: 'APEX build pod',
  },
  {
    id: '8',
    title: 'Support Rewards office hours',
    start: at(2, 13),
    end: at(2, 14, 30),
    color: 'green',
    calendarId: 'enablement',
    description:
      'Prepare field guidance on Oracle Support Rewards earn rates tied to OCI consumption.',
    location: 'Customer success hub',
  },
  {
    id: '9',
    title: 'OCI services availability notes refresh',
    start: at(3, 10),
    end: at(3, 11),
    color: 'orange',
    calendarId: 'database-oci',
    description:
      'Update the shared brief with OCI service coverage, sovereign options, and dedicated region positioning.',
    location: 'Launch readiness room',
  },
  {
    id: '10',
    title: 'Oracle AI World Tour Chicago planning sync',
    start: at(3, 16),
    end: at(3, 17),
    color: 'purple',
    calendarId: 'field-events',
    description:
      'Align speaker, registration, and partner details for the April 7, 2026 Chicago stop.',
    location: 'Field events channel',
  },
  {
    id: '11',
    title: 'Fusion Applications agent use-case review',
    start: at(4, 9),
    end: at(4, 10),
    color: 'blue',
    calendarId: 'fusion-ai',
    description:
      'Prioritize HCM, ERP, and supply chain scenarios for the next Oracle Fusion AI walkthrough.',
    location: 'Applications PM table',
  },
  {
    id: '12',
    title: 'MyLearn certification path update',
    start: at(4, 12),
    end: at(4, 13),
    color: 'green',
    calendarId: 'enablement',
    description:
      'Publish role-based learning changes for Oracle Database, OCI, and AI-focused curriculum.',
    location: 'Oracle University operations',
  },
  {
    id: '13',
    title: 'JavaOne 2026 onsite readiness',
    start: at(7, 9),
    end: at(7, 9, 45),
    color: 'purple',
    calendarId: 'field-events',
    description:
      'Run final logistics for developer keynote support at the Oracle Conference Center in Redwood Shores.',
    location: 'Redwood Shores',
  },
  {
    id: '14',
    title: 'JavaOne 2026 Day 1',
    start: at(8, 0),
    end: at(8, 23, 59),
    color: 'purple',
    calendarId: 'field-events',
    isAllDay: true,
    description:
      'JavaOne 2026 opens on March 17 with sessions and demos for Oracle Java developers.',
    location: 'Oracle Conference Center, Redwood Shores',
  },
  {
    id: '15',
    title: 'Oracle Health Summit agenda review',
    start: at(8, 14),
    end: at(8, 15),
    color: 'purple',
    calendarId: 'field-events',
    description:
      'Review agenda framing for Oracle Health and Life Sciences Summit, set for September 22-24, 2026 in Orlando.',
    location: 'Industry events pod',
  },
  {
    id: '16',
    title: 'OCI architecture pattern review',
    start: at(9, 10),
    end: at(9, 11),
    color: 'orange',
    icon: 'video',
    calendarId: 'database-oci',
    description:
      'Validate field architecture notes for AI workloads running across OCI compute, data, and observability services.',
    location: 'Remote architecture room',
  },
  {
    id: '17',
    title: 'Fusion AI governance review',
    start: at(10, 15),
    end: at(10, 16),
    color: 'blue',
    calendarId: 'fusion-ai',
    description:
      'Check security, approvals, and data access guidance for Oracle Fusion AI agent rollouts.',
    location: 'Applications governance board',
  },
  {
    id: '18',
    title: 'Oracle University labs publish check',
    start: at(11, 13),
    end: at(11, 14),
    color: 'green',
    icon: 'video',
    calendarId: 'enablement',
    description:
      'Final publish review for LiveLabs and MyLearn updates tied to Oracle AI and OCI programs.',
    location: 'Enablement studio',
  },
];

export const getInitialFocusDate = (events: CalendarEvent[]) => {
  const now = Date.now();

  return events.reduce((closest, event) => {
    const closestDistance = Math.abs(closest.start.getTime() - now);
    const eventDistance = Math.abs(event.start.getTime() - now);
    return eventDistance < closestDistance ? event : closest;
  }, events[0]).start;
};
