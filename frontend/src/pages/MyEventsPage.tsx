import { useGetMyEventsQuery } from '@/store/api';

function MyEventsPage() {
  const { data, isError, isLoading } = useGetMyEventsQuery();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading your events...</p>;
  }

  if (isError) {
    return (
      <p className="text-destructive">
        Failed to load your events. Try refreshing the page.
      </p>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">My Events</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Organized and joined events in one place.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Organized</h2>
        {data?.organizedEvents.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.organizedEvents.map((event) => (
              <article
                key={event.id}
                className="bg-card space-y-2 rounded-xl border p-5 shadow-xs"
              >
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(event.dateTime).toLocaleString()}
                </p>
                <p className="text-sm">{event.location}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border p-6">
            <p className="text-muted-foreground">
              You have not organized events yet.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Joined</h2>
        {data?.participations.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.participations.map((participation) => (
              <article
                key={participation.event.id}
                className="bg-card space-y-2 rounded-xl border p-5 shadow-xs"
              >
                <h3 className="font-medium">{participation.event.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(participation.event.dateTime).toLocaleString()}
                </p>
                <p className="text-sm">{participation.event.location}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border p-6">
            <p className="text-muted-foreground">
              You have not joined any events yet.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

export default MyEventsPage;
