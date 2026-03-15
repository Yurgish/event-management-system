import type { paths } from '@/types/generated/api-schema';

type ApiPathTemplate = keyof paths;
type ApiParamValue = string | number;

/**
 * These templates are statically checked against generated OpenAPI paths.
 * If backend routes change, TypeScript will fail here first.
 */
const API_PATH_TEMPLATES = {
  EVENTS: '/events',
  EVENT_BY_ID: '/events/{id}',
  EVENT_JOIN: '/events/{id}/join',
  EVENT_LEAVE: '/events/{id}/leave',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  USERS_ME: '/users/me',
  USERS_ME_EVENTS: '/users/me/events',
} as const satisfies Record<string, ApiPathTemplate>;

function resolveApiPath(
  template: ApiPathTemplate,
  params: Record<string, ApiParamValue> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];

    if (value === undefined || value === null) {
      throw new Error(`Missing API path param: ${key}`);
    }

    return encodeURIComponent(String(value));
  });
}

/**
 * Use this object in API slices to avoid hardcoded endpoint strings.
 */
export const API_ENDPOINTS = {
  EVENTS: API_PATH_TEMPLATES.EVENTS,
  EVENT_BY_ID: (id: ApiParamValue) =>
    resolveApiPath(API_PATH_TEMPLATES.EVENT_BY_ID, { id }),
  EVENT_JOIN: (id: ApiParamValue) =>
    resolveApiPath(API_PATH_TEMPLATES.EVENT_JOIN, { id }),
  EVENT_LEAVE: (id: ApiParamValue) =>
    resolveApiPath(API_PATH_TEMPLATES.EVENT_LEAVE, { id }),
  AUTH_REGISTER: API_PATH_TEMPLATES.AUTH_REGISTER,
  AUTH_LOGIN: API_PATH_TEMPLATES.AUTH_LOGIN,
  AUTH_REFRESH: API_PATH_TEMPLATES.AUTH_REFRESH,
  AUTH_LOGOUT: API_PATH_TEMPLATES.AUTH_LOGOUT,
  USERS_ME: API_PATH_TEMPLATES.USERS_ME,
  USERS_ME_EVENTS: API_PATH_TEMPLATES.USERS_ME_EVENTS,
} as const;
