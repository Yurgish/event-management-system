type RouteParam = string | number;

/**
 * Route patterns are used by react-router when declaring route paths.
 * Keep these values without leading slash for nested routes.
 */
export const ROUTE_PATHS = {
  ROOT: '/',
  EVENTS: 'events',
  EVENT_DETAILS: 'events/:id',
  CREATE_EVENT: 'create-event',
  MY_EVENTS: 'my-events',
  EVENT_EDIT: 'events/:id/edit',
  LOGIN: 'login',
  REGISTER: 'register',
  NOT_FOUND: '*',
} as const;

/**
 * App routes are concrete URLs used in Link and navigate calls.
 */
export const APP_ROUTES = {
  ROOT: '/',
  EVENTS: '/events',
  EVENT_DETAILS: (id: RouteParam) => `/events/${id}`,
  EVENT_EDIT: (id: RouteParam) => `/events/${id}/edit`,
  CREATE_EVENT: '/create-event',
  MY_EVENTS: '/my-events',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
