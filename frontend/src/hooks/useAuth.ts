import { useGetMeQuery } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

export function useAuth() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: user } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  return {
    accessToken,
    isAuthenticated,
    user,
  };
}
