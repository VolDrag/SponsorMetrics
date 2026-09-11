import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  LayoutGrid,
  Search,
  Sparkles,
  Bell,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RateDealBanner from '../common/RateDealBanner';
import { notificationApi } from '../../services/platformApi';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const sponsorNavItems = [
    { name: 'Discovery', icon: Search, path: '/sponsor/discovery' },
    { name: 'Proposals', icon: FileText, path: '/sponsor/proposals' },
    { name: 'Portfolio', icon: Megaphone, path: '/sponsor/portfolio' },
    { name: 'Analytics', icon: BarChart2, path: '/sponsor/analytics' },
    { name: 'Experiments', icon: LayoutGrid, path: '/sponsor/experiments' },
    { name: 'Reports', icon: FileText, path: '/sponsor/reports' },
    { name: 'Contracts', icon: FileText, path: '/contracts' },
    { name: 'Workspace', icon: Users, path: '/workspace' },
    { name: 'Settings', icon: Settings, path: '/sponsor/settings' },
  ];

  const organizerNavItems = [
    { name: 'Event Hub', icon: LayoutDashboard, path: '/organizer/events' },
    { name: 'Proposals', icon: FileText, path: '/organizer/proposals' },
    { name: 'Status Tracker', icon: LayoutGrid, path: '/organizer/proposal-tracker' },
    { name: 'Proposal Analyzer', icon: Sparkles, path: '/organizer/proposal-analyzer' },
    { name: 'Analytics', icon: BarChart2, path: '/organizer/analytics' },
    { name: 'Contracts', icon: FileText, path: '/contracts' },
    { name: 'Workspace', icon: Users, path: '/workspace' },
  ];

  const adminNavItems = [
    { name: 'Admin', icon: Shield, path: '/admin' },
    { name: 'Contracts', icon: FileText, path: '/contracts' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'sponsor' ? sponsorNavItems : organizerNavItems;

  return (
    <div className="w-64 bg-[#1E2337] min-h-screen text-slate-300 flex flex-col fixed left-0 top-0 border-r-4 border-blue-500">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex flex-col">
          SponsorMetrics BD
          <span className="text-xs font-normal text-slate-400 mt-1">Enterprise Console</span>
        </h1>
      </div>

      <nav className="flex-1 mt-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center mx-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'hover:bg-[#2A3047] hover:text-white text-slate-300'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 opacity-75" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center text-sm font-medium hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 opacity-75" />
          Logout
        </button>
      </div>
    </div>
  );
};

const Topbar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState({ items: [], unread: 0 });
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1E2337&color=fff&length=1`;

  useEffect(() => {
    notificationApi.list().then((res) => setNotes(res.data.data || { items: [], unread: 0 })).catch(() => {});
  }, []);

  return (
    <div className="h-16 bg-white border-b flex items-center justify-end px-6 sticky top-0 z-10 ml-64">
      <div className="relative mr-4">
        <button type="button" onClick={() => setOpen((v) => !v)} className="relative text-slate-500">
          <Bell className="h-5 w-5" />
          {notes.unread > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1 text-[10px] text-white">{notes.unread}</span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white p-3 shadow-lg">
            <div className="mb-2 flex justify-between text-xs">
              <span className="font-semibold">Notifications</span>
              <button type="button" onClick={() => notificationApi.markRead().then(() => setNotes((n) => ({ ...n, unread: 0 })))}>Mark all read</button>
            </div>
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
              {(notes.items || []).slice(0, 8).map((item) => (
                <li key={item._id} className="border-b border-slate-100 pb-2 text-slate-700">{item.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-3 text-slate-500">
        {user?.orgVerified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">Verified</span>}
        <span className="text-sm font-medium text-slate-700">{user?.name || user?.organizationName}</span>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
          <img src={avatarUrl} alt="Avatar" />
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 ml-64 overflow-x-hidden">
          {/* ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START ===== */}
          <RateDealBanner />
          {/* ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END ===== */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
