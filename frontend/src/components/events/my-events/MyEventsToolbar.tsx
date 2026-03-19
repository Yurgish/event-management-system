import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { CalendarViewMode } from '@/hooks/useMyEventsCalendar';

interface MyEventsToolbarProps {
  calendarTitle: string;
  currentView: CalendarViewMode;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarViewMode) => void;
}

function MyEventsToolbar({
  calendarTitle,
  currentView,
  onPrev,
  onNext,
  onViewChange,
}: MyEventsToolbarProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          size="sm"
          className="sm:h-9 sm:px-2.5"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        <h2 className="text-center text-sm font-semibold tracking-tight sm:text-lg">
          {calendarTitle}
        </h2>

        <Button
          type="button"
          variant="outline"
          onClick={onNext}
          size="sm"
          className="sm:h-9 sm:px-2.5"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          type="button"
          size="sm"
          className="sm:h-9 sm:px-2.5"
          variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
          onClick={() => onViewChange('dayGridMonth')}
        >
          Month
        </Button>

        <Button
          type="button"
          size="sm"
          className="sm:h-9 sm:px-2.5"
          variant={currentView === 'dayGridWeek' ? 'default' : 'outline'}
          onClick={() => onViewChange('dayGridWeek')}
        >
          Week
        </Button>
      </div>
    </div>
  );
}

export default MyEventsToolbar;
