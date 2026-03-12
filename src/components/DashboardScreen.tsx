import React, { useMemo } from 'react';
import { ArrowUpRight, CalendarDays, Clapperboard, RadioTower, Sparkles } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent } from '../data/mockData';
import { cn } from '../utils/cn';

interface DashboardScreenProps {
  currentDate: Date;
  events: CalendarEvent[];
  onOpenCalendar: () => void;
}

const portfolioBars = [
  { label: 'Public regions', value: 51 },
  { label: 'Countries', value: 28 },
  { label: 'Dedicated regions', value: 23 },
  { label: 'Commercial regions', value: 41 },
  { label: 'Sovereign regions', value: 2 },
];

const programSignals = [
  {
    label: 'Oracle AI Database',
    value: '26ai',
    note: 'AI built into the full data and app stack',
    width: 86,
    tone: 'teal',
  },
  {
    label: 'AI World Tour Chicago',
    value: 'Apr 7',
    note: '2026 event date on the official tour schedule',
    width: 68,
    tone: 'orange',
  },
  {
    label: 'Support Rewards',
    value: '$0.25',
    note: 'Standard credit earned per $1 spent on OCI',
    width: 92,
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

export function DashboardScreen({ currentDate, events, onOpenCalendar }: DashboardScreenProps) {
  const maxBarValue = Math.max(...portfolioBars.map((bar) => bar.value));

  const metrics = useMemo(() => {
    const todayEvents = events.filter((event) => isSameDay(event.start, currentDate));
    const fusionItems = events.filter((event) => event.calendarId === 'fusion-ai').length;
    const databaseItems = events.filter((event) => event.calendarId === 'database-oci').length;
    const eventItems = events.filter((event) => event.calendarId === 'field-events').length;

    return [
      {
        label: 'Today focus',
        value: String(todayEvents.length).padStart(2, '0'),
        note: 'Oracle work blocks on this date',
        icon: CalendarDays,
      },
      {
        label: 'Fusion AI',
        value: String(fusionItems).padStart(2, '0'),
        note: 'Agent and applications work in view',
        icon: Sparkles,
      },
      {
        label: 'Database + OCI',
        value: String(databaseItems).padStart(2, '0'),
        note: 'Platform and infrastructure items active',
        icon: Clapperboard,
      },
      {
        label: 'Field events',
        value: String(eventItems).padStart(2, '0'),
        note: 'JavaOne, AI World, and summit operations',
        icon: RadioTower,
      },
    ];
  }, [currentDate, events]);

  const focusItems = useMemo(
    () =>
      events
        .slice()
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5),
    [events],
  );

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-transparent">
      <div className="border-b border-zinc-200/70 px-5 py-5 dark:border-zinc-800/80 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-accent-text)] dark:text-[color:var(--color-accent)]">
                Oracle overview
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Built by Infogito for Oracle field, platform, and enablement teams.
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Oracle employee control room
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Keep Oracle product, event, and enablement work in one operating view. The calendar holds the live schedule and the portal holds the connected research layer.
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
                      OCI footprint
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                      Oracle cloud network snapshot
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Updated for {format(currentDate, 'MMMM d')}</p>
                </div>

                <div className="mt-8 flex h-64 items-end gap-3">
                  {portfolioBars.map((bar) => (
                    <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="relative flex h-full w-full items-end overflow-hidden rounded-[22px] bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="w-full rounded-[22px] bg-[linear-gradient(180deg,rgba(199,70,52,0.96),rgba(243,178,57,0.82))]"
                          style={{ height: `${(bar.value / maxBarValue) * 100}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{bar.value}</p>
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
                  Oracle signals to track
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
                            stat.tone === 'teal' && 'bg-[linear-gradient(90deg,#c74634,#8f2e20)]',
                            stat.tone === 'orange' && 'bg-[linear-gradient(90deg,#e25d3f,#f3b239)]',
                            stat.tone === 'violet' && 'bg-[linear-gradient(90deg,#5b6dee,#95a3ff)]',
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
                    The dashboard now acts as an Oracle operations surface, while the calendar handles live scheduling and the portal screen carries the deeper research context.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-zinc-200/80 bg-zinc-950 p-5 text-zinc-100 shadow-sm dark:border-zinc-800">
              <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Focus queue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">What Oracle teams touch next</h2>

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
                        {item.calendarId}
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
                Sample Oracle release stages
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  {
                    stage: 'Plan',
                    count: 5,
                    description: 'Scope product narrative, field enablement, and event dependencies around official Oracle programs.',
                  },
                  {
                    stage: 'Validate',
                    count: 8,
                    description: 'Review architecture notes, AI use cases, and certification or speaker content before release.',
                  },
                  {
                    stage: 'Launch',
                    count: 3,
                    description: 'Push live event support, enablement updates, and customer-facing program assets.',
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
