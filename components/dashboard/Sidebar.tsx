import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BookOpen,
  Settings,
  LogOut,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { clearAuthData, getCurrentUser } from '../../services/api';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const mainNavItems = [
    { path: '/farmer', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/farmer/products', icon: Package, label: 'My Products' },
    { path: '/farmer/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/farmer/stories', icon: BookOpen, label: 'Stories' },
  ];

  return (
    <div className="w-64 bg-white min-h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/farmer')}>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-105">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">GAUHATT</h1>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainNavItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                
                <item.icon 
                  size={20} 
                  className={`transition-all duration-300 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                />
                <span className="font-medium text-sm flex-1">{item.label}</span>
                
                {/* Hover arrow */}
                <ChevronRight 
                  size={16} 
                  className={`transition-all duration-300 ${isActive ? 'opacity-100 text-green-500' : 'opacity-0 group-hover:opacity-50 translate-x-1 group-hover:translate-x-0'}`} 
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 space-y-1">
        <NavLink
          to="/farmer/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`
          }
        >
          <Settings size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors group-hover:rotate-90 duration-500" />
          <span className="font-medium text-sm">Settings</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl w-full transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>

      {/* User Card */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
            {user?.username?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || 'Farmer'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.farmName || 'Farm Owner'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
