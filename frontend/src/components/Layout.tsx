import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './ui/Sidebar';
import { Avatar } from './ui/Avatar';
import {
  HomeIcon,
  VideoCameraIcon,
  FolderIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-edubites-primary rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">KS</span>
    </div>
    <span className="font-bold text-gray-900">Knowledge Shadows</span>
  </div>
);

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      href: '/',
      active: location.pathname === '/',
    },
    {
      id: 'shadows',
      label: 'My Shadows',
      icon: <VideoCameraIcon className="w-5 h-5" />,
      href: '/shadows',
      active: location.pathname.startsWith('/shadows'),
      badge: 3,
    },
    {
      id: 'library',
      label: 'Library',
      icon: <FolderIcon className="w-5 h-5" />,
      href: '/library',
      active: location.pathname === '/library',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <ChartBarIcon className="w-5 h-5" />,
      href: '/analytics',
      active: location.pathname === '/analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      href: '/settings',
      active: location.pathname === '/settings',
    },
  ];

  const handleSidebarClick = (item: { href?: string }) => {
    if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <div className="flex h-screen bg-edubites-background">
      {/* Sidebar */}
      <Sidebar
        header={<Logo />}
        items={sidebarItems}
        onItemClick={handleSidebarClick}
        footer={
          <div className="flex items-center gap-3">
            <Avatar alt={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shadows, chapters, decision points..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-edubites-primary focus:ring-2 focus:ring-edubites-primary/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 ml-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

Layout.displayName = 'Layout';
