import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

interface CreateEventButtonProps {
  className?: string;
  size?: React.ComponentProps<typeof Button>['size'];
  variant?: React.ComponentProps<typeof Button>['variant'];
}

function CreateEventButton({
  className,
  size = 'lg',
  variant = 'default',
}: CreateEventButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link to="/create-event">
        <Plus />
        <span className="hidden sm:inline">Create Event</span>
      </Link>
    </Button>
  );
}

export default CreateEventButton;
