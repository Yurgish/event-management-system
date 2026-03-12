import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/store';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import type { AuthResponse } from '@/types/api/auth';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const requestUrl = typeof args === 'string' ? args : args.url;
  const isRefreshRequest = requestUrl.includes('/auth/refresh');
  const isAuthRequest =
    requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

  if (result.error?.status === 401 && !isRefreshRequest && !isAuthRequest) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data as AuthResponse));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
      api.dispatch(baseApi.util.resetApiState());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Event', 'MyEvents', 'User'],
  endpoints: () => ({}),
});

// race condition when multiple requests fail with 401 at the same time, they will all try to refresh the token (remake later)
