import { CalendarClockIcon, MapPinIcon, UsersIcon } from 'lucide-react';

interface EventMetaProps {
  dateTime: string;
  location: string;
  participantsLabel: string;
  organizerName: string;
}

function EventMeta({
  dateTime,
  location,
  participantsLabel,
  organizerName,
}: EventMetaProps) {
  return (
    <div className="space-y-2 text-sm sm:text-base">
      <p className="text-muted-foreground flex items-center gap-2">
        <CalendarClockIcon className="size-4 shrink-0" />
        {new Date(dateTime).toLocaleString()}
      </p>

      <p className="text-muted-foreground flex items-center gap-2">
        <MapPinIcon className="size-4 shrink-0" />
        {location}
      </p>

      <p className="text-muted-foreground flex items-center gap-2">
        <UsersIcon className="size-4 shrink-0" />
        {participantsLabel} participants
      </p>

      <p className="text-muted-foreground text-sm">
        Organizer: {organizerName}
      </p>
    </div>
  );
}

export default EventMeta;
