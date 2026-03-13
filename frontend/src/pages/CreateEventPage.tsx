import { ArrowLeftIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { EventForm } from '@/components/events';
import { Button } from '@/components/ui/button';
import { buildEventRequest, type EventFormValues } from '@/lib/event-form';
import { getServerErrorMessage } from '@/lib/server-error';
import { useCreateEventMutation } from '@/store/api';

function CreateEventPage() {
  const navigate = useNavigate();
  const [createEventMutation, { isLoading }] = useCreateEventMutation();

  const onSubmit = async (values: EventFormValues) => {
    try {
      const event = await createEventMutation(
        buildEventRequest(values),
      ).unwrap();
      toast.success('Event created successfully');
      navigate(`/events/${event.id}`);
    } catch (error) {
      toast.error(
        getServerErrorMessage(
          error,
          'Failed to create event. Please try again.',
        ),
      );
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg flex-col justify-center gap-3">
      <Button asChild variant="ghost" className="w-fit">
        <Link to="/events">
          <ArrowLeftIcon className="size-4" />
          Back to Events
        </Link>
      </Button>

      <EventForm
        mode="create"
        isSaving={isLoading}
        onCancel={() => navigate(-1)}
        onSubmit={onSubmit}
      />
    </section>
  );
}

export default CreateEventPage;
