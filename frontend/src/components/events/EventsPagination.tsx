import { useMemo } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useEventsFilters } from '@/hooks';

type PageEntry = number | 'ellipsis';

function buildPageEntries(page: number, totalPages: number): PageEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const selected = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...selected]
    .filter((v) => v >= 1 && v <= totalPages)
    .sort((a, b) => a - b);

  const entries: PageEntry[] = [];
  pages.forEach((value, index) => {
    const prev = pages[index - 1];
    if (prev && value - prev > 1) entries.push('ellipsis');
    entries.push(value);
  });
  return entries;
}

interface EventsPaginationProps {
  totalPages: number;
}

function EventsPagination({ totalPages }: EventsPaginationProps) {
  const { page, setPage } = useEventsFilters();
  const entries = useMemo(
    () => buildPageEntries(page, totalPages),
    [page, totalPages],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
            onClick={(event) => {
              event.preventDefault();
              if (page > 1) {
                setPage(page - 1);
              }
            }}
          />
        </PaginationItem>

        {entries.map((entry, index) => (
          <PaginationItem key={`${entry}-${index}`}>
            {entry === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={entry === page}
                onClick={(event) => {
                  event.preventDefault();
                  setPage(entry);
                }}
              >
                {entry}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            className={
              page >= totalPages ? 'pointer-events-none opacity-50' : undefined
            }
            onClick={(event) => {
              event.preventDefault();
              if (page < totalPages) {
                setPage(page + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default EventsPagination;
