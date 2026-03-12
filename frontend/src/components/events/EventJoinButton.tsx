import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';
import { getServerErrorMessage } from '@/lib/server-error';
import { cn } from '@/lib/utils';
import { useJoinEventMutation, useLeaveEventMutation } from '@/store/api';

interface EventJoinButtonProps {
  eventId: string;
  isJoined: boolean;
  isFull: boolean;
  onJoinedChange?: (isJoined: boolean) => void;
  className?: string;
}

function EventJoinButton({
  eventId,
  isJoined,
  isFull,
  onJoinedChange,
  className,
}: EventJoinButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [joinEvent, { isLoading: isJoining }] = useJoinEventMutation();
  const [leaveEvent, { isLoading: isLeaving }] = useLeaveEventMutation();
  const [joinedState, setJoinedState] = useState(isJoined);

  useEffect(() => {
    setJoinedState(isJoined);
  }, [isJoined]);

  const isPending = isJoining || isLeaving;
  const isDisabled = isPending || (!joinedState && isFull);

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to join events.');
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    try {
      if (joinedState) {
        await leaveEvent(eventId).unwrap();
        setJoinedState(false);
        onJoinedChange?.(false);
        toast.success('You left the event.');
      } else {
        await joinEvent(eventId).unwrap();
        setJoinedState(true);
        onJoinedChange?.(true);
        toast.success('You joined the event.');
      }
    } catch (error) {
      toast.error(
        getServerErrorMessage(
          error,
          joinedState
            ? 'Failed to leave the event.'
            : 'Failed to join the event.',
        ),
      );
    }
  };

  const getLabel = () => {
    if (joinedState) return 'Leave';
    if (isFull) return 'Event Full';
    return 'Join';
  };

  return (
    <Button
      type="button"
      variant={joinedState ? 'outline' : 'default'}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Idle label — stays in flow to keep button width stable */}
      <span
        className={cn(
          'transition-opacity duration-150',
          isPending && 'opacity-0',
        )}
      >
        {getLabel()}
      </span>

      {/* Loading overlay — cross-fades over idle label */}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center gap-1.5 transition-opacity duration-150',
          isPending ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Loader2Icon className="size-3.5 animate-spin" />
        {joinedState ? 'Leaving...' : 'Joining...'}
      </span>
    </Button>
  );
}

export default EventJoinButton;
