import { NavLink } from 'react-router-dom';
import {
  FileText,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/organizer/events', label: 'My Events', icon: FileText },
  { to: '/organizer/proposal-analyzer', label: 'Proposal Analyzer', icon: Sparkles },
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
        <main className="px-8 py-8">{children}</main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
