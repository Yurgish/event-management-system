import type { EventApi } from '@fullcalendar/core/index.js';

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
  onEventSelect: (eventId: string) => void;
}

function DayEventsDialog({
  open,
  dateLabel,
  events,
  onOpenChange,
  onEventSelect,
}: DayEventsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{dateLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
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
              <button
                key={event.id}
                type="button"
                className="hover:bg-accent flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors"
                onClick={() => {
                  if (eventId) {
                    onEventSelect(eventId);
                  }
                }}
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
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DayEventsDialog;
