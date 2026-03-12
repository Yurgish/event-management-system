import { Calendar, List, LogOutIcon, Plus } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutMutation } from '@/store/api';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Keep UI responsive even if logout request fails.
    }
  };

  return (
    <header className="bg-background w-full border-b-1">
      <div className="flex w-full items-center justify-end px-4 py-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-1 sm:gap-4">
            <Button variant="ghost" size="lg" title="Events">
              <List /> Events
            </Button>
            <Button variant="ghost" size="lg" title="My Events">
              <Calendar /> My Events
            </Button>
            <Button size="lg" variant="default" title="Create Event">
              <Plus /> Create Event
            </Button>
            <Separator orientation="vertical" />
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Log out"
              title="Log out"
            >
              <LogOutIcon />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="lg" title="Login">
              Login
            </Button>
            <Button variant="default" size="lg" title="Register">
              Register
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
