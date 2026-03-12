import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { EventDetail } from '@/types/api/events';

type Participant = EventDetail['participants'][number];

interface EventParticipantsProps {
  participants: Participant[];
}

const AVATAR_LIMIT = 8;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function EventParticipants({ participants }: EventParticipantsProps) {
  const [open, setOpen] = useState(false);

  if (participants.length === 0) {
    return null;
  }

  const visibleAvatars = participants.slice(0, AVATAR_LIMIT);
  const overflowCount = participants.length - AVATAR_LIMIT;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium sm:text-base">Participants</p>

      <AvatarGroup>
        {visibleAvatars.map((p) => (
          <Avatar key={p.userId}>
            <AvatarFallback>{getInitials(p.user.name)}</AvatarFallback>
          </Avatar>
        ))}
        {overflowCount > 0 && (
          <AvatarGroupCount>+{overflowCount}</AvatarGroupCount>
        )}
      </AvatarGroup>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto px-0 text-sm">
            <ChevronDownIcon
              className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
            {open ? 'Hide names' : 'Show all names'}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {participants.map((p) => (
              <span
                key={p.userId}
                className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs"
              >
                {p.user.name}
              </span>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default EventParticipants;
