import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { RootState } from '@/store';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import type { AuthResponse } from '@/types/api/auth';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Shared in-flight refresh promise.
 *
 * When multiple requests fail with 401 simultaneously, all of them
 * will await the same promise instead of each firing their own refresh request.
 * Once the refresh completes (success or failure), the promise is cleared
 * so future 401s can trigger a new refresh cycle.
 */
let refreshTokenPromise: Promise<AuthResponse | null> | null = null;

/**
 * Base query with JWT access token injected from Redux store.
 * Refresh token is handled automatically via httpOnly cookie.
 */
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

/**
 * Attempts to refresh the access token using the httpOnly refresh cookie.
 *
 * On success — dispatches new credentials to the Redux store and returns the payload.
 * On failure — clears auth state, resets the API cache, and returns null.
 */
async function refreshAccessToken(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<AuthResponse | null> {
  const refreshResult = await baseQuery(
    { url: API_ENDPOINTS.AUTH_REFRESH, method: 'POST' },
    api,
    extraOptions,
  );

  if (refreshResult.data) {
    const authPayload = refreshResult.data as AuthResponse;
    api.dispatch(setCredentials(authPayload));
    return authPayload;
  }

  // Refresh token is invalid or expired — force logout
  api.dispatch(clearCredentials());
  api.dispatch(baseApi.util.resetApiState());
  return null;
}

/**
 * Extended base query with automatic token refresh on 401 responses.
 *
 * Flow:
 * 1. Execute the original request
 * 2. If the response is not 401 — return immediately
 * 3. Skip refresh for auth endpoints to avoid infinite loops
 * 4. Trigger a single shared refresh (race condition protection via shared promise)
 * 5. If refresh succeeds — retry the original request with the new token
 * 6. If refresh fails — return the original 401 error (user will be logged out)
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // No error or not a 401 — nothing to do
  if (result.error?.status !== 401) return result;

  const requestUrl = typeof args === 'string' ? args : args.url;

  // Avoid refresh loop: if the refresh request itself returns 401,
  // or if login/register fail — return the error as-is
  const isRefreshRequest = requestUrl.includes(API_ENDPOINTS.AUTH_REFRESH);
  const isAuthRequest =
    requestUrl.includes(API_ENDPOINTS.AUTH_LOGIN) ||
    requestUrl.includes(API_ENDPOINTS.AUTH_REGISTER);

  if (isRefreshRequest || isAuthRequest) return result;

  // Deduplicate concurrent refresh calls:
  // if a refresh is already in progress, reuse that promise
  // instead of sending another request
  if (refreshTokenPromise === null) {
    refreshTokenPromise = refreshAccessToken(api, extraOptions).finally(() => {
      refreshTokenPromise = null;
    });
  }

  const refreshed = await refreshTokenPromise;

  // Refresh succeeded — retry original request with new access token
  if (refreshed) {
    result = await baseQuery(args, api, extraOptions);
  }

  // Refresh failed — return the original 401 so the caller can handle it
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Event', 'MyEvents', 'Tag', 'User'],
  endpoints: () => ({}),
});
