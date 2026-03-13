import {
  CalendarClockIcon,
  InfinityIcon,
  MapPinIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import EventJoinButton from '@/components/events/EventJoinButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getEventCapacityMeta } from '@/lib/event-capacity';
import type { EventSummary } from '@/types/api/events';

interface EventCardProps {
  event: EventSummary;
  isJoined: boolean;
}

const DESCRIPTION_PREVIEW_LIMIT = 100;

function toDescriptionPreview(description: string) {
  if (description.length <= DESCRIPTION_PREVIEW_LIMIT) {
    return description;
  }

  return `${description.slice(0, DESCRIPTION_PREVIEW_LIMIT).trimEnd()}...`;
}

function EventCard({ event, isJoined }: EventCardProps) {
  const [joinedState, setJoinedState] = useState(isJoined);
  const [participantsCount, setParticipantsCount] = useState(
    event._count.participants,
  );

  useEffect(() => {
    setJoinedState(isJoined);
  }, [isJoined]);

  useEffect(() => {
    setParticipantsCount(event._count.participants);
  }, [event._count.participants, event.id]);

  const { isUnlimited, isFull, participantsLabel } = getEventCapacityMeta(
    participantsCount,
    event.capacity,
  );
  const descriptionPreview = useMemo(
    () => toDescriptionPreview(event.description),
    [event.description],
  );

  const handleJoinedChange = (nextJoined: boolean) => {
    setJoinedState(nextJoined);

    setParticipantsCount((current) => {
      if (nextJoined) {
        return current + 1;
      }

      return Math.max(0, current - 1);
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="line-clamp-2 text-xl">{event.title}</CardTitle>
          <CardDescription className="text-sm">
            {descriptionPreview}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground flex items-center gap-2">
          <CalendarClockIcon className="size-4" />
          {new Date(event.dateTime).toLocaleString()}
        </p>

        <p className="text-muted-foreground flex items-center gap-2">
          <MapPinIcon className="size-4" />
          {event.location}
        </p>

        <p className="text-muted-foreground flex items-center gap-2">
          <UsersIcon className="size-4" />
          <span className="inline-flex items-center">
            <span>{participantsLabel}</span>
            {isUnlimited && <InfinityIcon className="size-4 shrink-0" />}
          </span>
          <span>participants</span>
        </p>
      </CardContent>

      <CardFooter className="mt-auto flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/events/${event.id}`}>Details</Link>
        </Button>

        <EventJoinButton
          eventId={event.id}
          isJoined={joinedState}
          isFull={isFull}
          onJoinedChange={handleJoinedChange}
          className="flex-1"
        />
      </CardFooter>
    </Card>
  );
}

export default EventCard;
