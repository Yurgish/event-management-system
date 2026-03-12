import { ArrowLeftIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import {
  EventJoinButton,
  EventMeta,
  EventParticipants,
} from '@/components/events';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks';
import { useGetEventByIdQuery } from '@/store/api';

function EventDetailsPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();

  const {
    data: event,
    isError,
    isLoading,
  } = useGetEventByIdQuery(id, {
    skip: !id,
  });

  const isJoinedFromServer = Boolean(
    user && event?.participants.some((item) => item.userId === user.id),
  );

  if (isLoading) {
    return <p className="text-muted-foreground">Loading event details...</p>;
  }

  if (isError || !event) {
    return (
      <section className="space-y-4">
        <p className="text-destructive">
          Failed to load event details. Please return to events list.
        </p>
        <Button asChild variant="outline">
          <Link to="/events">Back to Events</Link>
        </Button>
      </section>
    );
  }

  const participantsCount = event._count.participants;
  const capacity = typeof event.capacity === 'number' ? event.capacity : null;
  const isFull = capacity !== null && participantsCount >= capacity;
  const participantsLabel = capacity
    ? `${participantsCount}/${capacity}`
    : `${participantsCount}/unlimited`;

  return (
    <section className="space-y-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link to="/events">
          <ArrowLeftIcon className="size-4" />
          Back to Events
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription className="text-base">
            {event.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <EventMeta
            dateTime={event.dateTime}
            location={event.location}
            participantsLabel={participantsLabel}
            organizerName={event.organizer.name}
          />

          <EventParticipants participants={event.participants} />
        </CardContent>

        <CardFooter className="flex justify-end">
          <EventJoinButton
            eventId={event.id}
            isJoined={isJoinedFromServer}
            isFull={isFull}
          />
        </CardFooter>
      </Card>
    </section>
  );
}

export default EventDetailsPage;
