import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  BookOpen,
  Settings,
  LogOut,
  Leaf,
  ChevronRight,
  Bell,
  CheckCheck,
  Star,
  BarChart3,
} from 'lucide-react';
import { clearAuthData, getCurrentUser, NotificationService, OrderService } from '../../services/api';
import { FarmerOrder, Notification } from '../../types';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [reviewNotifications, setReviewNotifications] = useState<Notification[]>([]);
  const [reviewUnreadCount, setReviewUnreadCount] = useState(0);
  const [reviewNotificationOpen, setReviewNotificationOpen] = useState(false);
  const [loadingReviewNotifications, setLoadingReviewNotifications] = useState(false);
  const reviewNotificationRef = useRef<HTMLDivElement>(null);

  const farmerOrdersSeenKey = useMemo(() => {
    if (!user?.id) return null;
    return `farmerOrdersLastSeenAt_${user.id}`;
  }, [user?.id]);

  const getOrderTime = (order: FarmerOrder): number => {
    const parsed = new Date(order.orderDate).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const markOrdersAsSeen = () => {
    if (!farmerOrdersSeenKey) return;
    sessionStorage.setItem(farmerOrdersSeenKey, String(Date.now()));
    setNewOrdersCount(0);
  };

  const ensureSeenKeyInitialized = (orders: FarmerOrder[]): number => {
    if (!farmerOrdersSeenKey) return Date.now();

    const stored = sessionStorage.getItem(farmerOrdersSeenKey);
    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    // Initialize with latest known order time so existing history is not treated as new.
    const latestOrderTime = orders.reduce((max, order) => Math.max(max, getOrderTime(order)), 0);
    const initialSeenAt = latestOrderTime || Date.now();
    sessionStorage.setItem(farmerOrdersSeenKey, String(initialSeenAt));
    return initialSeenAt;
  };

  const refreshNewOrdersCount = async () => {
    if (!user || user.role !== 'Farmer') return;
    if (location.pathname.startsWith('/farmer/orders')) {
      setNewOrdersCount(0);
      return;
    }

    try {
      const response = await OrderService.getFarmerOrders();
      const orders = response.success && response.data ? response.data : [];
      const seenAt = ensureSeenKeyInitialized(orders);
      const count = orders.filter((order) => getOrderTime(order) > seenAt).length;
      setNewOrdersCount(count);
    } catch {
      // Keep previous badge count on transient failures.
    }
  };

  const filterReviewNotifications = (notifications: Notification[]) => {
    return notifications.filter((notification) =>
      notification.type === 'review' || notification.relatedEntityType === 'ProductRating'
    );
  };

  const refreshReviewNotifications = async () => {
    if (!user || user.role !== 'Farmer') return;

    try {
      setLoadingReviewNotifications(true);
      const response = await NotificationService.getNotifications(1, 30);
      if (response.success && response.data) {
        const reviewItems = filterReviewNotifications(response.data.notifications || []);
        setReviewNotifications(reviewItems);
        setReviewUnreadCount(reviewItems.filter((notification) => !notification.isRead).length);
      }
    } catch {
      // Keep existing notification state on transient API failures.
    } finally {
      setLoadingReviewNotifications(false);
    }
  };

  const handleMarkReviewAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setReviewNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setReviewUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore failures so UI remains responsive.
    }
  };

  const handleMarkAllReviewAsRead = async () => {
    const unreadReviewIds = reviewNotifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);

    if (unreadReviewIds.length === 0) return;

    try {
      await Promise.all(unreadReviewIds.map((id) => NotificationService.markAsRead(id)));
      setReviewNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
      setReviewUnreadCount(0);
    } catch {
      // Ignore failures so UI remains responsive.
    }
  };

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  useEffect(() => {
    if (location.pathname.startsWith('/farmer/orders')) {
      markOrdersAsSeen();
      return;
    }

    refreshNewOrdersCount();

    // Poll periodically so farmers notice incoming orders while on dashboard pages.
    const interval = setInterval(refreshNewOrdersCount, 30000);
    const handleFocus = () => refreshNewOrdersCount();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshNewOrdersCount();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [location.pathname, farmerOrdersSeenKey]);

  useEffect(() => {
    if (!user || user.role !== 'Farmer') return;

    refreshReviewNotifications();
    const interval = setInterval(refreshReviewNotifications, 30000);

    const handleFocus = () => refreshReviewNotifications();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshReviewNotifications();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!reviewNotificationOpen) return;
    refreshReviewNotifications();
  }, [reviewNotificationOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reviewNotificationRef.current && !reviewNotificationRef.current.contains(event.target as Node)) {
        setReviewNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainNavItems = [
    { path: '/farmer', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/farmer/products', icon: Package, label: 'My Products' },
    { path: '/farmer/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/farmer/delivery-info', icon: Truck, label: 'Delivery Info' },
    { path: '/farmer/demand', icon: BarChart3, label: 'Demand Prediction' },
    { path: '/farmer/stories', icon: BookOpen, label: 'Stories' },
  ];

  return (
    <div className="w-64 bg-white min-h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/farmer')}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-all duration-300 group-hover:scale-105">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">GAUHATT</h1>
            </div>
          </div>

          <div className="relative" ref={reviewNotificationRef}>
            <button
              onClick={() => setReviewNotificationOpen((prev) => !prev)}
              className="relative p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200"
              title="Product review notifications"
            >
              <Bell size={18} />
              {reviewUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[11px] font-semibold rounded-full flex items-center justify-center animate-pulse">
                  {reviewUnreadCount > 99 ? '99+' : reviewUnreadCount}
                </span>
              )}
            </button>

            {reviewNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 bg-green-50/70 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">Product Reviews</p>
                  {reviewUnreadCount > 0 && (
                    <button
                      onClick={handleMarkAllReviewAsRead}
                      className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingReviewNotifications ? (
                    <div className="p-6 text-sm text-gray-500 text-center">Loading reviews...</div>
                  ) : reviewNotifications.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500 text-center">No product review notifications yet</div>
                  ) : (
                    reviewNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkReviewAsRead(notification.id);
                          }
                          navigate('/farmer/products');
                          setReviewNotificationOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          notification.isRead ? 'bg-white' : 'bg-green-50/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center flex-shrink-0">
                            <Star size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm text-gray-800 ${notification.isRead ? 'font-medium' : 'font-semibold'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-3">{notification.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
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

                {item.path === '/farmer/orders' && newOrdersCount > 0 && (
                  <span className="mr-1 inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-semibold animate-pulse">
                    {newOrdersCount > 99 ? '99+' : newOrdersCount}
                  </span>
                )}
                
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
