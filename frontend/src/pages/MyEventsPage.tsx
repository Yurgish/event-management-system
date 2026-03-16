import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';

import CreateEventButton from '@/components/CreateEventButton';
import DayEventsDialog from '@/components/events/DayEventsDialog';
import MoreEventsLinkContent from '@/components/events/MoreEventsLinkContent';
import MyEventsToolbar from '@/components/events/my-events/MyEventsToolbar';
import { useAuth } from '@/hooks';
import { useMyEventsCalendar } from '@/hooks/useMyEventsCalendar';
import { useGetMyEventsQuery } from '@/store/api';

function MyEventsPage() {
  const { user } = useAuth();
  const { data, isError, isLoading } = useGetMyEventsQuery();
  const {
    calendarRef,
    calendarTitle,
    currentView,
    isMobile,
    dayModal,
    calendarEvents,
    handleEventClick,
    handleMoreLinkClick,
    handleDayModalChange,
    handleDayCellClassNames,
    handleDayCellDidMount,
    handleDayCellWillUnmount,
    handleDatesSet,
    handlePrev,
    handleNext,
    handleViewChange,
  } = useMyEventsCalendar(data, user?.id);

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
    <>
      <section className="space-y-8">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="sm:space-y-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
              My Events
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              View your organized and joined events on a calendar.
            </p>
          </div>

          <CreateEventButton />
        </div>
        <MyEventsToolbar
          calendarTitle={calendarTitle}
          currentView={currentView}
          onPrev={handlePrev}
          onNext={handleNext}
          onViewChange={handleViewChange}
        />

        <div className="bg-card space-y-4 rounded-2xl border p-4 shadow-xs sm:p-5">
          <div className="my-events-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              datesSet={handleDatesSet}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              fixedWeekCount={false}
              dayMaxEventRows={isMobile ? 3 : 1}
              dayCellClassNames={handleDayCellClassNames}
              dayCellDidMount={handleDayCellDidMount}
              dayCellWillUnmount={handleDayCellWillUnmount}
              moreLinkClassNames={() =>
                isMobile
                  ? ['my-events-more-link', 'my-events-more-link-mobile']
                  : ['my-events-more-link']
              }
              moreLinkContent={isMobile ? undefined : MoreEventsLinkContent}
              moreLinkClick={handleMoreLinkClick as never}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
            />
          </div>
        </div>
      </section>

      <DayEventsDialog
        open={dayModal.open}
        dateLabel={dayModal.dateLabel}
        events={dayModal.events}
        onOpenChange={handleDayModalChange}
      />
    </>
  );
}

export default MyEventsPage;
