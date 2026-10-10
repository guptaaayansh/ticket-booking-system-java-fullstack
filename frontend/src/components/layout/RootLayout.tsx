import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Ticket, LogIn, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'

export default function RootLayout() {
  const { user, isAuthenticated, isOrganizer, isStaff, login, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const navLinks = [
    { to: ROUTES.HOME, label: 'Events', always: true },
    ...(isAuthenticated ? [{ to: ROUTES.MY_TICKETS, label: 'My Tickets', always: false }] : []),
    ...(isOrganizer ? [{ to: ROUTES.ORGANIZER_DASHBOARD, label: 'Organizer', always: false }] : []),
    ...(isStaff ? [{ to: ROUTES.STAFF_VALIDATE, label: 'Validate', always: false }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header
        className="sticky top-0 z-40 border-b border-[var(--border)]"
        style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center group-hover:bg-[var(--accent-hover)] transition-colors">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)] hidden sm:block">
              TicketHub
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)] border border-[rgba(124,58,237,0.3)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth controls */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)] max-w-[120px] truncate">
                    {user?.name || user?.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={login} className="hidden md:flex gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 pt-2 border-t border-[var(--border)]">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 w-full text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out ({user?.name})
                </button>
              ) : (
                <button
                  onClick={() => { login(); setMobileOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2.5 w-full text-sm text-[var(--text-primary)] bg-[var(--accent)] rounded-lg"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[var(--accent)] flex items-center justify-center">
              <Ticket className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-[var(--text-muted)]">TicketHub</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} TicketHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
