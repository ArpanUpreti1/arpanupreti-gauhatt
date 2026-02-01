import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart2,
  User,
  MessageSquare,
  Truck,
  LogOut
} from 'lucide-react';
import { clearAuthData } from '../../services/api';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const navItems = [
    { path: '/farmer', icon: LayoutDashboard, label: 'Home', end: true },
    { path: '/farmer/products', icon: Package, label: 'Products' },
    { path: '/farmer/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/farmer/inventory', icon: BarChart2, label: 'Inventory' }, // Swapped icon for variety
    { path: '/farmer/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/farmer/delivery', icon: Truck, label: 'Delivery' },
    { path: '/farmer/reviews', icon: MessageSquare, label: 'Reviews' },
    { path: '/farmer/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-emerald-900 min-h-screen fixed left-0 top-0 text-white flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-8">
        <h1 className="text-2xl font-bold font-serif tracking-wide">Gauhatt</h1>
        <p className="text-emerald-400 text-xs tracking-widest uppercase mt-1">Farmer Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20 translate-x-2'
                : 'text-emerald-100 hover:bg-emerald-800 hover:text-white hover:translate-x-1'
              }`
            }
          >
            <item.icon size={20} className="stroke-[1.5]" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl w-full transition-colors"
        >
          <LogOut size={20} className="stroke-[1.5]" />
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
