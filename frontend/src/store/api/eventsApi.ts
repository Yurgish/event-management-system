import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { baseApi } from '@/store/api/baseApi';
import type {
  CreateEventRequest,
  EventDetail,
  EventSummary,
  ListEventsParams,
  PaginatedEventsResponse,
  ParticipantRecord,
  SuccessResponse,
  UpdateEventRequest,
} from '@/types/api/events';

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<PaginatedEventsResponse, ListEventsParams | void>({
      query: (params) =>
        params
          ? {
              url: API_ENDPOINTS.EVENTS,
              params,
            }
          : {
              url: API_ENDPOINTS.EVENTS,
            },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((event) => ({
                type: 'Event' as const,
                id: event.id,
              })),
              { type: 'Event' as const, id: 'LIST' },
            ]
          : [{ type: 'Event' as const, id: 'LIST' }],
    }),
    getEventById: builder.query<EventDetail, string>({
      query: (id) => API_ENDPOINTS.EVENT_BY_ID(id),
      providesTags: (_, __, id) => [{ type: 'Event', id }],
    }),
    createEvent: builder.mutation<EventSummary, CreateEventRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.EVENTS,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, 'MyEvents'],
    }),
    updateEvent: builder.mutation<
      EventSummary,
      { id: string; body: UpdateEventRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ENDPOINTS.EVENT_BY_ID(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        'MyEvents',
      ],
    }),
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.EVENT_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        'MyEvents',
      ],
    }),
    joinEvent: builder.mutation<ParticipantRecord, string>({
      query: (id) => ({
        url: API_ENDPOINTS.EVENT_JOIN(id),
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Event', id }, 'MyEvents'],
    }),
    leaveEvent: builder.mutation<SuccessResponse, string>({
      query: (id) => ({
        url: API_ENDPOINTS.EVENT_LEAVE(id),
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Event', id }, 'MyEvents'],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventByIdQuery,
  useGetEventsQuery,
  useJoinEventMutation,
  useLeaveEventMutation,
  useUpdateEventMutation,
} = eventsApi;
