import React, { useMemo } from 'react';
import { ArrowUpRight, BookOpen, CalendarDays, GraduationCap, Handshake } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { CALENDARS, CalendarEvent } from '../data/mockData';
import { cn } from '../utils/cn';

interface DashboardScreenProps {
  currentDate: Date;
  events: CalendarEvent[];
  onOpenCalendar: () => void;
}

const impactBars = [
  { label: 'Texts', display: '6,000+', height: 54 },
  { label: 'States', display: '50', height: 42 },
  { label: 'Educators', display: '~1M', height: 78 },
  { label: 'Students/yr', display: '11M', height: 92 },
  { label: 'Low-income K-8', display: '93%', height: 86 },
];

const programSignals = [
  {
    label: 'Article-A-Day',
    value: '10 min',
    note: 'ReadWorks frames it as a short daily routine to build knowledge, vocabulary, and comprehension.',
    width: 82,
    tone: 'teal',
  },
  {
    label: 'Top 25',
    value: 'Jan 23',
    note: 'ReadWorks announced its Top 25 global impact-certified nonprofit recognition on January 23, 2026.',
    width: 66,
    tone: 'orange',
  },
  {
    label: 'Mississippi',
    value: '17k',
    note: 'Official February 11, 2026 partnership update cites 17,000 students reached in the first two years.',
    width: 74,
    tone: 'violet',
  },
];

const statusToneClasses = {
  blue: 'bg-blue-500/12 text-blue-200 border-blue-400/30',
  purple: 'bg-purple-500/12 text-purple-200 border-purple-400/30',
  orange: 'bg-orange-500/12 text-orange-200 border-orange-400/30',
  red: 'bg-pink-500/12 text-pink-200 border-pink-400/30',
  green: 'bg-emerald-500/12 text-emerald-200 border-emerald-400/30',
};

const calendarLabelById = Object.fromEntries(CALENDARS.map((calendar) => [calendar.id, calendar.name]));

export function DashboardScreen({ currentDate, events, onOpenCalendar }: DashboardScreenProps) {
  const metrics = useMemo(() => {
    const todayEvents = events.filter((event) => isSameDay(event.start, currentDate));
    const articleItems = events.filter((event) => event.calendarId === 'article-a-day').length;
    const supportItems = events.filter((event) => event.calendarId === 'teacher-support').length;
    const partnerItems = events.filter((event) => event.calendarId === 'partnerships').length;

    return [
      {
        label: 'Today focus',
        value: String(todayEvents.length).padStart(2, '0'),
        note: 'ReadWorks work blocks on this date',
        icon: CalendarDays,
      },
      {
        label: 'Article-A-Day',
        value: String(articleItems).padStart(2, '0'),
        note: 'Core reading-program items in view',
        icon: BookOpen,
      },
      {
        label: 'Teacher support',
        value: String(supportItems).padStart(2, '0'),
        note: 'Webinars, guides, and educator follow-up',
        icon: GraduationCap,
      },
      {
        label: 'Partnerships',
        value: String(partnerItems).padStart(2, '0'),
        note: 'State and district operations currently active',
        icon: Handshake,
      },
    ];
  }, [currentDate, events]);

  const focusItems = useMemo(() => {
    const now = Date.now();
    const futureItems = events
      .filter((event) => event.end.getTime() >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (futureItems.length > 0) {
      return futureItems.slice(0, 5);
    }

    return events
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);
  }, [events]);

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-transparent">
      <div className="border-b border-zinc-200/70 px-5 py-5 dark:border-zinc-800/80 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent-text)] dark:text-[color:var(--color-accent)]">
                ReadWorks overview
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Built by Infogito for ReadWorks content, partnership, and teacher-support teams.
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                ReadWorks operating portal
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Keep editorial planning, educator support, and partnership delivery in one working view. The calendar holds the live schedule and the portal screen carries the connected research layer.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCalendar}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Open calendar
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.label}
                    className="rounded-[26px] border border-zinc-200/80 bg-white/85 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                        {metric.label}
                      </p>
                      <div className="rounded-2xl bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        <Icon size={16} />
                      </div>
                    </div>
                    <p className="mt-5 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{metric.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-zinc-200/80 bg-white/85 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                      Impact snapshot
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      Public ReadWorks reach
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Updated for {format(currentDate, 'MMMM d')}</p>
                </div>

                <div className="mt-8 flex h-64 items-end gap-3">
                  {impactBars.map((bar) => (
                    <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="relative flex h-full w-full items-end overflow-hidden rounded-[22px] bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="w-full rounded-[22px] bg-[linear-gradient(180deg,rgba(5,159,197,0.96),rgba(36,103,141,0.78))]"
                          style={{ height: `${bar.height}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{bar.display}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{bar.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-zinc-200/80 bg-white/85 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                  Programs in view
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  ReadWorks signals in motion
                </h2>

                <div className="mt-6 space-y-4">
                  {programSignals.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/55">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{stat.label}</p>
                        <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{stat.value}</p>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{stat.note}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            stat.tone === 'teal' && 'bg-[linear-gradient(90deg,#059fc5,#24678d)]',
                            stat.tone === 'orange' && 'bg-[linear-gradient(90deg,#ef8e3b,#f4b454)]',
                            stat.tone === 'violet' && 'bg-[linear-gradient(90deg,#2f6f9b,#4ca9c8)]',
                          )}
                          style={{ width: `${stat.width}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-zinc-300/80 p-4 dark:border-zinc-700">
                  <p className="text-xs uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">Current read</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    This surface uses official ReadWorks facts for mission, programs, webinars, and partnership milestones, then wraps them in representative internal work blocks for a staff-facing operating portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-zinc-200/80 bg-zinc-950 p-5 text-zinc-100 shadow-sm dark:border-zinc-800">
              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Focus queue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">What ReadWorks teams touch next</h2>

              <div className="mt-6 space-y-3">
                {focusItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {format(item.start, 'EEE h:mm a')}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]',
                          statusToneClasses[item.color],
                        )}
                      >
                        {calendarLabelById[item.calendarId] ?? item.calendarId}
                      </span>
                    </div>
                    {item.location && <p className="mt-3 text-sm text-zinc-300">{item.location}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-200/80 bg-white/85 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
                Delivery ladder
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Sample ReadWorks delivery stages
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  {
                    stage: 'Plan',
                    count: 4,
                    description: 'Scope program framing around Article-A-Day, Book Studies, partnerships, and webinar support.',
                  },
                  {
                    stage: 'Review',
                    count: 7,
                    description: 'Check curriculum notes, district messaging, accessibility details, and teacher-facing support copy.',
                  },
                  {
                    stage: 'Publish',
                    count: 3,
                    description: 'Ship updated guides, partner materials, and live webinar support assets tied to public ReadWorks programs.',
                  },
                ].map((item, index) => (
                  <div key={item.stage} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.stage}</p>
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-[color:var(--color-accent-text)] dark:text-[color:var(--color-accent)]">
                          {item.count}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
