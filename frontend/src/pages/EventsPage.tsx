import { useGetEventsQuery } from '@/store/api';

function EventsPage() {
  const { data, isError, isLoading } = useGetEventsQuery();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading events...</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive">
        Failed to load events. Try refreshing the page.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          Browse public events and open any item later when the detail page is
          added.
        </p>
      </div>

      {data?.items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((event) => (
            <article
              key={event.id}
              className="bg-card space-y-3 rounded-xl border p-5 shadow-xs"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {new Date(event.dateTime).toLocaleString()}
                </p>
              </div>

              <p className="text-sm">{event.location}</p>
              <p className="text-muted-foreground text-sm">
                Organizer: {event.organizer.name}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-6">
          <p className="text-muted-foreground">No events found.</p>
        </div>
      )}
    </section>
  );
}

export default EventsPage;
