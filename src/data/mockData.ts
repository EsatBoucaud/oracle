import { addDays, setHours, setMinutes, startOfWeek } from 'date-fns';

export type EventColor = 'blue' | 'purple' | 'orange' | 'red' | 'green';

export interface Calendar {
  id: string;
  name: string;
  color: EventColor;
}

export const CALENDARS: Calendar[] = [
  { id: 'article-a-day', name: 'Article-A-Day', color: 'blue' },
  { id: 'curriculum-lab', name: 'Curriculum Lab', color: 'orange' },
  { id: 'partnerships', name: 'Partnerships', color: 'purple' },
  { id: 'teacher-support', name: 'Teacher Support', color: 'green' },
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
    title: 'Article-A-Day text set review',
    start: at(0, 9),
    end: at(0, 9, 45),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Review the week sequence for Article-A-Day, which ReadWorks positions as a 10-minute daily routine to build background knowledge, vocabulary, and comprehension.',
    location: 'Content studio',
  },
  {
    id: '2',
    title: 'StepReads differentiation pass',
    start: at(0, 11),
    end: at(0, 12),
    color: 'blue',
    icon: 'video',
    calendarId: 'article-a-day',
    description:
      'Check leveled passage pairings and teacher notes for StepReads before the next classroom-facing update.',
    location: 'Remote editorial room',
  },
  {
    id: '3',
    title: 'Advanced search facet review',
    start: at(0, 14),
    end: at(0, 15),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Review filters, discovery paths, and teacher feedback around the ReadWorks advanced search experience.',
    location: 'Product and curriculum pod',
  },
  {
    id: '4',
    title: 'Teacher guide refresh day',
    start: at(1, 0),
    end: at(1, 23, 59),
    color: 'green',
    calendarId: 'teacher-support',
    isAllDay: true,
    description:
      'Working block for teacher guide updates, classroom routine notes, and webinar follow-up materials.',
  },
  {
    id: '5',
    title: 'Spanish-English paired texts QA',
    start: at(1, 10),
    end: at(1, 11),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Audit bilingual text pair metadata and classroom guidance before the next support release.',
    location: 'Bilingual resources desk',
  },
  {
    id: '6',
    title: 'Mississippi partnership check-in',
    start: at(1, 15),
    end: at(1, 16),
    color: 'purple',
    icon: 'video',
    calendarId: 'partnerships',
    description:
      'Use the February 11, 2026 Mississippi update as the briefing base: 20% of educators registered, 17,000 students reached in the first two years, and 87% of registered educators work in schools with 50% or more free or reduced lunch enrollment.',
    location: 'State partnership bridge',
  },
  {
    id: '7',
    title: 'Research loops planning session',
    start: at(2, 9),
    end: at(2, 10),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Plan the next multi-day Research Loops sequence that connects related texts, questions, and knowledge-building activities.',
    location: 'Research and curriculum room',
  },
  {
    id: '8',
    title: 'Webinar moderator office hours',
    start: at(2, 13),
    end: at(2, 14, 30),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Prepare host notes, classroom examples, and Q&A guidance for upcoming educator webinars.',
    location: 'Teacher support hub',
  },
  {
    id: '9',
    title: 'Book Studies scope review',
    start: at(3, 10),
    end: at(3, 11),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Review unit sequencing, vocabulary supports, and discussion prompts for the next Book Studies rollout.',
    location: 'Literacy programs table',
  },
  {
    id: '10',
    title: 'March 24 webinar dry run',
    start: at(3, 16),
    end: at(3, 17),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Dry run the March 24, 2026 joint webinar with Read STOP Write, including pacing, moderator notes, and demo transitions.',
    location: 'Virtual events channel',
  },
  {
    id: '11',
    title: 'Article-A-Day homepage fact update',
    start: at(4, 9),
    end: at(4, 10),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Refresh the public-facing fact stack around 6,000 plus texts, nearly 1 million educators, and 11 million students each school year.',
    location: 'Program operations desk',
  },
  {
    id: '12',
    title: 'Curriculum alignments publish check',
    start: at(4, 12),
    end: at(4, 13),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Confirm that standards and curriculum alignment references stay current across state and district-facing materials.',
    location: 'Alignment operations',
  },
  {
    id: '13',
    title: 'Partner story brief buildout',
    start: at(4, 15),
    end: at(4, 15, 45),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Pull statewide and district partner examples for the next partner-facing ReadWorks overview deck.',
    location: 'Partnership narrative board',
  },
  {
    id: '14',
    title: 'Diverse learners webinar follow-up',
    start: at(7, 9),
    end: at(7, 10),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Package educator takeaways from the February 24, 2026 webinar on supporting diverse learners with high-quality content.',
    location: 'Teacher success room',
  },
  {
    id: '15',
    title: 'Research Loops editorial day',
    start: at(8, 0),
    end: at(8, 23, 59),
    color: 'orange',
    calendarId: 'curriculum-lab',
    isAllDay: true,
    description:
      'Dedicated working block for Research Loops topic framing, article sequencing, and instructional support notes.',
  },
  {
    id: '16',
    title: 'Teacher newsletter publish review',
    start: at(8, 14),
    end: at(8, 15),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Final review of newsletter copy pointing educators to Article-A-Day, Book Studies, webinars, and the teacher guide.',
    location: 'Educator communications',
  },
  {
    id: '17',
    title: 'StepReads accessibility review',
    start: at(9, 10),
    end: at(9, 11),
    color: 'blue',
    icon: 'video',
    calendarId: 'article-a-day',
    description:
      'Check reading-level labels, usability notes, and support assets for differentiated classroom use.',
    location: 'Remote accessibility review',
  },
  {
    id: '18',
    title: 'District partner onboarding notes',
    start: at(10, 15),
    end: at(10, 16),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Update onboarding notes for districts using ReadWorks as part of broader literacy support and curriculum planning.',
    location: 'Partner enablement board',
  },
  {
    id: '19',
    title: 'Joint webinar with Read STOP Write',
    start: at(15, 14),
    end: at(15, 15),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Official March 24, 2026 webinar slot used in this portal as the anchor for moderator, communications, and classroom-resource prep.',
    location: 'ReadWorks webinars',
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
