import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import CreateEventPage from '@/pages/CreateEventPage';
import EditEventPage from '@/pages/EditEventPage';
import EventsPage from '@/pages/EventsPage';
import LoginPage from '@/pages/LoginPage';
import MyEventsPage from '@/pages/MyEventsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';
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
