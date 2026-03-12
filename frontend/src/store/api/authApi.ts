import { baseApi } from '@/store/api/baseApi';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import type {
  AuthResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from '@/types/api/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
      invalidatesTags: ['Auth'],
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(clearCredentials());
      },
      invalidatesTags: ['Auth', 'MyEvents', 'User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useRegisterMutation,
} = authApi;
