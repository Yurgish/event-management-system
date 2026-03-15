import { ArrowLeftIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  EventJoinButton,
  EventMeta,
  EventParticipants,
} from '@/components/events';
import { APP_ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks';
import { getEventCapacityMeta } from '@/lib/event-capacity';
import { getServerErrorMessage } from '@/lib/server-error';
import { useDeleteEventMutation, useGetEventByIdQuery } from '@/store/api';

function EventDetailsPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

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
          <Link to={APP_ROUTES.EVENTS}>Back to Events</Link>
        </Button>
      </section>
    );
  }

  const { isUnlimited, isFull, participantsLabel } = getEventCapacityMeta(
    event._count.participants,
    event.capacity,
  );
  const isOwner = user?.id === event.organizerId;

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id).unwrap();
      setIsDeleteDialogOpen(false);
      toast.success('Event deleted successfully.');
      navigate(APP_ROUTES.EVENTS);
    } catch (error) {
      toast.error(
        getServerErrorMessage(
          error,
          'Failed to delete event. Please try again.',
        ),
      );
    }
  };

  return (
    <section className="space-y-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link to={APP_ROUTES.EVENTS}>
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
            isUnlimited={isUnlimited}
            organizerName={event.organizer.name}
          />

          <EventParticipants participants={event.participants} />
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {isOwner && (
            <>
              <Button asChild variant="outline">
                <Link to={APP_ROUTES.EVENT_EDIT(event.id)}>
                  <PencilIcon className="size-4" />
                  Edit
                </Link>
              </Button>

              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete event?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. The event and all related
                      participants will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </DialogClose>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2Icon className="size-4" />
                      {isDeleting ? 'Deleting...' : 'Delete event'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

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
