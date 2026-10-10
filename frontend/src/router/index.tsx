import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import RootLayout from '@/components/layout/RootLayout'
import OrganizerLayout from '@/components/layout/OrganizerLayout'
import { ProtectedRoute, RoleRoute } from './guards'
import { ROUTES, ROLES } from '@/constants'
import { PageLoadingState } from '@/components/common'

// ─── Lazy page imports ────────────────────────────────────────────────────────

const HomePage = lazy(() => import('@/pages/public/HomePage'))
const EventDetailPage = lazy(() => import('@/pages/public/EventDetailPage'))
const MyTicketsPage = lazy(() => import('@/pages/attendee/MyTicketsPage'))
const TicketDetailPage = lazy(() => import('@/pages/attendee/TicketDetailPage'))
const OrganizerDashboard = lazy(() => import('@/pages/organizer/OrganizerDashboard'))
const EventListPage = lazy(() => import('@/pages/organizer/EventListPage'))
const CreateEventPage = lazy(() => import('@/pages/organizer/CreateEventPage'))
const EditEventPage = lazy(() => import('@/pages/organizer/EditEventPage'))
const OrganizerEventDetail = lazy(() => import('@/pages/organizer/OrganizerEventDetailPage'))
const TicketValidationPage = lazy(() => import('@/pages/staff/TicketValidationPage'))
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/errors/UnauthorizedPage'))

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoadingState />}>{children}</Suspense>
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public
      {
        index: true,
        element: <S><HomePage /></S>,
      },
      {
        path: 'events/:eventId',
        element: <S><EventDetailPage /></S>,
      },

      // Attendee — any authenticated user
      {
        path: 'my-tickets',
        element: (
          <ProtectedRoute>
            <S><MyTicketsPage /></S>
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-tickets/:ticketId',
        element: (
          <ProtectedRoute>
            <S><TicketDetailPage /></S>
          </ProtectedRoute>
        ),
      },

      // Organizer
      {
        path: 'organizer',
        element: (
          <RoleRoute role={ROLES.ORGANIZER}>
            <OrganizerLayout />
          </RoleRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.ORGANIZER_DASHBOARD} replace />,
          },
          {
            path: 'dashboard',
            element: <S><OrganizerDashboard /></S>,
          },
          {
            path: 'events',
            element: <S><EventListPage /></S>,
          },
          {
            path: 'events/new',
            element: <S><CreateEventPage /></S>,
          },
          {
            path: 'events/:eventId',
            element: <S><OrganizerEventDetail /></S>,
          },
          {
            path: 'events/:eventId/edit',
            element: <S><EditEventPage /></S>,
          },
        ],
      },

      // Staff
      {
        path: 'staff/validate',
        element: (
          <ProtectedRoute>
            <S><TicketValidationPage /></S>
          </ProtectedRoute>
        ),
      },

      // Errors
      {
        path: '403',
        element: <S><UnauthorizedPage /></S>,
      },
      {
        path: '404',
        element: <S><NotFoundPage /></S>,
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.NOT_FOUND} replace />,
      },
    ],
  },
])
