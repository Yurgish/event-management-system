import { cn } from '@/lib/utils';

import TagBadge, { type EventTagBadgeData } from './TagBadge';

interface EventTagsProps {
  tags?: EventTagBadgeData[];
  className?: string;
}

function EventTags({ tags, className }: EventTagsProps) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <TagBadge key={tag.id} label={tag.label} color={tag.color} />
      ))}
    </div>
  );
}

export default EventTags;
