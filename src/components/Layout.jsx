import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  LogOut, 
  User, 
  Settings, 
  FolderKanban, 
  ShieldCheck, 
  Gavel, 
  Sun, 
  Moon, 
  Menu, 
  X 
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
    <span>{label}</span>
  </Link>
);

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#030712] font-sans overflow-hidden transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col z-40 transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <Gavel className="w-8 h-8 rotate-12" />
            <span className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">BidMaster</span>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={closeSidebar}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Items (Role-Based) */}
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          <span className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Menu</span>
          
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            to="/dashboard" 
            active={location.pathname === '/dashboard'} 
            onClick={closeSidebar}
          />
          
          {/* Administrator & Procurement Officer: Manage Projects */}
          {(currentUser?.role === 'Administrator' || currentUser?.role === 'Procurement Officer') && (
            <SidebarItem 
              icon={FolderKanban} 
              label="Manage Projects" 
              to="/projects/new" 
              active={location.pathname === '/projects/new'} 
              onClick={closeSidebar}
            />
          )}

          {/* Contractors: Submit a Bid */}
          {currentUser?.role === 'Contractor' && (
            <SidebarItem 
              icon={Gavel} 
              label="Submit a Bid" 
              to="/bids/new" 
              active={location.pathname === '/bids/new'} 
              onClick={closeSidebar}
            />
          )}

          {/* Engineer & Procurement Officer & Admin: Evaluation view */}
          {(currentUser?.role === 'Engineer' || currentUser?.role === 'Procurement Officer' || currentUser?.role === 'Administrator') && (
            <SidebarItem 
              icon={ShieldCheck} 
              label="Evaluate Bids" 
              to="/bids/new" 
              active={location.pathname === '/bids/new'} 
              onClick={closeSidebar}
            />
          )}

          <span className="px-4 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Account</span>

          <SidebarItem 
            icon={User} 
            label="My Profile" 
            to="/profile" 
            active={location.pathname === '/profile'} 
            onClick={closeSidebar}
          />

          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            to="/settings" 
            active={location.pathname === '/settings'} 
            onClick={closeSidebar}
          />
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner">
              {getInitials(currentUser?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{currentUser?.role || 'Guest'}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center transition-colors">
          <div className="flex items-center">
            {/* Hamburger Button for mobile */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 mr-3 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 md:hidden transition-colors"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
              {location.pathname.split('/').filter(name => name !== 'dashboard' && name !== '').join(' ') || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 capitalize">
              {currentUser?.role}
            </span>
          </div>
        </header>

        {/* Scrollable page body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
