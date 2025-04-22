import  { useAuth } from '../contexts/AuthContext';
import { Bell, User, Menu, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { userProfile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-secondary-500 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <h1 className="ml-2 text-xl font-bold text-primary-600">PatientFlow</h1>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-4" ref={notificationRef}>
              <button
                type="button"
                className="p-1 rounded-full text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-secondary-200">
                    <h3 className="text-sm font-medium text-secondary-900">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-secondary-50 cursor-pointer">
                      <p className="text-sm font-medium text-secondary-900">New patient registered</p>
                      <p className="text-xs text-secondary-500">5 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-secondary-50 cursor-pointer">
                      <p className="text-sm font-medium text-secondary-900">Critical patient status update</p>
                      <p className="text-xs text-secondary-500">1 hour ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-secondary-50 cursor-pointer">
                      <p className="text-sm font-medium text-secondary-900">Service assignment complete</p>
                      <p className="text-xs text-secondary-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="border-t border-secondary-200 px-4 py-2">
                    <Link to="/notifications" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={userMenuRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-secondary-700 hidden md:block">
                    {userProfile?.name || 'User'}
                  </span>
                </button>
              </div>
              
              {userMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="block px-4 py-2 text-sm text-secondary-700 border-b border-secondary-200">
                    <div>{userProfile?.name}</div>
                    <div className="text-xs text-secondary-500 capitalize">{userProfile?.role}</div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    role="menuitem"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 flex items-center"
                    role="menuitem"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
 