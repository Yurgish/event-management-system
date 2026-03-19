import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { baseApi } from '@/store/api/baseApi';
import type { UserInfo } from '@/types/api/auth';
import type { MyEventsResponse } from '@/types/api/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<UserInfo, void>({
      query: () => API_ENDPOINTS.USERS_ME,
      providesTags: ['User'],
    }),
    getMyEvents: builder.query<MyEventsResponse, void>({
      query: () => API_ENDPOINTS.USERS_ME_EVENTS,
      providesTags: ['MyEvents'],
    }),
  }),
});

export const { useGetMeQuery, useGetMyEventsQuery } = userApi;
