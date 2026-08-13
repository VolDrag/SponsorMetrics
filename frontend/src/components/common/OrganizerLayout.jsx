import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Megaphone,
  BarChart3,
  FileText,
  Settings,
  Search,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/organizer', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organizer/marketplace', label: 'Marketplace', icon: Store },
  { to: '/organizer/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/organizer/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/organizer/events', label: 'Proposals', icon: FileText },
  { to: '/organizer/proposal-analyzer', label: 'Proposal Analyzer', icon: Sparkles },
  { to: '/organizer/settings', label: 'Settings', icon: Settings },
];

const OrganizerLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F7F7FB]">
      <aside className="flex w-64 flex-col bg-navy-950 px-4 py-6">
        <div className="mb-8 px-2">
          <h1 className="font-display text-xl font-bold text-gold-50">
            SponsorMetrics <span className="text-gold-500">BD</span>
          </h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Enterprise Console
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-900 text-gold-500'
                    : 'text-slate-400 hover:bg-navy-900/60 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex max-w-md items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search proposals..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </header>

        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
};

export default OrganizerLayout;