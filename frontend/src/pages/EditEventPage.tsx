import { useParams } from 'react-router-dom';

import { useGetEventByIdQuery } from '@/store/api';

function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: event,
    isError,
    isLoading,
  } = useGetEventByIdQuery(id ?? '', {
    skip: !id,
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading event...</p>;
  }

  if (!id || isError || !event) {
    return (
      <p className="text-destructive">
        Failed to load event for editing. Try opening it again.
      </p>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">Edit Event</h1>
      <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
        Editing event:{' '}
        <span className="text-foreground font-medium">{event.title}</span>
      </p>
      <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
        The edit form can be added here without changing the router again.
      </p>
    </section>
  );
}

export default EditEventPage;
