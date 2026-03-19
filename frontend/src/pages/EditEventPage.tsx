import { ArrowLeftIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { EventForm } from '@/components/events';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/constants/routes';
import {
  buildEventRequest,
  type EventFormValues,
  getEventFormValuesFromEvent,
} from '@/lib/event-form';
import { getServerErrorMessage } from '@/lib/server-error';
import { useGetEventByIdQuery, useUpdateEventMutation } from '@/store/api';

function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [updateEventMutation, { isLoading: isSaving }] =
    useUpdateEventMutation();

  const {
    data: event,
    isError,
    isLoading,
  } = useGetEventByIdQuery(id ?? '', {
    skip: !id,
  });

  const initialValues = useMemo(
    () => (event ? getEventFormValuesFromEvent(event) : undefined),
    [event],
  );

  if (isLoading) {
    return <p className="text-muted-foreground">Loading event...</p>;
  }

  if (!id || isError || !event) {
    return (
      <section className="space-y-4">
        <p className="text-destructive">
          Failed to load event for editing. Try opening it again.
        </p>
        <Button asChild variant="outline">
          <Link to={APP_ROUTES.MY_EVENTS}>Back to My Events</Link>
        </Button>
      </section>
    );
  }

  const onSubmit = async (values: EventFormValues) => {
    try {
      await updateEventMutation({
        id,
        body: buildEventRequest(values),
      }).unwrap();

      toast.success('Event updated successfully');
      navigate(APP_ROUTES.EVENT_DETAILS(id));
    } catch (error) {
      toast.error(
        getServerErrorMessage(
          error,
          'Failed to update event. Please try again.',
        ),
      );
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg flex-col justify-center gap-3">
      <Button asChild variant="ghost" className="w-fit">
        <Link to={APP_ROUTES.EVENT_DETAILS(id)}>
          <ArrowLeftIcon className="size-4" />
          Back to Event
        </Link>
      </Button>

      <EventForm
        mode="edit"
        initialValues={initialValues}
        isSaving={isSaving}
        onCancel={() => navigate(-1)}
        onSubmit={onSubmit}
      />
    </section>
  );
}

export default EditEventPage;
