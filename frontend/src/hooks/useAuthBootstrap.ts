import { useEffect } from 'react';

import { useRefreshMutation } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

const AUTH_BOOTSTRAP_REFRESH_KEY = 'auth-bootstrap-refresh';

export function useAuthBootstrap() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [refresh, { isLoading, isUninitialized }] = useRefreshMutation({
    fixedCacheKey: AUTH_BOOTSTRAP_REFRESH_KEY,
  });

  useEffect(() => {
    if (accessToken || isLoading || !isUninitialized) {
      return;
    }

    void refresh()
      .unwrap()
      .catch(() => {
        // No valid refresh cookie, user stays logged out.
      });
  }, [accessToken, isLoading, isUninitialized, refresh]);

  return {
    isAuthBootstrapping: !accessToken && (isUninitialized || isLoading),
  };
}
