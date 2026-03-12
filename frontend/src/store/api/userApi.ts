import { baseApi } from '@/store/api/baseApi';
import type { MyEventsResponse } from '@/types/api/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyEvents: builder.query<MyEventsResponse, void>({
      query: () => '/users/me/events',
      providesTags: ['MyEvents'],
    }),
  }),
});

export const { useGetMyEventsQuery } = userApi;
