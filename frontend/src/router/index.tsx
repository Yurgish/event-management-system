import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout, AuthLayout } from '@/components/layout';
import { APP_ROUTES, ROUTE_PATHS } from '@/constants/routes';
import { ProtectedRoutes } from '@/router/guards';
import PageFallback from '@/router/PageFallback';

/**
 * Each page is loaded on demand to keep the initial bundle smaller.
 * This is especially useful for routes that are opened less frequently.
 */
const CreateEventPage = lazy(() => import('@/pages/CreateEventPage'));
const EditEventPage = lazy(() => import('@/pages/EditEventPage'));
const EventDetailsPage = lazy(() => import('@/pages/EventDetailsPage'));
const EventsPage = lazy(() => import('@/pages/EventsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const MyEventsPage = lazy(() => import('@/pages/MyEventsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));

/**
 * Wraps a lazy-loaded page with a shared Suspense fallback.
 * Keeping this in one place makes route elements cleaner and consistent.
 */
function withPageLoader(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

/**
 * Router structure:
 * - Root app shell with public pages and protected nested pages
 * - Dedicated auth layout for login and register
 */
export const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.ROOT,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={APP_ROUTES.EVENTS} replace />,
      },
      {
        path: ROUTE_PATHS.EVENTS,
        element: withPageLoader(<EventsPage />),
      },
      {
        path: ROUTE_PATHS.EVENT_DETAILS,
        element: withPageLoader(<EventDetailsPage />),
      },
      // Routes below require authenticated user session.
      {
        element: <ProtectedRoutes />,
        children: [
          {
            path: ROUTE_PATHS.CREATE_EVENT,
            element: withPageLoader(<CreateEventPage />),
          },
          {
            path: ROUTE_PATHS.MY_EVENTS,
            element: withPageLoader(<MyEventsPage />),
          },
          {
            path: ROUTE_PATHS.EVENT_EDIT,
            element: withPageLoader(<EditEventPage />),
          },
        ],
      },
      {
        path: ROUTE_PATHS.NOT_FOUND,
        element: withPageLoader(<NotFoundPage />),
      },
    ],
  },
  {
    path: APP_ROUTES.LOGIN,
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: withPageLoader(<LoginPage />),
      },
    ],
  },
  {
    path: APP_ROUTES.REGISTER,
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: withPageLoader(<RegisterPage />),
      },
    ],
  },
]);
