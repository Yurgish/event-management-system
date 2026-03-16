import { SearchIcon, XIcon } from 'lucide-react';

import {
  EventCard,
  EventCardSkeleton,
  EventsPagination,
  TagsMultiSelectCombobox,
} from '@/components/events';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { useEventsFilters } from '@/hooks';
import { cn } from '@/lib/utils';
import { useGetEventsQuery } from '@/store/api';

const PAGE_LIMIT = 6;

function EventsPage() {
  const {
    page,
    search,
    tags,
    searchValue,
    setSearchValue,
    setSearch,
    setTags,
    clearFilters,
  } = useEventsFilters();

  const { data, isError, isLoading, isFetching } = useGetEventsQuery({
    page,
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
    ...(tags.length ? { tags } : {}),
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

      <div className="md:max-w-[40rem]">
        <form onSubmit={handleSearchSubmit}>
          <div className="xs:flex-row flex flex-col gap-2">
            <ButtonGroup className="w-full flex-1">
              <InputGroup className="flex-1">
                <InputGroupInput
                  id="events-search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search by title, description, or location"
                />
              </InputGroup>

              <Button type="submit" disabled={isFetching}>
                {isRefetching ? (
                  <Spinner className="text-muted-foreground" />
                ) : (
                  <SearchIcon className="size-4" />
                )}
              </Button>
            </ButtonGroup>

            <TagsMultiSelectCombobox
              id="events-tags-filter"
              value={tags}
              onValueChange={setTags}
              placeholder="Filter by tags"
              className="flex-1"
            />

            {(search || tags.length > 0) && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                <XIcon className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

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
            {search || tags.length > 0
              ? 'No events match selected filters.'
              : 'No events found.'}
          </p>
        </div>
      )}
    </section>
  );
}

export default EventsPage;
