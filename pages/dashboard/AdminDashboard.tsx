import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LogOut, Users, ShoppingBag, Package, TrendingUp, DollarSign, 
  Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart,
  RefreshCw, ChevronRight, Star, Truck, UserCheck, UserX, Eye,
  Calendar, Activity, Award, Layers, Search, Filter, Download,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { clearAuthData, getCurrentUser, AdminService, API_BASE_URL } from '../../services/api';
import { 
  AdminDashboardStats, AdminOrder, TopFarmer, TopProduct, 
  RevenueAnalytics, AdminUser, PagedResult 
} from '../../types';
import FarmerApproval from './admin/FarmerApproval';

type TabType = 'overview' | 'orders' | 'users' | 'farmers' | 'products' | 'analytics';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [topFarmers, setTopFarmers] = useState<TopFarmer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [allOrders, setAllOrders] = useState<PagedResult<AdminOrder> | null>(null);
  const [allUsers, setAllUsers] = useState<PagedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [userSearch, setUserSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, farmersRes, productsRes, analyticsRes] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getRecentOrders(5),
        AdminService.getTopFarmers(5),
        AdminService.getTopProducts(5),
        AdminService.getRevenueAnalytics(30)
      ]);

      if (statsRes.success) setStats(statsRes.data!);
      if (ordersRes.success) setRecentOrders(ordersRes.data!);
      if (farmersRes.success) setTopFarmers(farmersRes.data!);
      if (productsRes.success) setTopProducts(productsRes.data!);
      if (analyticsRes.success) setAnalytics(analyticsRes.data!);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await AdminService.getAllOrders(orderPage, 10, orderStatusFilter, orderSearch);
      if (res.success) setAllOrders(res.data!);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await AdminService.getAllUsers(userPage, 10, userRoleFilter, userSearch);
      if (res.success) setAllUsers(res.data!);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, orderPage, orderStatusFilter, orderSearch]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userPage, userRoleFilter, userSearch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const getRevenueChange = () => {
    if (!stats || stats.lastMonthRevenue === 0) return { value: 0, direction: 'neutral' };
    const change = ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100;
    return { 
      value: Math.abs(change).toFixed(1), 
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral' 
    };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'farmers', label: 'Farmer Approvals', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'products', label: 'Top Products', icon: <Package className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-4 h-4" /> },
  ];

  const revenueChange = getRevenueChange();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 rounded-xl">
              <Leaf size={22} fill="currentColor" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
              <span className="block text-xs text-primary-600 font-medium">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-primary-700">{user.username}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 
                       hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'farmers' && stats?.pendingFarmers ? (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {stats.pendingFarmers}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6 animate-fade-in">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Revenue */}
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="w-10 h-10 p-2 bg-white/20 rounded-xl" />
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${revenueChange.direction === 'up' ? 'bg-green-400/30' : 
                          revenueChange.direction === 'down' ? 'bg-red-400/30' : 'bg-white/20'}`}>
                        {revenueChange.direction === 'up' ? <ArrowUp className="w-3 h-3" /> :
                         revenueChange.direction === 'down' ? <ArrowDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {revenueChange.value}%
                      </div>
                    </div>
                    <p className="text-white/80 text-sm mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-white/60 text-xs mt-2">This month: {formatCurrency(stats.thisMonthRevenue)}</p>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <ShoppingBag className="w-10 h-10 p-2 bg-white/20 rounded-xl" />
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Today: {stats.todayOrders}</span>
                    </div>
                    <p className="text-white/80 text-sm mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                    <p className="text-white/60 text-xs mt-2">Pending: {stats.pendingOrders} | Processing: {stats.processingOrders}</p>
                  </div>

                  {/* Total Users */}
                  <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-10 h-10 p-2 bg-white/20 rounded-xl" />
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">New: {stats.todayNewUsers}</span>
                    </div>
                    <p className="text-white/80 text-sm mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-white/60 text-xs mt-2">Farmers: {stats.totalFarmers} | Consumers: {stats.totalConsumers}</p>
                  </div>

                  {/* Products */}
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <Package className="w-10 h-10 p-2 bg-white/20 rounded-xl" />
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Organic: {stats.organicProducts}</span>
                    </div>
                    <p className="text-white/80 text-sm mb-1">Total Products</p>
                    <p className="text-3xl font-bold">{stats.totalProducts.toLocaleString()}</p>
                    <p className="text-white/60 text-xs mt-2">Active: {stats.activeProducts} | Out of Stock: {stats.outOfStockProducts}</p>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingFarmers}</p>
                        <p className="text-xs text-gray-500">Pending Approvals</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                        <p className="text-xs text-gray-500">Completed Orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Layers className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalStories}</p>
                        <p className="text-xs text-gray-500">Farmer Stories</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Avg Rating ({stats.totalRatings})</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders & Top Farmers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary-500" />
                        Recent Orders
                      </h3>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {recentOrders.map(order => (
                        <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{order.consumerName}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Farmers */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Top Farmers
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {topFarmers.map((farmer, idx) => (
                        <div key={farmer.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                            ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{farmer.fullName || farmer.username}</p>
                            <p className="text-xs text-gray-500">{farmer.totalProducts} products • {farmer.totalOrders} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(farmer.totalRevenue)}</p>
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <Star className="w-3 h-3 fill-current" />
                              {farmer.averageRating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Top Selling Products
                    </h3>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {topProducts.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : 'https://via.placeholder.com/40'} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.farmerName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(product.price)}/{product.unit}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{product.totalSold}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{formatCurrency(product.totalRevenue)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1 text-amber-600">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by order number, customer..."
                        value={orderSearch}
                        onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allOrders?.items.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">#{order.orderNumber}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900">{order.consumerName}</p>
                            <p className="text-xs text-gray-500">{order.consumerEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.itemCount} items</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {allOrders && allOrders.totalPages > 1 && (
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {(orderPage - 1) * 10 + 1} to {Math.min(orderPage * 10, allOrders.totalCount)} of {allOrders.totalCount}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                        disabled={orderPage === 1}
                        className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setOrderPage(p => Math.min(allOrders.totalPages, p + 1))}
                        disabled={orderPage >= allOrders.totalPages}
                        className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by username, email..."
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Roles</option>
                      <option value="Consumer">Consumer</option>
                      <option value="Farmer">Farmer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allUsers?.items.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.username}</p>
                                {user.fullName && <p className="text-xs text-gray-500">{user.fullName}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'Farmer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${user.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                                user.approvalStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                user.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.approvalStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {allUsers && allUsers.totalPages > 1 && (
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {(userPage - 1) * 10 + 1} to {Math.min(userPage * 10, allUsers.totalCount)} of {allUsers.totalCount}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage === 1}
                        className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setUserPage(p => Math.min(allUsers.totalPages, p + 1))}
                        disabled={userPage >= allUsers.totalPages}
                        className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Farmer Approvals Tab */}
            {activeTab === 'farmers' && (
              <div className="animate-fade-in">
                <FarmerApproval />
              </div>
            )}

            {/* Top Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Top Selling Products
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topProducts.map((product, idx) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                              ${idx === 0 ? 'bg-amber-500 text-white' : 
                                idx === 1 ? 'bg-gray-400 text-white' : 
                                idx === 2 ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : 'https://via.placeholder.com/40'} 
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{product.category}</span>
                                  {product.isOrganic && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">Organic</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.farmerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(product.price)}/{product.unit}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">{product.totalSold}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{formatCurrency(product.totalRevenue)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1 text-amber-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-gray-400">({product.ratingCount})</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-8 h-8 p-1.5 bg-green-100 text-green-600 rounded-lg" />
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue (30 days)</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingBag className="w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg" />
                      <div>
                        <p className="text-sm text-gray-500">Total Orders (30 days)</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-8 h-8 p-1.5 bg-purple-100 text-purple-600 rounded-lg" />
                      <div>
                        <p className="text-sm text-gray-500">Avg Order Value</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Revenue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary-500" />
                    Revenue by Category
                  </h3>
                  <div className="space-y-3">
                    {analytics.categoryRevenue.map((cat, idx) => {
                      const maxRevenue = Math.max(...analytics.categoryRevenue.map(c => c.revenue));
                      const percentage = (cat.revenue / maxRevenue) * 100;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                      return (
                        <div key={cat.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                            <span className="text-sm text-gray-500">{formatCurrency(cat.revenue)} ({cat.orderCount} orders)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Revenue Chart (Simple Text View) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-500" />
                    Daily Revenue (Last 30 Days)
                  </h3>
                  <div className="overflow-x-auto">
                    <div className="flex gap-1 min-w-max pb-2">
                      {analytics.dailyRevenue.map((day, idx) => {
                        const maxRevenue = Math.max(...analytics.dailyRevenue.map(d => d.revenue));
                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1" title={`${day.date}: ${formatCurrency(day.revenue)}`}>
                            <div className="w-6 bg-gray-100 rounded-t-sm relative" style={{ height: '80px' }}>
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-primary-500 rounded-t-sm transition-all duration-300"
                                style={{ height: `${height}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 transform -rotate-45 origin-top-left whitespace-nowrap">
                              {new Date(day.date).getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
