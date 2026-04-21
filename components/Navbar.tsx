import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Home, ShoppingBag, ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { clearAuthData, getCurrentUser } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  cartItemCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for logged in user
    setUser(getCurrentUser());

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get cart count from localStorage
  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total: number, item: any) => total + item.quantity, 0);
  };

  const [localCartCount, setLocalCartCount] = useState(getCartCount());

  useEffect(() => {
    // Listen for cart updates
    const handleStorageChange = () => {
      setLocalCartCount(getCartCount());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const displayCartCount = cartItemCount || localCartCount;

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/home', icon: Home },
    { name: t('nav.products', 'Products'), path: '/products', icon: ShoppingBag },
    { name: t('nav.cart', 'Cart'), path: '/cart', icon: ShoppingCart, badge: displayCartCount },
  ];

  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home' || location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 
                 ${isScrolled 
                   ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
                   : 'bg-white/90 backdrop-blur-md border-b border-gray-100'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-9 h-9 bg-primary-500 flex items-center justify-center text-white 
                          shadow-lg shadow-primary-500/30 transition-transform duration-300 
                          group-hover:scale-105 group-hover:rotate-3">
              <Leaf size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-serif font-bold text-gray-900 tracking-tight">
              GAUHATT
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             transition-all duration-200 group
                             ${active 
                               ? 'text-primary-600 bg-primary-50' 
                               : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 
                                  ${active ? 'text-primary-500' : ''}`} />
                  <span>{link.name}</span>
                  
                  {/* Cart Badge */}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs 
                                   font-bold rounded-full flex items-center justify-center
                                   animate-scale-in shadow-lg">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg
                           transition-all duration-200"
                  title={t('auth.logout', 'Logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium
                         shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:shadow-primary-500/30
                         transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                {t('auth.signIn', 'Sign In')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                      rounded-lg transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out
                     ${isMobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="py-4 space-y-2 border-t border-gray-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                             transition-all duration-200
                             ${active 
                               ? 'text-primary-600 bg-primary-50' 
                               : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary-500' : ''}`} />
                  <span>{link.name}</span>
                  
                  {/* Cart Badge */}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs 
                                   font-bold rounded-full flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Mobile User Section */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg text-sm font-medium
                           transition-all duration-200 active:scale-95"
                >
                  {t('auth.signIn', 'Sign In')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
