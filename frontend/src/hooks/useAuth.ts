import { useAppSelector } from '@/store/hooks';

export function useAuth() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return {
    accessToken,
    isAuthenticated,
  };
}
