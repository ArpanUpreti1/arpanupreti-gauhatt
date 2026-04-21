import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, LogOut, Users, ShoppingBag, Package, TrendingUp, DollarSign, 
  Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart,
  RefreshCw, ChevronRight, Star, Truck, UserCheck, UserX, Eye,
  Calendar, Activity, Award, Layers, Search, Filter, Download,
  ArrowUp, ArrowDown, Minus, AlertOctagon, Zap, Target, Hash,
  ShoppingCart, UserPlus, Box, Percent
} from 'lucide-react';
import { clearAuthData, getCurrentUser, AdminService, API_BASE_URL } from '../../services/api';
import { 
  AdminDashboardStats, AdminOrder, TopFarmer, TopProduct, 
  RevenueAnalytics, AdminUser, PagedResult, GrowthAnalytics, PlatformHealth
} from '../../types';
import FarmerApproval from './admin/FarmerApproval';
import { useLanguage } from '../../contexts/LanguageContext';

type TabType = 'overview' | 'orders' | 'users' | 'farmers' | 'products' | 'analytics';

type TrendChartPoint = {
  label: string;
  value: number;
  hint?: string;
};

interface SimpleTrendChartProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'orange';
  points: TrendChartPoint[];
  valueFormatter: (value: number) => string;
}

const SimpleTrendChart: React.FC<SimpleTrendChartProps> = ({
  title,
  subtitle,
  icon,
  color,
  points,
  valueFormatter,
}) => {
  const palette = {
    green: {
      line: '#16a34a',
      fill: '#dcfce7',
      dot: '#166534',
      text: 'text-green-700',
      chip: 'bg-green-50 text-green-700 border-green-200',
    },
    blue: {
      line: '#2563eb',
      fill: '#dbeafe',
      dot: '#1d4ed8',
      text: 'text-blue-700',
      chip: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    purple: {
      line: '#9333ea',
      fill: '#f3e8ff',
      dot: '#7e22ce',
      text: 'text-purple-700',
      chip: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    orange: {
      line: '#ea580c',
      fill: '#ffedd5',
      dot: '#c2410c',
      text: 'text-orange-700',
      chip: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  }[color];

  if (points.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
        <p className="text-sm text-gray-400 text-center py-10">No data available for this period.</p>
      </div>
    );
  }

  const width = 720;
  const height = 230;
  const padding = { top: 18, right: 16, bottom: 42, left: 54 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = points.map((p) => p.value);
  const maxValue = Math.max(...values, 1);
  const totalValue = values.reduce((sum, value) => sum + value, 0);
  const avgValue = totalValue / points.length;
  const peakValue = Math.max(...values);

  const getX = (index: number) =>
    padding.left + (index / Math.max(points.length - 1, 1)) * innerWidth;
  const getY = (value: number) =>
    padding.top + innerHeight - (value / maxValue) * innerHeight;

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${padding.top + innerHeight} L ${getX(0)} ${padding.top + innerHeight} Z`;

  const yGuideValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => maxValue * ratio);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[620px] h-[230px]">
          {yGuideValues.map((value) => {
            const y = getY(value);
            return (
              <g key={`guide-${value}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#eef2f7"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-400 text-[10px]"
                >
                  {valueFormatter(value)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={palette.fill} />
          <path d={linePath} fill="none" stroke={palette.line} strokeWidth="2.5" strokeLinecap="round" />

          {points.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);
            const showLabel = index % Math.max(1, Math.floor(points.length / 6)) === 0 || index === points.length - 1;

            return (
              <g key={`${point.label}-${index}`}>
                <circle cx={x} cy={y} r="3.5" fill={palette.dot}>
                  <title>{`${point.label}: ${valueFormatter(point.value)}${point.hint ? ` (${point.hint})` : ''}`}</title>
                </circle>
                {showLabel && (
                  <text x={x} y={height - 16} textAnchor="middle" className="fill-gray-500 text-[10px]">
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
        <div className={`text-xs px-2.5 py-2 rounded-lg border ${palette.chip}`}>
          <p className="text-[10px] uppercase tracking-wide opacity-80">Total</p>
          <p className="font-semibold mt-0.5">{valueFormatter(totalValue)}</p>
        </div>
        <div className={`text-xs px-2.5 py-2 rounded-lg border ${palette.chip}`}>
          <p className="text-[10px] uppercase tracking-wide opacity-80">Average/Day</p>
          <p className="font-semibold mt-0.5">{valueFormatter(avgValue)}</p>
        </div>
        <div className={`text-xs px-2.5 py-2 rounded-lg border ${palette.chip}`}>
          <p className="text-[10px] uppercase tracking-wide opacity-80">Peak</p>
          <p className="font-semibold mt-0.5">{valueFormatter(peakValue)}</p>
        </div>
      </div>
      <p className={`text-xs mt-3 ${palette.text}`}>Hover points to inspect exact day values.</p>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [topFarmers, setTopFarmers] = useState<TopFarmer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [growth, setGrowth] = useState<GrowthAnalytics | null>(null);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth | null>(null);
  const [allOrders, setAllOrders] = useState<PagedResult<AdminOrder> | null>(null);
  const [allUsers, setAllUsers] = useState<PagedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

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
      const safeCall = <T,>(promise: Promise<T>): Promise<T | null> => promise.catch(() => null);
      const [statsRes, ordersRes, farmersRes, productsRes, analyticsRes, growthRes, healthRes] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getRecentOrders(5),
        AdminService.getTopFarmers(5),
        AdminService.getTopProducts(10),
        AdminService.getRevenueAnalytics(analyticsDays),
        safeCall(AdminService.getGrowthAnalytics(analyticsDays)),
        safeCall(AdminService.getPlatformHealth())
      ]);

      if (statsRes.success) setStats(statsRes.data!);
      if (ordersRes.success) setRecentOrders(ordersRes.data!);
      if (farmersRes.success) setTopFarmers(farmersRes.data!);
      if (productsRes.success) setTopProducts(productsRes.data!);
      if (analyticsRes.success) setAnalytics(analyticsRes.data!);
      if (growthRes?.success) setGrowth(growthRes.data!);
      if (healthRes?.success) setPlatformHealth(healthRes.data!);
      setLastUpdatedAt(new Date());
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
  }, [analyticsDays]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, orderPage, orderStatusFilter, orderSearch]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userPage, userRoleFilter, userSearch]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'users') fetchUsers();
    }, 60000);
    return () => clearInterval(interval);
  }, [activeTab, orderPage, userPage, orderStatusFilter, orderSearch, userRoleFilter, userSearch, analyticsDays]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await AdminService.updateOrderStatus(orderId, status);
      if (res.success) {
        await fetchOrders();
        const [statsRes, ordersRes] = await Promise.all([
          AdminService.getDashboardStats(),
          AdminService.getRecentOrders(5),
        ]);
        if (statsRes.success) setStats(statsRes.data!);
        if (ordersRes.success) setRecentOrders(ordersRes.data!);
        setLastUpdatedAt(new Date());
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUserActivationToggle = async (targetUser: AdminUser) => {
    if (targetUser.role === 'Admin') {
      return;
    }

    setUpdatingUserId(targetUser.id);
    try {
      const res = targetUser.isActive
        ? await AdminService.suspendUser(targetUser.id)
        : await AdminService.activateUser(targetUser.id);

      if (res.success) {
        await fetchUsers();
        const statsRes = await AdminService.getDashboardStats();
        if (statsRes.success) {
          setStats(statsRes.data!);
        }
        setLastUpdatedAt(new Date());
      }
    } catch (error) {
      console.error('Failed to update user account status:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOrdersCsv = () => {
    if (!allOrders?.items?.length) return;
    const rows = allOrders.items.map((order) => [
      order.orderNumber,
      order.consumerName,
      order.consumerEmail,
      order.itemCount.toString(),
      order.status,
      order.paymentMethod,
      order.totalAmount.toFixed(2),
      order.deliveryFee.toFixed(2),
      order.farmerNames.join(' | '),
      formatDate(order.createdAt),
    ]);
    downloadCsv(
      `admin-orders-page-${allOrders.page}.csv`,
      ['Order Number', 'Customer Name', 'Customer Email', 'Item Count', 'Status', 'Payment Method', 'Total Amount', 'Delivery Fee', 'Farmers', 'Created At'],
      rows
    );
  };

  const exportUsersCsv = () => {
    if (!allUsers?.items?.length) return;
    const rows = allUsers.items.map((u) => [
      u.username,
      u.email,
      u.fullName || '',
      u.role,
      u.approvalStatus,
      u.phoneNumber || '',
      u.isActive ? 'Active' : 'Inactive',
      new Date(u.createdAt).toLocaleDateString(),
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never',
    ]);
    downloadCsv(
      `admin-users-page-${allUsers.page}.csv`,
      ['Username', 'Email', 'Full Name', 'Role', 'Approval Status', 'Phone', 'Account State', 'Created At', 'Last Login'],
      rows
    );
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'Processing':
        return <RefreshCw className="w-3.5 h-3.5" />;
      case 'Shipped':
        return <Truck className="w-3.5 h-3.5" />;
      case 'Delivered':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Cancelled':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const orderStatusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const orderRows = allOrders?.items ?? [];
  const userRows = allUsers?.items ?? [];
  const orderRevenueOnPage = orderRows.reduce((sum, order) => sum + order.totalAmount, 0);
  const deliveredOnPage = orderRows.filter((order) => order.status === 'Delivered').length;
  const cancelledOnPage = orderRows.filter((order) => order.status === 'Cancelled').length;
  const pendingOnPage = orderRows.filter((order) => order.status === 'Pending').length;
  const avgOrderValueOnPage = orderRows.length > 0 ? orderRevenueOnPage / orderRows.length : 0;
  const deliveredRateOnPage = orderRows.length > 0 ? (deliveredOnPage / orderRows.length) * 100 : 0;
  const highestOrderOnPage = orderRows.length > 0 ? Math.max(...orderRows.map((order) => order.totalAmount)) : 0;
  const activeUsersOnPage = userRows.filter((user) => user.isActive).length;
  const suspendedUsersOnPage = userRows.filter((user) => !user.isActive).length;
  const farmersOnPage = userRows.filter((user) => user.role === 'Farmer').length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('admin.tab.overview', 'Overview'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'orders', label: t('admin.tab.orders', 'Orders'), icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'users', label: t('admin.tab.users', 'Users'), icon: <Users className="w-4 h-4" /> },
    { id: 'farmers', label: t('admin.tab.farmerApprovals', 'Farmer Approvals'), icon: <UserCheck className="w-4 h-4" /> },
    { id: 'products', label: t('admin.tab.topProducts', 'Top Products'), icon: <Package className="w-4 h-4" /> },
    { id: 'analytics', label: t('admin.tab.analytics', 'Analytics'), icon: <PieChart className="w-4 h-4" /> },
  ];

  const revenueChange = getRevenueChange();
  const orderFulfillmentRate = stats && stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0;
  const cancellationRate = stats && stats.totalOrders > 0 ? (stats.cancelledOrders / stats.totalOrders) * 100 : 0;
  const activeProductRate = stats && stats.totalProducts > 0 ? (stats.activeProducts / stats.totalProducts) * 100 : 0;
  const organicProductRate = stats && stats.totalProducts > 0 ? (stats.organicProducts / stats.totalProducts) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white min-h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 rounded-xl">
              <Leaf size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</h1>
              <span className="text-xs text-primary-600 font-medium">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {/* Active indicator */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full transition-all duration-300 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
              <span className={`transition-colors duration-200 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                {tab.icon}
              </span>
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.id === 'farmers' && stats?.pendingFarmers ? (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                  {stats.pendingFarmers}
                </span>
              ) : null}
              <ChevronRight
                size={16}
                className={`transition-all duration-300 ${activeTab === tab.id ? 'opacity-100 text-primary-500' : 'opacity-0 group-hover:opacity-50'}`}
              />
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-4 space-y-1 border-t border-gray-100 pt-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300 group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-90 transition-transform duration-500'}`} />
            <span className="font-medium text-sm">{t('admin.refreshData', 'Refresh Data')}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium text-sm">{t('auth.logout', 'Log out')}</span>
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">{t('admin.administrator', 'Administrator')}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="px-6 lg:px-8 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-3">
              {lastUpdatedAt && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <Activity className="w-4 h-4 text-primary-500" />
                  <span className="text-xs text-gray-600">{t('admin.updatedAt', 'Updated')} {lastUpdatedAt.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6 animate-fade-in">
                {/* Hero Stats Grid */}
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

                {/* Today's Snapshot + Revenue Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Today's Live Activity */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-amber-500" />
                      Today's Snapshot
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-700">Today Revenue</span>
                        </div>
                        <p className="text-xl font-bold text-green-900">{formatCurrency(stats.todayRevenue)}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700">Today Orders</span>
                        </div>
                        <p className="text-xl font-bold text-blue-900">{stats.todayOrders}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <UserPlus className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-purple-700">New Users</span>
                        </div>
                        <p className="text-xl font-bold text-purple-900">{stats.todayNewUsers}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-xs text-amber-700">Pending Approvals</span>
                        </div>
                        <p className="text-xl font-bold text-amber-900">{stats.pendingFarmers}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Comparison */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Revenue Comparison
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">This Month</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(stats.thisMonthRevenue)}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all" 
                            style={{ width: `${stats.thisMonthRevenue + stats.lastMonthRevenue > 0 ? (stats.thisMonthRevenue / Math.max(stats.thisMonthRevenue, stats.lastMonthRevenue)) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Last Month</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(stats.lastMonthRevenue)}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${stats.thisMonthRevenue + stats.lastMonthRevenue > 0 ? (stats.lastMonthRevenue / Math.max(stats.thisMonthRevenue, stats.lastMonthRevenue)) * 100 : 0}%` }} />
                        </div>
                      </div>
                      {platformHealth && (
                        <>
                          <hr className="border-gray-100" />
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">This Week</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(platformHealth.thisWeekRevenue)}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-400 to-violet-500 rounded-full transition-all"
                                style={{ width: `${platformHealth.thisWeekRevenue + platformHealth.lastWeekRevenue > 0 ? (platformHealth.thisWeekRevenue / Math.max(platformHealth.thisWeekRevenue, platformHealth.lastWeekRevenue)) * 100 : 0}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Last Week</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(platformHealth.lastWeekRevenue)}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                                style={{ width: `${platformHealth.thisWeekRevenue + platformHealth.lastWeekRevenue > 0 ? (platformHealth.lastWeekRevenue / Math.max(platformHealth.thisWeekRevenue, platformHealth.lastWeekRevenue)) * 100 : 0}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Pipeline + User Composition */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Order Pipeline / Funnel */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-500" />
                      Order Pipeline
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Pending', count: stats.pendingOrders, color: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
                        { label: 'Processing', count: stats.processingOrders, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', icon: <RefreshCw className="w-4 h-4" /> },
                        { label: 'Completed', count: stats.completedOrders, color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
                        { label: 'Cancelled', count: stats.cancelledOrders, color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
                      ].map(stage => {
                        const pct = stats.totalOrders > 0 ? (stage.count / stats.totalOrders) * 100 : 0;
                        return (
                          <div key={stage.label} className={`flex items-center gap-3 p-3 rounded-xl ${stage.bg}`}>
                            <div className={`${stage.text}`}>{stage.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-medium ${stage.text}`}>{stage.label}</span>
                                <span className={`text-sm font-bold ${stage.text}`}>{stage.count} ({pct.toFixed(1)}%)</span>
                              </div>
                              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                                <div className={`h-full ${stage.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Composition + Platform Metrics */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-purple-500" />
                      User Composition & Metrics
                    </h3>
                    <div className="space-y-3">
                      {/* Visual user distribution */}
                      <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                        {stats.totalUsers > 0 && (
                          <>
                            <div className="bg-green-500 transition-all" style={{ width: `${(stats.totalFarmers / stats.totalUsers) * 100}%` }} 
                              title={`Farmers: ${stats.totalFarmers}`} />
                            <div className="bg-blue-500 transition-all" style={{ width: `${(stats.totalConsumers / stats.totalUsers) * 100}%` }}
                              title={`Consumers: ${stats.totalConsumers}`} />
                            <div className="bg-amber-500 transition-all" style={{ width: `${(stats.pendingFarmers / stats.totalUsers) * 100}%` }}
                              title={`Pending: ${stats.pendingFarmers}`} />
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Farmers ({stats.totalFarmers})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Consumers ({stats.totalConsumers})</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Pending ({stats.pendingFarmers})</span>
                      </div>
                      <hr className="border-gray-100" />
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                          <Star className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">Avg Rating ({stats.totalRatings} reviews)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                          <Layers className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{stats.totalStories}</p>
                            <p className="text-xs text-gray-500">Farmer Stories</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{analytics ? formatCurrency(analytics.averageOrderValue) : '—'}</p>
                            <p className="text-xs text-gray-500">Avg Order Value</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                          <Percent className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{organicProductRate.toFixed(0)}%</p>
                            <p className="text-xs text-gray-500">Organic Products</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Health KPIs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-500" />
                      Operational Health
                    </h3>
                    <span className="text-xs text-gray-500">Live efficiency indicators</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <p className="text-xs text-green-700 mb-1">Fulfillment Rate</p>
                      <p className="text-2xl font-bold text-green-800">{orderFulfillmentRate.toFixed(1)}%</p>
                      <div className="h-1.5 bg-green-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${Math.min(orderFulfillmentRate, 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <p className="text-xs text-red-700 mb-1">Cancellation Rate</p>
                      <p className="text-2xl font-bold text-red-800">{cancellationRate.toFixed(1)}%</p>
                      <div className="h-1.5 bg-red-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${Math.min(cancellationRate, 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <p className="text-xs text-blue-700 mb-1">Active Product Ratio</p>
                      <p className="text-2xl font-bold text-blue-800">{activeProductRate.toFixed(1)}%</p>
                      <div className="h-1.5 bg-blue-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(activeProductRate, 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-xs text-emerald-700 mb-1">Organic Product Share</p>
                      <p className="text-2xl font-bold text-emerald-800">{organicProductRate.toFixed(1)}%</p>
                      <div className="h-1.5 bg-emerald-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${Math.min(organicProductRate, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week-over-Week + Product Category Distribution */}
                {platformHealth && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Week-over-Week */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Week-over-Week
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                          <p className="text-xs text-indigo-600 mb-1">This Week Revenue</p>
                          <p className="text-lg font-bold text-indigo-900">{formatCurrency(platformHealth.thisWeekRevenue)}</p>
                          <p className="text-xs text-indigo-600 mt-1">{platformHealth.thisWeekOrders} orders</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <p className="text-xs text-gray-600 mb-1">Last Week Revenue</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(platformHealth.lastWeekRevenue)}</p>
                          <p className="text-xs text-gray-600 mt-1">{platformHealth.lastWeekOrders} orders</p>
                        </div>
                      </div>
                      {(() => {
                        const wowChange = platformHealth.lastWeekRevenue > 0 
                          ? ((platformHealth.thisWeekRevenue - platformHealth.lastWeekRevenue) / platformHealth.lastWeekRevenue * 100) : 0;
                        const orderWow = platformHealth.lastWeekOrders > 0
                          ? ((platformHealth.thisWeekOrders - platformHealth.lastWeekOrders) / platformHealth.lastWeekOrders * 100) : 0;
                        return (
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className={`flex items-center justify-center gap-1 p-2 rounded-lg text-sm font-medium
                              ${wowChange >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {wowChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {Math.abs(wowChange).toFixed(1)}% Revenue
                            </div>
                            <div className={`flex items-center justify-center gap-1 p-2 rounded-lg text-sm font-medium
                              ${orderWow >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {orderWow >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {Math.abs(orderWow).toFixed(1)}% Orders
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Product Category Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Box className="w-5 h-5 text-orange-500" />
                        Products by Category
                      </h3>
                      <div className="space-y-2">
                        {platformHealth.productsByCategory.map((cat, idx) => {
                          const maxCount = Math.max(...platformHealth.productsByCategory.map(c => c.count));
                          const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500', 'bg-red-500'];
                          return (
                            <div key={cat.category}>
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span className="font-medium text-gray-700">{cat.category}</span>
                                <span className="text-gray-500">{cat.count} products</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        {platformHealth.productsByCategory.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-4">No product data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stock Alerts + Peak Hours */}
                {platformHealth && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Low Stock Alerts
                        </h3>
                        {platformHealth.lowStockProducts.length > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {platformHealth.lowStockProducts.length} items
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                        {platformHealth.lowStockProducts.length > 0 ? platformHealth.lowStockProducts.map(product => (
                          <div key={product.id} className="p-3 hover:bg-red-50/50 transition-colors flex items-center gap-3">
                            <img 
                              src={product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : 'https://via.placeholder.com/36'} 
                              alt={product.name}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.farmerName} • {product.category}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg
                              ${product.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {product.stock} left
                            </span>
                          </div>
                        )) : (
                          <div className="p-6 text-center">
                            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">All products well-stocked</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Peak Ordering Hours */}
                    <SimpleTrendChart
                      title="Peak Ordering Hours"
                      subtitle="Hourly order activity over a day"
                      icon={<Clock className="w-5 h-5 text-indigo-500" />}
                      color="blue"
                      points={Array.from({ length: 24 }, (_, hour) => {
                        const data = platformHealth.peakHours.find((p) => p.hour === hour);
                        return {
                          label: `${hour}h`,
                          value: data?.orderCount || 0,
                        };
                      })}
                      valueFormatter={(value) => `${Math.round(value)} orders`}
                    />
                  </div>
                )}

                {/* Revenue Trend (last N days mini chart) */}
                {analytics && analytics.dailyRevenue.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-end mb-4">
                      <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                        {[7, 30, 90].map((days) => (
                          <button
                            key={days}
                            onClick={() => setAnalyticsDays(days)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                              analyticsDays === days ? 'bg-primary-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {days}D
                          </button>
                        ))}
                      </div>
                    </div>

                    <SimpleTrendChart
                      title={`Revenue Trend (Last ${analyticsDays} Days)`}
                      subtitle="Same readable chart style as analytics"
                      icon={<BarChart3 className="w-5 h-5 text-primary-500" />}
                      color="green"
                      points={analytics.dailyRevenue.map((day) => ({
                        label: new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                        value: day.revenue,
                        hint: `${day.orderCount} orders`,
                      }))}
                      valueFormatter={(value) => formatCurrency(value)}
                    />
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('farmers')}
                    className="text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <UserCheck className="w-5 h-5 text-amber-600" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{stats.pendingFarmers} pending</span>
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Review Farmer Approvals</p>
                    <p className="text-xs text-gray-500 mt-1">Approve or reject verification requests</p>
                  </button>
                  <button onClick={() => setActiveTab('orders')}
                    className="text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{stats.pendingOrders} open</span>
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Track Open Orders</p>
                    <p className="text-xs text-gray-500 mt-1">Monitor pending and processing pipeline</p>
                  </button>
                  <button onClick={() => setActiveTab('users')}
                    className="text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">+{stats.todayNewUsers} today</span>
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Audit User Base</p>
                    <p className="text-xs text-gray-500 mt-1">Filter by roles and status instantly</p>
                  </button>
                  <button onClick={() => setActiveTab('analytics')}
                    className="text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <PieChart className="w-5 h-5 text-green-600" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{analyticsDays} days</span>
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Revenue Intelligence</p>
                    <p className="text-xs text-gray-500 mt-1">Dive into sales trends and category performance</p>
                  </button>
                </div>

                {/* Recent Orders & Top Farmers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary-500" />
                        Recent Orders
                      </h3>
                      <button onClick={() => setActiveTab('orders')}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
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

                {/* Top Selling Products table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Top Selling Products
                    </h3>
                    <button onClick={() => setActiveTab('products')}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
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
                        {topProducts.slice(0, 5).map(product => (
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
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-5 text-white shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-indigo-200" />
                        Order Command Center
                      </h3>
                      <p className="text-sm text-indigo-100/90 mt-1">
                        Track and manage orders with live status updates and smart filters.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-fit">
                      <div className="rounded-xl bg-white/10 border border-white/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-indigo-100/80">On This Page</p>
                        <p className="text-sm font-semibold mt-0.5">{orderRows.length}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 border border-white/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-indigo-100/80">Revenue</p>
                        <p className="text-sm font-semibold mt-0.5">{formatCurrency(orderRevenueOnPage)}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 border border-white/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-indigo-100/80">Delivered</p>
                        <p className="text-sm font-semibold mt-0.5">{deliveredOnPage}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 border border-white/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-indigo-100/80">Cancelled</p>
                        <p className="text-sm font-semibold mt-0.5">{cancelledOnPage}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by order number, customer, email..."
                        value={orderSearch}
                        onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="">All Status</option>
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      onClick={fetchOrders}
                      className="px-4 py-2.5 inline-flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                    <button
                      onClick={exportOrdersCsv}
                      disabled={!orderRows.length}
                      className="px-4 py-2.5 inline-flex items-center justify-center gap-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => { setOrderStatusFilter(''); setOrderPage(1); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        orderStatusFilter === ''
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      All ({orderRows.length})
                    </button>
                    {orderStatusOptions.map((status) => {
                      const count = orderRows.filter((order) => order.status === status).length;
                      return (
                        <button
                          key={status}
                          onClick={() => { setOrderStatusFilter(status); setOrderPage(1); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border inline-flex items-center gap-1.5 transition-colors ${
                            orderStatusFilter === status
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {getStatusIcon(status)}
                          {status} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700">Pending Orders</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">{pendingOnPage}</p>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                      <p className="text-xs text-green-700">Delivery Success</p>
                      <p className="text-xl font-bold text-green-900 mt-1">{deliveredRateOnPage.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                      <p className="text-xs text-purple-700">Avg Ticket (Page)</p>
                      <p className="text-xl font-bold text-purple-900 mt-1">{formatCurrency(avgOrderValueOnPage)}</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">Highest Order</p>
                      <p className="text-xl font-bold text-amber-900 mt-1">{formatCurrency(highestOrderOnPage)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Farmers / Items</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Manage</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orderRows.map((order) => (
                          <tr key={order.id} className="hover:bg-primary-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                              <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{order.consumerName}</p>
                              <p className="text-xs text-gray-500">{order.consumerEmail}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-gray-700">{order.itemCount} items</p>
                              <p className="text-xs text-gray-500 truncate max-w-[240px]">{order.farmerNames.join(', ')}</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                              <p className="text-xs text-gray-500">Fee: {formatCurrency(order.deliveryFee)}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white disabled:opacity-60 focus:ring-2 focus:ring-primary-500"
                              >
                                {orderStatusOptions.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                          </tr>
                        ))}
                        {orderRows.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                              No orders match your current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {allOrders && allOrders.totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">
                        Showing {(orderPage - 1) * 10 + 1} to {Math.min(orderPage * 10, allOrders.totalCount)} of {allOrders.totalCount}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                          disabled={orderPage === 1}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setOrderPage((p) => Math.min(allOrders.totalPages, p + 1))}
                          disabled={orderPage >= allOrders.totalPages}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-500">Manage account visibility, status, and role-level health at a glance.</p>
                      </div>
                      <button
                        onClick={exportUsersCsv}
                        disabled={!allUsers?.items?.length}
                        className="px-4 py-2.5 inline-flex items-center gap-2 border border-gray-200 rounded-xl text-gray-700 bg-white
                                 hover:bg-gray-50 hover:border-primary-200 hover:shadow-sm transition-all duration-300 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-emerald-700/80">Active</p>
                        <p className="text-xl font-bold text-emerald-700">{activeUsersOnPage}</p>
                      </div>
                      <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-rose-700/80">Suspended</p>
                        <p className="text-xl font-bold text-rose-700">{suspendedUsersOnPage}</p>
                      </div>
                      <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-sky-700/80">Farmers</p>
                        <p className="text-xl font-bold text-sky-700">{farmersOnPage}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Search by username or email"
                          value={userSearch}
                          onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white/90 text-sm
                                   focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all duration-300"
                        />
                      </div>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white/90 text-sm
                                 focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all duration-300"
                      >
                        <option value="">All Roles</option>
                        <option value="Consumer">Consumer</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allUsers?.items.map((user, index) => (
                        <tr
                          key={user.id}
                          className="group hover:bg-gradient-to-r hover:from-primary-50/40 hover:to-transparent transition-all duration-300"
                          style={{ animationDelay: `${index * 25}ms` }}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-sky-100 text-primary-700 rounded-xl
                                              flex items-center justify-center font-semibold shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">{user.username}</p>
                                {user.fullName && <p className="text-xs text-gray-500">{user.fullName}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300
                              ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' :
                                user.role === 'Farmer' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
                                {user.isActive ? 'Active' : 'Suspended'}
                              </span>
                              {user.role === 'Admin' ? (
                                <span className="text-xs text-gray-400">Protected</span>
                              ) : (
                                <button
                                  onClick={() => handleUserActivationToggle(user)}
                                  disabled={updatingUserId === user.id}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                            transition-all duration-300 active:scale-95 disabled:opacity-60
                                    ${user.isActive
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 hover:shadow-sm'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-sm'}`}
                                >
                                  {updatingUserId === user.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : user.isActive ? (
                                    <UserX className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                  {user.isActive ? 'Suspend' : 'Activate'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">
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
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    Analytics Window
                  </h3>
                  <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                    {[7, 30, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => setAnalyticsDays(days)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          analyticsDays === days ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {days}D
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 p-1.5 bg-green-100 text-green-600 rounded-lg" />
                      <div>
                        <p className="text-xs text-gray-500">Revenue ({analyticsDays}D)</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg" />
                      <div>
                        <p className="text-xs text-gray-500">Orders ({analyticsDays}D)</p>
                        <p className="text-xl font-bold text-gray-900">{analytics.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 p-1.5 bg-purple-100 text-purple-600 rounded-lg" />
                      <div>
                        <p className="text-xs text-gray-500">Avg Order Value</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Hash className="w-8 h-8 p-1.5 bg-orange-100 text-orange-600 rounded-lg" />
                      <div>
                        <p className="text-xs text-gray-500">Revenue/Day Avg</p>
                        <p className="text-xl font-bold text-gray-900">
                          {analytics.dailyRevenue.length > 0 
                            ? formatCurrency(analytics.totalRevenue / analytics.dailyRevenue.length) 
                            : 'Rs. 0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <SimpleTrendChart
                    title={`Daily Revenue (Last ${analyticsDays} Days)`}
                    subtitle="Line trend with visible scale and date markers"
                    icon={<BarChart3 className="w-5 h-5 text-primary-500" />}
                    color="green"
                    points={analytics.dailyRevenue.map((day) => ({
                      label: new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                      value: day.revenue,
                      hint: `${day.orderCount} orders`,
                    }))}
                    valueFormatter={(value) => formatCurrency(value)}
                  />

                  <SimpleTrendChart
                    title={`Daily Order Volume (Last ${analyticsDays} Days)`}
                    subtitle="Readable order pattern by day"
                    icon={<ShoppingCart className="w-5 h-5 text-blue-500" />}
                    color="blue"
                    points={analytics.dailyRevenue.map((day) => ({
                      label: new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                      value: day.orderCount,
                    }))}
                    valueFormatter={(value) => `${Math.round(value)}`}
                  />

                  {growth && growth.dailyUserRegistrations.length > 0 && (
                    <SimpleTrendChart
                      title={`User Registrations (Last ${analyticsDays} Days)`}
                      subtitle="Daily new users, easier to compare across days"
                      icon={<UserPlus className="w-5 h-5 text-purple-500" />}
                      color="purple"
                      points={growth.dailyUserRegistrations.map((day) => ({
                        label: new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                        value: day.count,
                      }))}
                      valueFormatter={(value) => `${Math.round(value)}`}
                    />
                  )}

                  {growth && growth.dailyOrderCounts.length > 0 && (
                    <SimpleTrendChart
                      title={`Order Growth (Last ${analyticsDays} Days)`}
                      subtitle="Daily order growth trend"
                      icon={<ShoppingBag className="w-5 h-5 text-green-500" />}
                      color="orange"
                      points={growth.dailyOrderCounts.map((day) => ({
                        label: new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                        value: day.count,
                      }))}
                      valueFormatter={(value) => `${Math.round(value)}`}
                    />
                  )}
                </div>

                {/* Category Revenue + Peak Hours side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Revenue */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary-500" />
                      Revenue by Category
                    </h3>
                    <div className="space-y-3">
                      {analytics.categoryRevenue.map((cat, idx) => {
                        const totalCatRevenue = analytics.categoryRevenue.reduce((s, c) => s + c.revenue, 0);
                        const share = totalCatRevenue > 0 ? (cat.revenue / totalCatRevenue) * 100 : 0;
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
                        return (
                          <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                              <span className="text-xs text-gray-500">{formatCurrency(cat.revenue)} ({share.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">{cat.orderCount} orders</p>
                          </div>
                        );
                      })}
                      {analytics.categoryRevenue.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No category data available</p>
                      )}
                    </div>
                  </div>

                  {/* Peak Hours in Analytics */}
                  {platformHealth && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        Order Activity by Hour
                      </h3>
                      {platformHealth.peakHours.length > 0 ? (
                        <>
                          <div className="flex items-end gap-0.5 h-36">
                            {Array.from({ length: 24 }, (_, hour) => {
                              const data = platformHealth.peakHours.find(p => p.hour === hour);
                              const count = data?.orderCount || 0;
                              const maxCount = Math.max(...platformHealth.peakHours.map(p => p.orderCount));
                              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                              const isPeak = count === maxCount && count > 0;
                              return (
                                <div key={hour} className="flex-1 flex flex-col items-center gap-1" title={`${hour}:00 - ${count} orders`}>
                                  <span className="text-[8px] text-gray-400">{count > 0 ? count : ''}</span>
                                  <div className="w-full relative rounded-t-sm" style={{ height: '100px' }}>
                                    <div className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300
                                      ${isPeak ? 'bg-indigo-600' : count > 0 ? 'bg-indigo-400' : 'bg-gray-100'}`}
                                      style={{ height: `${Math.max(height, 2)}%` }} />
                                  </div>
                                  {hour % 4 === 0 && <span className="text-[9px] text-gray-400">{hour}h</span>}
                                </div>
                              );
                            })}
                          </div>
                          {(() => {
                            const sorted = [...platformHealth.peakHours].sort((a, b) => b.orderCount - a.orderCount);
                            const top3 = sorted.slice(0, 3);
                            return (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {top3.map((h, i) => (
                                  <span key={h.hour} className={`text-xs px-2 py-1 rounded-full font-medium
                                    ${i === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {h.hour}:00 ({h.orderCount} orders)
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No data available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Category Distribution + Week Comparison */}
                {platformHealth && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Box className="w-5 h-5 text-orange-500" />
                        Products by Category
                      </h3>
                      <div className="space-y-2">
                        {platformHealth.productsByCategory.map((cat, idx) => {
                          const total = platformHealth.productsByCategory.reduce((s, c) => s + c.count, 0);
                          const share = total > 0 ? (cat.count / total) * 100 : 0;
                          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500'];
                          return (
                            <div key={cat.category} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                              <span className="text-sm text-gray-700 flex-1">{cat.category}</span>
                              <span className="text-sm font-medium text-gray-900">{cat.count}</span>
                              <span className="text-xs text-gray-400 w-12 text-right">{share.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-500" />
                        Weekly Performance
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-teal-50 rounded-xl text-center border border-teal-100">
                            <p className="text-xs text-teal-600">This Week</p>
                            <p className="text-lg font-bold text-teal-900">{formatCurrency(platformHealth.thisWeekRevenue)}</p>
                            <p className="text-[10px] text-teal-600">{platformHealth.thisWeekOrders} orders</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-200">
                            <p className="text-xs text-gray-600">Last Week</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(platformHealth.lastWeekRevenue)}</p>
                            <p className="text-[10px] text-gray-600">{platformHealth.lastWeekOrders} orders</p>
                          </div>
                        </div>
                        {(() => {
                          const wowRev = platformHealth.lastWeekRevenue > 0 
                            ? ((platformHealth.thisWeekRevenue - platformHealth.lastWeekRevenue) / platformHealth.lastWeekRevenue * 100) : 0;
                          const wowOrd = platformHealth.lastWeekOrders > 0
                            ? ((platformHealth.thisWeekOrders - platformHealth.lastWeekOrders) / platformHealth.lastWeekOrders * 100) : 0;
                          const aovThis = platformHealth.thisWeekOrders > 0 ? platformHealth.thisWeekRevenue / platformHealth.thisWeekOrders : 0;
                          const aovLast = platformHealth.lastWeekOrders > 0 ? platformHealth.lastWeekRevenue / platformHealth.lastWeekOrders : 0;
                          return (
                            <div className="space-y-2">
                              <div className={`flex justify-between items-center p-2 rounded-lg text-sm
                                ${wowRev >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span>Revenue Change</span>
                                <span className="font-semibold flex items-center gap-1">
                                  {wowRev >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                  {Math.abs(wowRev).toFixed(1)}%
                                </span>
                              </div>
                              <div className={`flex justify-between items-center p-2 rounded-lg text-sm
                                ${wowOrd >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span>Order Volume Change</span>
                                <span className="font-semibold flex items-center gap-1">
                                  {wowOrd >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                  {Math.abs(wowOrd).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                                <span>AOV This Week</span>
                                <span className="font-semibold">{formatCurrency(aovThis)}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                                <span>AOV Last Week</span>
                                <span className="font-semibold">{formatCurrency(aovLast)}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
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
