import { baseApi } from '@/store/api/baseApi';
import type { UserInfo } from '@/types/api/auth';
import type { MyEventsResponse } from '@/types/api/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<UserInfo, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    getMyEvents: builder.query<MyEventsResponse, void>({
      query: () => '/users/me/events',
      providesTags: ['MyEvents'],
    }),
  }),
});

export const { useGetMeQuery, useGetMyEventsQuery } = userApi;
