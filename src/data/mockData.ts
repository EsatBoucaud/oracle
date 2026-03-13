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
      'Review the week sequence for Article-A-Day, which ReadWorks positions as a 10 to 15 minute daily routine that builds background knowledge, vocabulary, and reading stamina.',
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
      'Check leveled passage pairings, boost and challenge article links, and teacher notes for the next classroom-facing StepReads update.',
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
      'Review filters, discovery paths, and teacher feedback around the ReadWorks advanced search experience so teams can find connected content faster.',
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
      'Working block for teacher guide updates, science-of-reading framing, classroom-routine notes, and webinar follow-up materials.',
  },
  {
    id: '5',
    title: 'Spanish-English paired texts QA',
    start: at(1, 10),
    end: at(1, 11),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Audit bilingual text pair metadata, ELL support notes, and assignment pathways before the next support release.',
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
      'Use the February 11, 2026 Mississippi update as the briefing base: more than 7,000 reading specialists and paraprofessionals use ReadWorks, representing 20% of Mississippi educators, with 17,000 students reached over the first two years of support.',
    location: 'State partnership bridge',
  },
  {
    id: '7',
    title: 'Research Loops planning session',
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
      'Prepare host notes, classroom examples, and Q&A guidance for upcoming educator webinars led by Tamika Reece.',
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
      'Refresh the public-facing fact stack around 6,000 plus texts, all 50 states, more than 1 million teachers over time, and 17 million students reached.',
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
      'Confirm that curriculum support pages for CKLA, NGSS, Wit & Wisdom, and district-facing alignment notes are still accurate.',
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
      'Pull statewide and district partner examples for the next ReadWorks overview deck, including evidence, adoption, and implementation support.',
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
      'Dedicated working block for Research Loops topic framing, article sequencing, assessment notes, and instructional support planning.',
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
      'Check reading-level labels, audio support pathways, and differentiation notes for classroom use.',
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
      'Update onboarding notes for districts using ReadWorks as a supplemental literacy support with free or low-cost PD options.',
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
  {
    id: '20',
    title: 'Action Research Guide intake sync',
    start: at(5, 9),
    end: at(5, 10),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Prepare support materials for teachers using the six-week K-2 action research guide built around Article-A-Day plus decodables.',
    location: 'Research operations',
  },
  {
    id: '21',
    title: 'Fall 2025 survey insight review',
    start: at(5, 11),
    end: at(5, 12),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Review the 2026 survey recap: nearly 7,000 participants, 95% satisfaction, and a strong need for time-saving onboarding and PD support.',
    location: 'Strategy room',
  },
  {
    id: '22',
    title: 'ESSA evidence and impact page QA',
    start: at(5, 14),
    end: at(5, 15),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Verify language around ReadWorks meeting Tier-3 promising evidence under ESSA and keep the impact page aligned across surfaces.',
    location: 'Impact communications',
  },
  {
    id: '23',
    title: 'Decodables and UFLI support review',
    start: at(6, 9),
    end: at(6, 10),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Check K-2 decodables support language, Mississippi alignment notes, and optional UFLI and Fundations references.',
    location: 'Early literacy pod',
  },
  {
    id: '24',
    title: 'Book Studies title expansion review',
    start: at(6, 11),
    end: at(6, 12),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Review sample novel-support coverage around Wonder, The Wild Robot, Esperanza Rising, and The One and Only Ivan.',
    location: 'Novel studies board',
  },
  {
    id: '25',
    title: 'Interventionists webinar recap',
    start: at(6, 15),
    end: at(6, 16),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Turn SPED and interventionist webinar notes into quick-start guidance for teacher-support responses.',
    location: 'Support programs channel',
  },
  {
    id: '26',
    title: 'Clever and ClassLink integration note check',
    start: at(12, 10),
    end: at(12, 11),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Refresh platform onboarding notes covering ClassLink, Clever, and Google Classroom integration references.',
    location: 'Platform partnerships',
  },
  {
    id: '27',
    title: 'Question set auto-grading review',
    start: at(12, 13),
    end: at(12, 14),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Review assessment-data messaging and auto-grading references used in district-facing product summaries.',
    location: 'Assessment operations',
  },
  {
    id: '28',
    title: 'Article-A-Day fidelity check',
    start: at(13, 9),
    end: at(13, 10),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Check monthly scope-and-sequence reminders, four-plus articles per week guidance, and 15-week routine support.',
    location: 'Routine implementation desk',
  },
  {
    id: '29',
    title: 'Student Library implementation review',
    start: at(3, 13),
    end: at(3, 14),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Review student-library guidance: students can browse 1000s of nonfiction and fiction passages, read from kindergarten to two grades above grade level, and receive daily recommendations based on interest and reading history.',
    location: 'Student reading experience desk',
  },
  {
    id: '30',
    title: 'Offline mode support audit',
    start: at(7, 11),
    end: at(7, 12),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Check family- and teacher-facing instructions for offline mode, including download steps, delayed submission timestamps, and the features that are unavailable offline: audio, eBooks, paired video, and the Student Library.',
    location: 'Access support channel',
  },
  {
    id: '31',
    title: 'Google Classroom add-on readiness check',
    start: at(9, 14),
    end: at(9, 15),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Use official ReadWorks setup guidance to verify the Google Classroom add-on path, Sign in with Google, and roster-sync support before partner onboarding briefs go out.',
    location: 'Platform adoption review',
  },
  {
    id: '32',
    title: 'February 2026 update digest',
    start: at(10, 9),
    end: at(10, 10),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Package the February 24, 2026 public update covering Daniel Weisberg joining the board, fall 2025 survey results, and the latest Article-A-Day research brief.',
    location: 'Executive updates board',
  },
  {
    id: '33',
    title: 'Curriculum alignments repack',
    start: at(11, 15),
    end: at(11, 16),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Refresh the district-facing alignments stack around Amplify CKLA, EL Education, Fishtank Learning, Louisiana Guidebooks, Wit & Wisdom, NGSS, vocabulary, decoding, and book-based pathways.',
    location: 'Alignment operations',
  },
  {
    id: '34',
    title: 'Student Library rollout review',
    start: at(11, 9),
    end: at(11, 10),
    color: 'blue',
    calendarId: 'article-a-day',
    description:
      'Audit the student-library launch notes around daily recommendations, independent reading pathways, and teacher visibility into student reading volume.',
    location: 'Student reading systems',
  },
  {
    id: '35',
    title: 'Big Book of Knowledge support sync',
    start: at(11, 13),
    end: at(11, 14),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Bring together help-center notes for the Class Book of Knowledge, the student Big Book of Knowledge, and family-facing access instructions.',
    location: 'Knowledge notebook support',
  },
  {
    id: '36',
    title: 'Shared-device Google setup QA',
    start: at(12, 15),
    end: at(12, 16),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Validate the setup flow for schools using shared Chromebooks so the right Google account is selected before Classroom sync or ReadWorks launch.',
    location: 'Platform onboarding desk',
  },
  {
    id: '37',
    title: 'Research evidence language review',
    start: at(13, 11),
    end: at(13, 12),
    color: 'orange',
    calendarId: 'curriculum-lab',
    description:
      'Cross-check current portal claims against the official research page, the Article-A-Day differentiation one-pager, and ESSA evidence references.',
    location: 'Research and evidence lab',
  },
  {
    id: '38',
    title: 'Earth Day contest campaign check',
    start: at(14, 14),
    end: at(14, 15),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Review the April 11, 2026 Earth Day illustration contest timeline and package teacher-facing promotion notes with the official submission sheet.',
    location: 'Campaign planning wall',
  },
  {
    id: '39',
    title: 'Summer and afterschool quick-start planning',
    start: at(15, 10),
    end: at(15, 11),
    color: 'green',
    calendarId: 'teacher-support',
    description:
      'Build a short support packet using ReadWorks summer, YMCA afterschool, and hybrid Article-A-Day implementation materials for community-facing outreach.',
    location: 'Family and community support',
  },
  {
    id: '40',
    title: 'Platform trust review',
    start: at(13, 14),
    end: at(13, 15),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Refresh district-facing onboarding language using the official SOC 2 certification page, edtech approval materials, and Google Classroom readiness guidance.',
    location: 'Security and platform trust',
  },
  {
    id: '41',
    title: 'Partner network narrative cleanup',
    start: at(14, 10),
    end: at(14, 11),
    color: 'purple',
    calendarId: 'partnerships',
    description:
      'Use the official ReadWorks partners page to tighten partner-network references across campaign copy, donor notes, and district outreach materials.',
    location: 'Partnership strategy room',
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
