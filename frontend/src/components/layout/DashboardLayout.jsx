import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Megaphone,
  BarChart2,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  MessageSquare,
  LayoutGrid,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sponsorNavItems = [
    { name: 'Discovery', icon: Search, path: '/sponsor/discovery' },
    { name: 'Marketplace', icon: Store, path: '/marketplace' },
    { name: 'Campaigns', icon: Megaphone, path: '/campaigns' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Proposals', icon: FileText, path: '/proposals' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const organizerNavItems = [
    { name: 'Event Hub', icon: LayoutDashboard, path: '/organizer/events' },
    { name: 'Marketplace', icon: Store, path: '/marketplace' },
    { name: 'Campaigns', icon: Megaphone, path: '/campaigns' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Proposals', icon: FileText, path: '/proposals' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const navItems = user?.role === 'sponsor' ? sponsorNavItems : organizerNavItems;

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
      <div className="px-6 pb-6 pt-2 space-y-4">
        <button className="flex items-center text-sm font-medium hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5 mr-3 opacity-75" />
          Help Center
        </button>
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
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1E2337&color=fff&length=1`;

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10 ml-64">
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search deals, contracts, or partners..."
          className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
        />
      </div>
      <div className="flex items-center space-x-6 text-slate-500">
        <button className="hover:text-slate-800 transition-colors"><Bell className="w-5 h-5" /></button>
        <button className="hover:text-slate-800 transition-colors"><MessageSquare className="w-5 h-5" /></button>
        <button className="hover:text-slate-800 transition-colors"><LayoutGrid className="w-5 h-5" /></button>
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
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
