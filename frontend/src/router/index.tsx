import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout, AuthLayout } from '@/components/layout';
import {
  CreateEventPage,
  EditEventPage,
  EventDetailsPage,
  EventsPage,
  LoginPage,
  MyEventsPage,
  NotFoundPage,
  RegisterPage,
} from '@/pages';
import { ProtectedRoutes } from '@/router/guards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/events" replace />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailsPage />,
      },
      {
        element: <ProtectedRoutes />,
        children: [
          {
            path: 'create-event',
            element: <CreateEventPage />,
          },
          {
            path: 'my-events',
            element: <MyEventsPage />,
          },
          {
            path: 'events/:id/edit',
            element: <EditEventPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
]);
