import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { baseApi } from '@/store/api/baseApi';
import { clearAssistantChatHistory } from '@/store/assistantChatStore';
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
        url: API_ENDPOINTS.AUTH_REGISTER,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
      invalidatesTags: ['Auth', 'User', 'MyEvents'],
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH_LOGIN,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
        clearAssistantChatHistory();
      },
      invalidatesTags: ['Auth', 'User', 'MyEvents'],
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH_REFRESH,
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
      invalidatesTags: ['Auth', 'User', 'MyEvents'],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH_LOGOUT,
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearAssistantChatHistory();
          dispatch(clearCredentials());
          dispatch(baseApi.util.resetApiState());
        }
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
