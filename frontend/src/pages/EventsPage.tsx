import { Loader2Icon, SearchIcon, XIcon } from 'lucide-react';

import {
  EventCard,
  EventCardSkeleton,
  EventsPagination,
} from '@/components/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEventsFilters } from '@/hooks';
import { cn } from '@/lib/utils';
import { useGetEventsQuery } from '@/store/api';

const PAGE_LIMIT = 6;

function EventsPage() {
  const { page, search, searchValue, setSearchValue, setSearch, clearSearch } =
    useEventsFilters();

  const { data, isError, isLoading, isFetching } = useGetEventsQuery({
    page,
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
  });

  const showSkeletons = isLoading && !data;
  const isRefetching = isFetching && Boolean(data);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchValue);
  };

  if (isError && !data) {
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
          Browse public events, join what you like, or open full event details.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="xs:flex-row flex flex-col gap-2 md:max-w-[32rem]"
      >
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-2 left-3 size-4" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by title, description, or location"
            className="pl-9"
          />
        </div>

        <Button type="submit" disabled={isFetching}>
          {isRefetching ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SearchIcon className="size-4" />
          )}
          Search
        </Button>

        {search && (
          <Button type="button" variant="outline" onClick={clearSearch}>
            <XIcon className="size-4" />
            Clear
          </Button>
        )}
      </form>

      {showSkeletons ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: PAGE_LIMIT }, (_, index) => (
            <EventCardSkeleton key={`event-skeleton-${index}`} />
          ))}
        </div>
      ) : data?.items.length ? (
        <>
          <div
            className={cn(
              'grid gap-4 transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-3',
              isRefetching && 'pointer-events-none opacity-50',
            )}
          >
            {data.items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isJoined={event.isJoined ?? false}
              />
            ))}
          </div>

          <EventsPagination totalPages={data.meta.totalPages} />

          <p className="text-muted-foreground text-center text-sm">
            Showing {data.items.length} of {data.meta.total} events
          </p>
        </>
      ) : (
        <div className="bg-card rounded-xl border p-6">
          <p className="text-muted-foreground">
            {search ? 'No events match your search.' : 'No events found.'}
          </p>
        </div>
      )}
    </section>
  );
}

export default EventsPage;
