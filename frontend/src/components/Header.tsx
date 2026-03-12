import { Calendar, List, LogOutIcon, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useLogoutMutation } from '@/store/api';

interface AuthenticatedActionsProps {
  user: { name?: string } | undefined;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const AuthenticatedActions = ({
  user,
  onLogout,
  isLoggingOut,
}: AuthenticatedActionsProps) => (
  <>
    <Button asChild variant="ghost" size="lg">
      <Link to="/my-events">
        <Calendar /> My Events
      </Link>
    </Button>
    <Button asChild variant="default" size="lg">
      <Link to="/create-event">
        <Plus /> Create Event
      </Link>
    </Button>
    <Separator orientation="vertical" />
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{user?.name}</span>
    </div>
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={onLogout}
      disabled={isLoggingOut}
      aria-label="Log out"
    >
      <LogOutIcon />
    </Button>
  </>
);

const AuthPageActions = ({ isLoginPage }: { isLoginPage: boolean }) => (
  <Button asChild variant="default" size="lg">
    {isLoginPage ? (
      <Link to="/register">Register</Link>
    ) : (
      <Link to="/login">Login</Link>
    )}
  </Button>
);

const GuestActions = () => (
  <>
    <Button asChild variant="ghost" size="lg">
      <Link to="/login">Login</Link>
    </Button>
    <Button asChild variant="default" size="lg">
      <Link to="/register">Register</Link>
    </Button>
  </>
);

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLoginPage = pathname === '/login';
  const isAuthPage = isLoginPage || pathname === '/register';

  const handleLogout = () => {
    logout().finally(() => {
      navigate('/login', { replace: true });
    });
  };

  return (
    <header className="bg-background fixed top-0 z-50 w-full border-b">
      <div className="layout-container flex items-center justify-end py-2">
        <div className="flex items-center gap-1 sm:gap-4">
          <Button asChild variant="ghost" size="lg">
            <Link to="/events">
              <List /> Events
            </Link>
          </Button>

          {isAuthPage ? (
            <AuthPageActions isLoginPage={isLoginPage} />
          ) : isAuthenticated ? (
            <AuthenticatedActions
              user={user}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          ) : (
            <GuestActions />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
