import  { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Clipboard, Settings, FileText, Activity, HelpCircle, User, X, Calendar, Bell } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { userProfile } = useAuth();
  const location = useLocation();
  
  // Define navigation based on user role
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      roles: ['admin', 'receptionist', 'doctor', 'nurse', 'patient'] 
    },
    { 
      name: 'Patients', 
      href: '/patients', 
      icon: Users, 
      roles: ['admin', 'receptionist', 'doctor', 'nurse'] 
    },
    { 
      name: 'Appointments', 
      href: '/appointments', 
      icon: Calendar, 
      roles: ['admin', 'receptionist', 'doctor', 'nurse', 'patient'] 
    },
    { 
      name: 'Services', 
      href: '/services', 
      icon: Clipboard, 
      roles: ['admin'] 
    },
    { 
      name: 'Staff', 
      href: '/staff', 
      icon: User, 
      roles: ['admin'] 
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: FileText, 
      roles: ['admin'] 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: Activity, 
      roles: ['admin'] 
    },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: Bell, 
      roles: ['admin', 'receptionist', 'doctor', 'nurse', 'patient'] 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings, 
      roles: ['admin', 'receptionist', 'doctor', 'nurse', 'patient'] 
    },
  ];
  
  // Filter navigation based on user role
  const filteredNavigation = userProfile 
    ? navigation.filter(item => item.roles.includes(userProfile.role))
    : [];
  
  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 flex z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`fixed inset-0 bg-secondary-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-primary-700 transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <h1 className="ml-2 text-2xl font-bold text-white">PatientFlow</h1>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const current = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      current
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-600'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        current ? 'text-white' : 'text-primary-300 group-hover:text-white'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
            <Link
              to="/support"
              className="flex-shrink-0 group block"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center">
                <div className="ml-3 flex items-center">
                  <HelpCircle className="h-5 w-5 text-primary-300 mr-2" />
                  <p className="text-base font-medium text-white">Help & Support</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-700">
              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <h1 className="ml-2 text-xl font-bold text-white">PatientFlow</h1>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-primary-700 space-y-1">
                {filteredNavigation.map((item) => {
                  const current = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        current
                          ? 'bg-primary-800 text-white'
                          : 'text-primary-100 hover:bg-primary-600'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          current ? 'text-white' : 'text-primary-300 group-hover:text-white'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-primary-800 p-4 bg-primary-700">
              <Link
                to="/support"
                className="flex-shrink-0 w-full group block flex items-center"
              >
                <HelpCircle className="h-5 w-5 text-primary-300 mr-3" />
                <p className="text-sm font-medium text-white">Help & Support</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
 