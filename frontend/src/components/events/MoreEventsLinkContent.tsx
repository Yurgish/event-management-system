import type { MoreLinkContentArg } from '@fullcalendar/core/index.js';
import { MoreHorizontalIcon } from 'lucide-react';

function MoreEventsLinkContent({ num }: MoreLinkContentArg) {
  return (
    <>
      <span className="fc-more-link-dots" aria-hidden="true">
        <MoreHorizontalIcon className="size-3.5" />
      </span>
      <span className="fc-more-link-label">{num} events</span>
    </>
  );
}

export default MoreEventsLinkContent;
