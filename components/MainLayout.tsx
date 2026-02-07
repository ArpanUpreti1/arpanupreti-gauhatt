import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ShoppingCart, 
  Home as HomeIcon, 
  Compass, 
  ShoppingBag, 
  Leaf,
  Cake,
  Palette,
  ChefHat,
  Flower2,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Apple,
  Milk,
  Package,
  Check,
  CheckCheck
} from 'lucide-react';
import { NotificationService } from '../services/api';
import { Notification } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
}

// ============ SIDEBAR NAV ITEM WITH MICRO-INTERACTIONS ============
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ icon, label, active, onClick, badge }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                 transition-all duration-300 ease-out group
                 ${active 
                   ? 'bg-primary-50 text-primary-600 shadow-sm' 
                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
    >
      <span className={`transition-transform duration-300 ${isHovered && !active ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span className={`transition-all duration-200 ${isHovered ? 'translate-x-0.5' : ''}`}>
        {label}
      </span>
      
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full
                        animate-scale-in" />
      )}
      
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full
                        animate-pulse-soft">
          {badge}
        </span>
      )}
      
      {/* Hover glow effect */}
      <span className={`absolute inset-0 rounded-xl bg-primary-500/5 opacity-0 transition-opacity duration-300
                       ${isHovered && !active ? 'opacity-100' : ''}`} />
    </button>
  );
};

// ============ CATEGORY ITEM WITH ANIMATIONS ============
const CategoryItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  delay?: number;
}> = ({ icon, label, onClick, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 
                hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent hover:text-primary-700 
                rounded-lg transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`text-gray-400 group-hover:text-primary-500 transition-all duration-300
                       ${isHovered ? 'scale-110 rotate-6' : ''}`}>
        {icon}
      </span>
      <span className={`transition-all duration-200 ${isHovered ? 'translate-x-1 font-medium' : ''}`}>
        {label}
      </span>
    </button>
  );
};

// ============ MAIN LAYOUT COMPONENT ============
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoadingNotifications(true);
      const response = await NotificationService.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await NotificationService.getUnreadCount();
      if (response.success && response.data !== undefined) {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on user change and open
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Listen for notification read events from other pages
      const handleNotificationRead = () => fetchUnreadCount();
      window.addEventListener('notificationRead', handleNotificationRead);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationRead', handleNotificationRead);
      };
    }
  }, [user]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (notificationOpen && user) {
      fetchNotifications();
    }
  }, [notificationOpen, user]);

  useEffect(() => {
    // Load user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load cart count
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((total: number, item: any) => total + item.quantity, 0));
    };
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    
    // Scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  // Real categories from backend
  const categories = [
    { icon: <Apple className="w-4 h-4" />, label: 'Vegetables', value: 'Vegetables' },
    { icon: <Milk className="w-4 h-4" />, label: 'Dairy & Eggs', value: 'Dairy & Eggs' },
    { icon: <Leaf className="w-4 h-4" />, label: 'Fruits', value: 'Fruits' },
    { icon: <Cake className="w-4 h-4" />, label: 'Baked Goods', value: 'Baked Goods' },
    { icon: <Package className="w-4 h-4" />, label: 'Pantry', value: 'Pantry' },
    { icon: <Palette className="w-4 h-4" />, label: 'Handmade Crafts', value: 'Handmade Crafts' },
    { icon: <ChefHat className="w-4 h-4" />, label: 'Cooking Essentials', value: 'Cooking Essentials' },
    { icon: <Flower2 className="w-4 h-4" />, label: 'Floral & Plants', value: 'Floral & Plants' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============ TOP NAVBAR ============ */}
      <header 
        className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-500
                   ${scrolled 
                     ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100/50' 
                     : 'bg-white border-b border-gray-100'}`}
      >
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Logo with animation */}
          <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
            onClick={() => navigate('/home')}
          >
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white
                          shadow-lg shadow-primary-500/30 transition-all duration-300 
                          group-hover:shadow-primary-500/50 group-hover:scale-105 group-hover:rotate-3">
              <Leaf size={18} fill="currentColor" className="transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold text-primary-500 hidden sm:block transition-colors duration-300
                           group-hover:text-primary-600">
              GAUHATT
            </span>
          </div>

          {/* Search Bar with animations */}
          <form 
            onSubmit={handleSearch}
            className="flex-1 max-w-xl mx-4 hidden md:block"
          >
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300
                               ${isSearchFocused ? 'text-primary-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search for local products or shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full pl-11 pr-4 py-2.5 rounded-full border bg-gray-50
                         text-sm placeholder-gray-400 transition-all duration-300
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         focus:bg-white focus:shadow-lg focus:shadow-primary-500/10
                         ${isSearchFocused ? 'border-primary-300' : 'border-gray-200'}`}
              />
              {/* Search pulse effect when focused */}
              {isSearchFocused && (
                <span className="absolute inset-0 rounded-full border-2 border-primary-400/30 animate-ping pointer-events-none" />
              )}
            </div>
          </form>

          {/* Right Icons with micro-interactions */}
          <div className="flex items-center gap-1">
            {/* Notification Bell with Dropdown */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 
                           rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                  <Bell className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  {/* Notification count badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs 
                                   font-bold rounded-full flex items-center justify-center
                                   animate-pulse shadow-lg">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 
                                overflow-hidden z-50 animate-fade-in-down">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-white border-b border-gray-100
                                  flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium
                                   flex items-center gap-1 hover:underline"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-8 text-center text-gray-400">
                          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent 
                                        rounded-full mx-auto mb-2"></div>
                          Loading...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (!notification.isRead) {
                                handleMarkAsRead(notification.id);
                              }
                              // Navigate to orders if it's an order notification
                              if (notification.relatedEntityType === 'Order') {
                                navigate('/orders');
                                setNotificationOpen(false);
                              }
                            }}
                            className={`px-4 py-3 border-b border-gray-50 cursor-pointer
                                      transition-all duration-200 hover:bg-gray-50
                                      ${!notification.isRead ? 'bg-primary-50/50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Notification icon */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                            ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                              notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                              'bg-gray-100 text-gray-600'}`}>
                                {notification.type === 'order' ? (
                                  <ShoppingBag className="w-5 h-5" />
                                ) : (
                                  <Bell className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium text-gray-800 ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {/* Unread dot */}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                        <button 
                          onClick={() => {
                            navigate('/notifications');
                            setNotificationOpen(false);
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <button 
              onClick={() => navigate('/cart')}
              className="relative p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 
                       rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group"
            >
              <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:rotate-[-12deg]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs 
                               font-bold rounded-full flex items-center justify-center
                               animate-bounce-subtle shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 
                              flex items-center justify-center overflow-hidden cursor-pointer
                              transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-500/30
                              ring-2 ring-white">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="ml-2 px-5 py-2 bg-primary-500 text-white rounded-full text-sm font-medium
                         shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:shadow-primary-500/40
                         transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                       rounded-full transition-all duration-300 ml-1"
            >
              <div className="relative w-5 h-5">
                <Menu className={`w-5 h-5 absolute transition-all duration-300 
                               ${mobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                <X className={`w-5 h-5 absolute transition-all duration-300 
                            ${mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className={`md:hidden px-4 pb-3 bg-white border-b border-gray-100 transition-all duration-300
                        ${scrolled ? 'shadow-sm' : ''}`}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for local products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                         transition-all duration-300"
              />
            </div>
          </form>
        </div>
      </header>

      <div className="flex pt-16 md:pt-16">
        {/* ============ LEFT SIDEBAR ============ */}
        <aside 
          className={`fixed lg:sticky top-16 md:top-16 left-0 w-72 h-[calc(100vh-4rem)] bg-white border-r border-gray-100
                     overflow-y-auto flex-shrink-0 z-40 transition-all duration-500 ease-out
                     ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <NavItem
                icon={<HomeIcon className="w-5 h-5" />}
                label="Home"
                active={isActive('/home')}
                onClick={() => { navigate('/home'); setMobileMenuOpen(false); }}
              />
              <NavItem
                icon={<Compass className="w-5 h-5" />}
                label="Explore"
                active={isActive('/products')}
                onClick={() => { navigate('/products'); setMobileMenuOpen(false); }}
              />
              <NavItem
                icon={<ShoppingBag className="w-5 h-5" />}
                label="My Orders"
                active={isActive('/orders')}
                onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}
              />
              <NavItem
                icon={<ShoppingCart className="w-5 h-5" />}
                label="Cart"
                active={isActive('/cart')}
                onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }}
                badge={cartCount}
              />
              <NavItem
                icon={<Bell className="w-5 h-5" />}
                label="Notifications"
                active={isActive('/notifications')}
                onClick={() => { navigate('/notifications'); setMobileMenuOpen(false); }}
                badge={unreadCount}
              />
            </div>

            {/* Divider with animation */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
            </div>

            {/* Browse Categories */}
            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3
                           flex items-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-primary-300 to-transparent" />
                Browse Categories
              </h3>
              <div className="space-y-0.5">
                {categories.map((cat, index) => (
                  <CategoryItem
                    key={cat.label}
                    icon={cat.icon}
                    label={cat.label}
                    delay={index * 30}
                    onClick={() => { 
                      navigate(`/products?category=${encodeURIComponent(cat.value)}`); 
                      setMobileMenuOpen(false); 
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50/50 rounded-xl p-3">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-900
                         hover:text-primary-600 transition-colors duration-200"
              >
                <span>Filters</span>
                <span className={`transition-transform duration-300 ${filtersExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              
              <div className={`overflow-hidden transition-all duration-500 ease-out
                            ${filtersExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-2 py-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Delivery Radius</span>
                      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        {deliveryRadius} km
                      </span>
                    </div>
                    <div className="relative group">
                      <input
                        type="range"
                        min={5}
                        max={50}
                        step={5}
                        value={deliveryRadius}
                        onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer
                                 transition-all duration-300 group-hover:h-2.5
                                 [&::-webkit-slider-thumb]:appearance-none 
                                 [&::-webkit-slider-thumb]:w-5 
                                 [&::-webkit-slider-thumb]:h-5 
                                 [&::-webkit-slider-thumb]:bg-primary-500 
                                 [&::-webkit-slider-thumb]:rounded-full 
                                 [&::-webkit-slider-thumb]:cursor-pointer
                                 [&::-webkit-slider-thumb]:shadow-lg
                                 [&::-webkit-slider-thumb]:shadow-primary-500/30
                                 [&::-webkit-slider-thumb]:transition-all
                                 [&::-webkit-slider-thumb]:duration-300
                                 [&::-webkit-slider-thumb]:hover:scale-125
                                 [&::-webkit-slider-thumb]:active:scale-110"
                        style={{
                          background: `linear-gradient(to right, #4c9a2a ${((deliveryRadius - 5) / 45) * 100}%, #e5e7eb ${((deliveryRadius - 5) / 45) * 100}%)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>5 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            {user && (
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600
                           hover:bg-red-50 rounded-xl transition-all duration-300 group"
                >
                  <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Overlay with fade animation */}
        <div 
          className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300
                     ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
