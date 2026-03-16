import { useMemo } from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { useGetTagsQuery } from '@/store/api';
import type { TagItem } from '@/types/api/tags';

import { getTagColorClasses } from './TagBadge';

const MAX_SELECTED_TAGS = 5;

interface TagsMultiSelectComboboxProps {
  id?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function TagsMultiSelectCombobox({
  id,
  value,
  onValueChange,
  placeholder = 'Filter by tags',
  disabled = false,
  className,
}: TagsMultiSelectComboboxProps) {
  const anchor = useComboboxAnchor();
  const { data: tags = [], isFetching } = useGetTagsQuery();

  const tagsById = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags],
  );

  const selectedTags = useMemo(
    () =>
      value
        .map((id) => tagsById.get(id))
        .filter((tag): tag is TagItem => Boolean(tag)),
    [value, tagsById],
  );

  const isLimitReached = selectedTags.length >= MAX_SELECTED_TAGS;

  const handleValueChange = (nextSelectedTags: TagItem[]) => {
    onValueChange(nextSelectedTags.map((tag) => tag.id));
  };

  return (
    <Combobox
      multiple
      autoHighlight
      items={tags}
      value={selectedTags}
      onValueChange={handleValueChange}
      itemToStringValue={(item) => item.label}
      disabled={isFetching || disabled}
    >
      <ComboboxChips ref={anchor} className={cn('w-full', className)}>
        <ComboboxValue>
          {(selectedValues: TagItem[]) => (
            <>
              {selectedValues.map((tag) => {
                return (
                  <ComboboxChip
                    key={tag.id}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-xs',
                      getTagColorClasses(tag.color),
                    )}
                  >
                    {tag.label}
                  </ComboboxChip>
                );
              })}
            </>
          )}
        </ComboboxValue>
        <ComboboxChipsInput
          id={id}
          placeholder={selectedTags.length ? '' : placeholder}
          disabled={disabled || isLimitReached}
        />
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No tags found.</ComboboxEmpty>

        <ComboboxList>
          {(tag: TagItem) => {
            const isSelected = selectedTags.some((t) => t.id === tag.id);
            return (
              <ComboboxItem
                key={tag.id}
                value={tag}
                disabled={disabled || (isLimitReached && !isSelected)}
              >
                {tag.label}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default TagsMultiSelectCombobox;
