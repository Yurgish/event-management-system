import type { EventApi } from '@fullcalendar/core/index.js';
import { Link } from 'react-router-dom';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DayEventsDialogProps {
  open: boolean;
  dateLabel: string;
  events: EventApi[];
  onOpenChange: (open: boolean) => void;
}

function DayEventsDialog({
  open,
  dateLabel,
  events,
  onOpenChange,
}: DayEventsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-hidden sm:max-h-[calc(100dvh-4rem)]">
        <DialogHeader>
          <DialogTitle>{dateLabel}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60dvh] space-y-2 overflow-y-auto pr-1 sm:max-h-[50dvh]">
          {events.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No events planned for this day.
            </p>
          )}
          {events.map((event) => {
            const source = event.extendedProps?.source as
              | 'organized'
              | 'joined'
              | undefined;
            const isOrganized = source === 'organized';
            const time = event.start
              ? new Date(event.start).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
            const eventId = event.extendedProps?.eventId as string | undefined;

            return (
              <Link
                key={event.id}
                to={eventId ? `/events/${eventId}` : '#'}
                className="hover:bg-accent flex w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors sm:px-3 sm:py-2.5"
                onClick={() => onOpenChange(false)}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: isOrganized ? '#059669' : '#0284c7',
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {event.title}
                  </span>
                  {time && (
                    <span className="text-muted-foreground text-xs">
                      {time}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DayEventsDialog;
