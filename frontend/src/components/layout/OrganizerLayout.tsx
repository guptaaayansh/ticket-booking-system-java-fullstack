import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, PlusCircle } from 'lucide-react'
import { ROUTES } from '@/constants'
import { cn } from '@/utils'

const sideNav = [
  { to: ROUTES.ORGANIZER_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.ORGANIZER_EVENTS, icon: CalendarDays, label: 'My Events' },
  { to: ROUTES.ORGANIZER_EVENT_CREATE, icon: PlusCircle, label: 'Create Event' },
]

export default function OrganizerLayout() {
  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 pt-2">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2">
          Organizer
        </p>
        {sideNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.ORGANIZER_DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent-glow)] text-[var(--accent)] border border-[rgba(124,58,237,0.25)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Mobile top-tab nav */}
      <div className="lg:hidden -mx-4 sm:-mx-6 mb-6">
        <div className="flex overflow-x-auto px-4 sm:px-6 gap-2 pb-2 border-b border-[var(--border)]">
          {sideNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ORGANIZER_DASHBOARD}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0',
                  isActive
                    ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
