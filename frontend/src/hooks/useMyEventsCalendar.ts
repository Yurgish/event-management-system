import type {
  DatesSetArg,
  DayCellMountArg,
  EventApi,
  EventClickArg,
  EventInput,
  MoreLinkArg,
} from '@fullcalendar/core/index.js';
import FullCalendar from '@fullcalendar/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';
import type { MyEventsResponse } from '@/types/api/user';

/** Supported FullCalendar views used on My Events page. */
export type CalendarViewMode = 'dayGridMonth' | 'dayGridWeek';

/** Modal state for displaying all events that belong to a selected day. */
export interface DayEventsModal {
  open: boolean;
  dateLabel: string;
  events: EventApi[];
}

/**
 * Public contract returned by the hook.
 * This keeps page-level components focused on rendering while the hook
 * owns all FullCalendar and responsive interaction details.
 */
export interface UseMyEventsCalendarResult {
  calendarRef: React.RefObject<FullCalendar | null>;
  calendarTitle: string;
  currentView: CalendarViewMode;
  isMobile: boolean;
  dayModal: DayEventsModal;
  calendarEvents: EventInput[];
  handleEventClick: (arg: EventClickArg) => void;
  handleMoreLinkClick: (arg: MoreLinkArg) => boolean;
  handleDayModalChange: (open: boolean) => void;
  handleDayCellClassNames: ({ date }: { date: Date }) => string[];
  handleDayCellDidMount: (arg: DayCellMountArg) => void;
  handleDayCellWillUnmount: (arg: DayCellMountArg) => void;
  handleDatesSet: (arg: DatesSetArg) => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleViewChange: (view: CalendarViewMode) => void;
}

type MyEventCalendarItem = MyEventsResponse['events'][number];

type DayCellElement = HTMLElement & {
  __myEventsDayClickHandler?: (ev: MouseEvent) => void;
};

const FALLBACK_TAG_COLOR = '#64748b';

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toCalendarEvent(
  event: MyEventCalendarItem,
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
      tagColor: color,
    },
  };
}

/**
 * Encapsulates all My Events calendar behavior.
 *
 * Responsibilities:
 * - transforms API payload to FullCalendar event inputs
 * - tracks mobile/desktop mode and applies day-level styles on mobile
 * - controls calendar navigation and title state
 * - handles modal interactions for overflow and day click actions
 *
 * Input:
 * - data: response of users/me/events endpoint
 *
 * Just dont touch it
 */
export function useMyEventsCalendar(
  data?: MyEventsResponse,
  currentUserId?: string,
): UseMyEventsCalendarResult {
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

  // Keep a reactive mobile flag so FullCalendar behavior can adapt per viewport.
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

  // Build calendar events with tag-driven colors.
  const calendarEvents = useMemo<EventInput[]>(() => {
    if (!data) {
      return [];
    }

    return data.events.map((event) => {
      const source =
        currentUserId && event.organizerId === currentUserId
          ? 'organized'
          : 'joined';
      const rawColor = event.firstTagColor as unknown;
      const color =
        typeof rawColor === 'string' && rawColor.trim().length > 0
          ? rawColor
          : FALLBACK_TAG_COLOR;

      return toCalendarEvent(event, source, color);
    });
  }, [data, currentUserId]);

  // Build a per-day tag color map used for mobile day cell coloring.
  const mobileDayColorsByDate = useMemo(() => {
    const dayColors = new Map<string, string[]>();

    for (const event of calendarEvents) {
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
      const eventColor =
        (typeof event.backgroundColor === 'string' && event.backgroundColor) ||
        FALLBACK_TAG_COLOR;
      const existing = dayColors.get(key) ?? [];

      if (!existing.includes(eventColor)) {
        existing.push(eventColor);
      }

      dayColors.set(key, existing);
    }

    return dayColors;
  }, [calendarEvents]);

  // Desktop click opens event details, mobile keeps day-driven interaction model.
  const handleEventClick = (arg: EventClickArg) => {
    if (isMobile) {
      return;
    }

    const eventId = arg.event.extendedProps?.eventId;

    if (typeof eventId === 'string' && eventId.length > 0) {
      navigate(APP_ROUTES.EVENT_DETAILS(eventId));
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

  const handleDayCellClassNames = ({ date }: { date: Date }) => {
    if (!isMobile) {
      return [];
    }

    const dayColors = mobileDayColorsByDate.get(getDayKey(date));
    if (!dayColors || dayColors.length === 0) {
      return [];
    }

    return dayColors.length > 1
      ? ['my-events-day-tag', 'my-events-day-tag-mixed']
      : ['my-events-day-tag'];
  };

  // FullCalendar does not provide built-in mobile day click UX for this flow,
  // so we attach a click listener manually and clean it up on unmount.
  const handleDayCellDidMount = (arg: DayCellMountArg) => {
    const dayCellEl = arg.el as DayCellElement;
    const dayColors = mobileDayColorsByDate.get(getDayKey(arg.date));

    if (dayColors && dayColors.length > 0) {
      const primary = dayColors[0] ?? FALLBACK_TAG_COLOR;
      const secondary = dayColors[1] ?? primary;

      dayCellEl.style.setProperty('--my-events-day-color-primary', primary);
      dayCellEl.style.setProperty('--my-events-day-color-secondary', secondary);
    }

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
    dayCellEl.style.removeProperty('--my-events-day-color-primary');
    dayCellEl.style.removeProperty('--my-events-day-color-secondary');

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

  return {
    calendarRef,
    calendarTitle,
    currentView,
    isMobile,
    dayModal,
    calendarEvents,
    handleEventClick,
    handleMoreLinkClick,
    handleDayModalChange,
    handleDayCellClassNames,
    handleDayCellDidMount,
    handleDayCellWillUnmount,
    handleDatesSet,
    handlePrev,
    handleNext,
    handleViewChange,
  };
}
