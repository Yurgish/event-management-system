import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useEventsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const search = searchParams.get('search')?.trim() ?? '';
  const tags = searchParams
    .getAll('tags')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(nextPage));
    }
    setSearchParams(next);
  };

  const setSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set('search', value.trim());
    } else {
      next.delete('search');
    }
    next.delete('page');
    setSearchParams(next);
  };

  const setTags = (tagIds: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete('tags');

    for (const tagId of tagIds) {
      next.append('tags', tagId);
    }

    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    next.delete('tags');
    next.delete('page');
    setSearchValue('');
    setSearchParams(next);
  };

  return {
    page,
    search,
    tags,
    searchValue,
    setSearchValue,
    setPage,
    setSearch,
    setTags,
    clearFilters,
  };
}
