import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import * as yup from 'yup';

import type { CreateEventRequest, EventDetail } from '@/types/api/events';

export const eventFormSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .required('Title is required'),
  description: yup
    .string()
    .trim()
    .max(200, 'Description must be at most 200 characters')
    .required('Description is required'),
  date: yup
    .date()
    .typeError('Please select a date')
    .required('Date is required'),
  time: yup
    .string()
    .matches(/^\d{2}:\d{2}$/, 'Please select a time')
    .required('Time is required'),
  location: yup.string().trim().required('Location is required'),
  tagIds: yup
    .array()
    .of(yup.string().trim().required())
    .max(5, 'You can select up to 5 tags')
    .default([]),
  capacity: yup
    .number()
    .transform((val, orig) => (orig === '' ? undefined : val))
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .optional(),
  visibility: yup
    .string()
    .oneOf(['public', 'private'] as const)
    .required(),
});

export type EventFormValues = Omit<
  yup.InferType<typeof eventFormSchema>,
  'capacity'
> & {
  capacity?: number;
};

export const eventFormResolver = yupResolver(
  eventFormSchema,
) as unknown as Resolver<EventFormValues>;

export function getEmptyEventFormValues(): Partial<EventFormValues> {
  return {
    title: '',
    description: '',
    time: '',
    location: '',
    tagIds: [],
    visibility: 'public',
    capacity: undefined,
  };
}

export function getEventFormValuesFromEvent(
  event: Pick<
    EventDetail,
    | 'title'
    | 'description'
    | 'dateTime'
    | 'location'
    | 'capacity'
    | 'isPublic'
    | 'tags'
  >,
): EventFormValues {
  const dateTime = new Date(event.dateTime);
  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');

  return {
    title: event.title,
    description: event.description,
    date: dateTime,
    time: `${hours}:${minutes}`,
    location: event.location,
    tagIds: event.tags?.map((tag) => tag.id) ?? [],
    capacity: typeof event.capacity === 'number' ? event.capacity : undefined,
    visibility: event.isPublic ? 'public' : 'private',
  };
}

export function buildEventRequest(values: EventFormValues): CreateEventRequest {
  const dateTime = new Date(values.date);
  const [hours, minutes] = values.time.split(':').map(Number);
  dateTime.setHours(hours, minutes, 0, 0);

  return {
    title: values.title,
    description: values.description,
    dateTime: dateTime.toISOString(),
    location: values.location,
    tagIds: values.tagIds ?? [],
    ...(values.capacity != null && { capacity: values.capacity }),
    isPublic: values.visibility === 'public',
  };
}
