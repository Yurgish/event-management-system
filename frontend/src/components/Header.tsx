import { Calendar, List, LogOutIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import CreateEventButton from '@/components/CreateEventButton';
import { APP_ROUTES } from '@/constants/routes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks';
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
      <Link to={APP_ROUTES.MY_EVENTS}>
        <Calendar />
        <span className="hidden sm:inline">My Events</span>
      </Link>
    </Button>
    <CreateEventButton />
    <Separator orientation="vertical" />
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
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
      <Link to={APP_ROUTES.REGISTER}>Register</Link>
    ) : (
      <Link to={APP_ROUTES.LOGIN}>Login</Link>
    )}
  </Button>
);

const GuestActions = () => (
  <>
    <Button asChild variant="ghost" size="lg">
      <Link to={APP_ROUTES.LOGIN}>Login</Link>
    </Button>
    <Button asChild variant="default" size="lg">
      <Link to={APP_ROUTES.REGISTER}>Register</Link>
    </Button>
  </>
);

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isLoginPage = pathname === APP_ROUTES.LOGIN;
  const isAuthPage = isLoginPage || pathname === APP_ROUTES.REGISTER;

  const handleLogout = () => {
    logout().finally(() => {
      navigate(APP_ROUTES.LOGIN, { replace: true });
    });
  };

  return (
    <header className="bg-background fixed top-0 z-50 w-full border-b">
      <div className="layout-container flex items-center justify-end py-2">
        <div className="flex items-center gap-1 sm:gap-4">
          <Button asChild variant="ghost" size="lg">
            <Link to={APP_ROUTES.EVENTS}>
              <List />
              <span className="hidden sm:inline">Events</span>
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
