import type {
  DatesSetArg,
  DayCellMountArg,
  EventApi,
  EventClickArg,
  EventInput,
  MoreLinkArg,
} from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CreateEventButton from '@/components/CreateEventButton';
import DayEventsDialog from '@/components/events/DayEventsDialog';
import MoreEventsLinkContent from '@/components/events/MoreEventsLinkContent';
import { Button } from '@/components/ui/button';
import { useGetMyEventsQuery } from '@/store/api';

type CalendarViewMode = 'dayGridMonth' | 'dayGridWeek';

interface DayEventsModal {
  open: boolean;
  dateLabel: string;
  events: EventApi[];
}

type DayCellElement = HTMLElement & {
  __myEventsDayClickHandler?: (ev: MouseEvent) => void;
};

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toCalendarEvent(
  event: { id: string; title: string; dateTime: string },
  source: 'organized' | 'joined',
  color: string,
): EventInput {
  const startDate = new Date(event.dateTime);
  const endDate = new Date(startDate.getTime() + 1000);

  return {
    id: `${source}-${event.id}`,
    title: event.title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    allDay: false,
    backgroundColor: color,
    borderColor: color,
    extendedProps: {
      eventId: event.id,
      source,
    },
  };
}

function MyEventsPage() {
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar | null>(null);
  const [calendarTitle, setCalendarTitle] = useState('');
  const [currentView, setCurrentView] =
    useState<CalendarViewMode>('dayGridMonth');
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 640px)').matches,
  );
  const [dayModal, setDayModal] = useState<DayEventsModal>({
    open: false,
    dateLabel: '',
    events: [],
  });
  const { data, isError, isLoading } = useGetMyEventsQuery();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const calendarEvents = useMemo<EventInput[]>(() => {
    if (!data) {
      return [];
    }

    const byEventId = new Map<string, EventInput>();

    for (const event of data.organizedEvents) {
      byEventId.set(event.id, toCalendarEvent(event, 'organized', '#059669'));
    }

    for (const participation of data.participations) {
      const event = participation.event;

      if (byEventId.has(event.id)) {
        continue;
      }

      byEventId.set(event.id, toCalendarEvent(event, 'joined', '#0284c7'));
    }

    return Array.from(byEventId.values());
  }, [data]);

  const mobileDaySourceByDate = useMemo(() => {
    const daySources = new Map<string, Set<'organized' | 'joined'>>();

    for (const event of calendarEvents) {
      const source = event.extendedProps?.source;
      if (source !== 'organized' && source !== 'joined') {
        continue;
      }

      if (!event.start) {
        continue;
      }

      const startValue = event.start;
      if (
        !(
          startValue instanceof Date ||
          typeof startValue === 'string' ||
          typeof startValue === 'number'
        )
      ) {
        continue;
      }

      const date =
        startValue instanceof Date ? startValue : new Date(startValue);

      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const key = getDayKey(date);
      const existing = daySources.get(key) ?? new Set<'organized' | 'joined'>();
      existing.add(source);
      daySources.set(key, existing);
    }

    return daySources;
  }, [calendarEvents]);

  const handleEventClick = (arg: EventClickArg) => {
    if (isMobile) {
      return;
    }

    const eventId = arg.event.extendedProps?.eventId;

    if (typeof eventId === 'string' && eventId.length > 0) {
      navigate(`/events/${eventId}`);
    }
  };

  const handleMoreLinkClick = (arg: MoreLinkArg) => {
    setDayModal({
      open: true,
      dateLabel: arg.date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      events: arg.allSegs.map((seg) => seg.event),
    });
    return true;
  };

  const handleDayModalChange = (open: boolean) => {
    setDayModal((prev) => ({ ...prev, open }));
  };

  const handleDayEventSelect = (eventId: string) => {
    navigate(`/events/${eventId}`);
    setDayModal((prev) => ({ ...prev, open: false }));
  };

  const handleDayCellClassNames = ({ date }: { date: Date }) => {
    if (!isMobile) {
      return [];
    }

    const daySources = mobileDaySourceByDate.get(getDayKey(date));
    if (!daySources || daySources.size === 0) {
      return [];
    }

    if (daySources.has('organized') && daySources.has('joined')) {
      return ['my-events-day-mixed'];
    }

    if (daySources.has('organized')) {
      return ['my-events-day-organized'];
    }

    return ['my-events-day-joined'];
  };

  const handleDayCellDidMount = (arg: DayCellMountArg) => {
    const dayCellEl = arg.el as DayCellElement;

    const onClick = () => {
      if (!window.matchMedia('(max-width: 640px)').matches) {
        return;
      }

      const api = calendarRef.current?.getApi();
      if (!api) {
        return;
      }

      const dayEvents = api
        .getEvents()
        .filter((event) => {
          const start = event.start;
          if (!start) {
            return false;
          }

          return (
            start.getFullYear() === arg.date.getFullYear() &&
            start.getMonth() === arg.date.getMonth() &&
            start.getDate() === arg.date.getDate()
          );
        })
        .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));

      if (dayEvents.length === 0) {
        return;
      }

      setDayModal({
        open: true,
        dateLabel: arg.date.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        events: dayEvents,
      });
    };

    dayCellEl.__myEventsDayClickHandler = onClick;
    dayCellEl.addEventListener('click', onClick);
  };

  const handleDayCellWillUnmount = (arg: DayCellMountArg) => {
    const dayCellEl = arg.el as DayCellElement;

    if (dayCellEl.__myEventsDayClickHandler) {
      dayCellEl.removeEventListener(
        'click',
        dayCellEl.__myEventsDayClickHandler,
      );
      delete dayCellEl.__myEventsDayClickHandler;
    }
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setCalendarTitle(arg.view.title);
    setCurrentView(arg.view.type as CalendarViewMode);
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleViewChange = (view: CalendarViewMode) => {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading your events...</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive">
        Failed to load your events. Try refreshing the page.
      </p>
    );
  }

  return (
    <>
      <section className="space-y-8">
        <div className="flex gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">My Events</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              View your organized and joined events on a calendar.
            </p>
          </div>

          <CreateEventButton />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              size="lg"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            <h2 className="text-center text-lg font-semibold tracking-tight">
              {calendarTitle}
            </h2>

            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              size="lg"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="lg"
              variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
              onClick={() => handleViewChange('dayGridMonth')}
            >
              Month
            </Button>
            <Button
              type="button"
              size="lg"
              variant={currentView === 'dayGridWeek' ? 'default' : 'outline'}
              onClick={() => handleViewChange('dayGridWeek')}
            >
              Week
            </Button>
          </div>
        </div>
        <div className="bg-card space-y-4 rounded-2xl border p-4 shadow-xs sm:p-5">
          <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Organized by you
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300">
                <span className="size-2 rounded-full bg-sky-600 dark:bg-sky-400" />
                Joined by you
              </span>
            </div>
          </div>

          <div className="my-events-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              datesSet={handleDatesSet}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              fixedWeekCount={false}
              dayMaxEventRows={isMobile ? 3 : 1}
              dayCellClassNames={handleDayCellClassNames}
              dayCellDidMount={handleDayCellDidMount}
              dayCellWillUnmount={handleDayCellWillUnmount}
              moreLinkClassNames={() =>
                isMobile
                  ? ['my-events-more-link', 'my-events-more-link-mobile']
                  : ['my-events-more-link']
              }
              moreLinkContent={isMobile ? undefined : MoreEventsLinkContent}
              moreLinkClick={handleMoreLinkClick as never}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
            />
          </div>
        </div>
      </section>

      <DayEventsDialog
        open={dayModal.open}
        dateLabel={dayModal.dateLabel}
        events={dayModal.events}
        onOpenChange={handleDayModalChange}
        onEventSelect={handleDayEventSelect}
      />
    </>
  );
}

export default MyEventsPage;
