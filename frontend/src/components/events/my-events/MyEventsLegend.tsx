function MyEventsLegend() {
  return (
    <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 sm:gap-2 sm:px-3 sm:py-1 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          Organized by you
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700 sm:gap-2 sm:px-3 sm:py-1 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-300">
          <span className="size-2 rounded-full bg-sky-600 dark:bg-sky-400" />
          Joined by you
        </span>
      </div>
    </div>
  );
}

export default MyEventsLegend;
