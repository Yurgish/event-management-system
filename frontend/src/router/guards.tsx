import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { APP_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks';

export function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
