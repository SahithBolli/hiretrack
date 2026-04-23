import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Shield, Zap, BarChart3 } from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/applications',label: 'Applications', icon: Briefcase },
  { to: '/sponsor',     label: 'Sponsor Check',icon: Shield },
  { to: '/score',       label: 'Score a Job',  icon: Zap },
  { to: '/analytics',   label: 'Analytics',    icon: BarChart3 },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">H</div>
            <span className="font-bold text-white text-base tracking-tight">HireTrack</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">STEM OPT · Job Engine</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-slate-600 text-xs">Sahith Bolli</p>
          <p className="text-slate-700 text-xs">STEM OPT · Atlanta, GA</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
