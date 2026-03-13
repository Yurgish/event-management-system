import type { components, operations } from '@/types/generated/api-schema';

export type ListEventsParams =
  operations['EventController_findAll']['parameters']['query'];

/** Full event with participants list — used on the detail page. */
export type EventDetail = components['schemas']['EventResponseDto'];
/** Event summary without participants — used in list, create, update. */
export type EventSummary = components['schemas']['EventSummaryDto'];
export type PaginatedEventsResponse =
  components['schemas']['PaginatedEventsResponseDto'];
export type CreateEventRequest = components['schemas']['CreateEventDto'];
export type UpdateEventRequest = components['schemas']['UpdateEventDto'];
export type ParticipantRecord = components['schemas']['ParticipantRecordDto'];
export type SuccessResponse = components['schemas']['SuccessResponseDto'];
