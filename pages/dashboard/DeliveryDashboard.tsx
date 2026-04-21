import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, LogOut, MapPin, Navigation, Truck, Package, CheckCircle, XCircle,
  Clock, DollarSign, Loader2, RefreshCw,
  Phone, User, AlertCircle, LayoutDashboard
} from 'lucide-react';
import {
  clearAuthData, getCurrentUser, DeliveryPersonService, LocationUtils
} from '../../services/api';
import {
  DeliveryAssignment, DeliveryDashboardStats, DeliveryPersonProfile, UserLocation, UserRole
} from '../../types';
import LocationPromptModal from '../../components/LocationPromptModal';
import { useLanguage } from '../../contexts/LanguageContext';

type TabType = 'dashboard' | 'assignments' | 'profile';
type AssignmentFilter = '' | 'Pending' | 'Accepted' | 'PickedUp' | 'InTransit' | 'Delivered' | 'Rejected';

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const user = getCurrentUser();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<DeliveryDashboardStats | null>(null);
  const [profile, setProfile] = useState<DeliveryPersonProfile | null>(null);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await DeliveryPersonService.getDashboard();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await DeliveryPersonService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await DeliveryPersonService.getAssignments(assignmentFilter || undefined);
      if (response.success && response.data) {
        setAssignments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  }, [assignmentFilter]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== UserRole.DELIVERY_PERSON) {
      if (user.role === UserRole.CONSUMER) {
        navigate('/home');
      } else if (user.role === UserRole.FARMER) {
        navigate('/farmer');
      } else if (user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/login');
      }
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchDashboard(), fetchProfile(), fetchAssignments()]);
      } catch (err) {
        setError(t('delivery.error.loadData', 'Failed to load data'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAssignments();
    }
  }, [assignmentFilter]);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    
    // Check if location is set before enabling
    if (!profile.isAvailableForDelivery && !profile.latitude && !profile.longitude) {
      setShowLocationPrompt(true);
      return;
    }

    setActionLoading('availability');
    try {
      const response = await DeliveryPersonService.updateAvailability(!profile.isAvailableForDelivery);
      if (response.success) {
        setProfile(prev => prev ? { ...prev, isAvailableForDelivery: !prev.isAvailableForDelivery } : null);
        setStats(prev => prev ? { ...prev, isAvailable: !prev.isAvailable } : null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('delivery.error.updateAvailability', 'Failed to update availability'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (assignmentId: string, status: string) => {
    setActionLoading(assignmentId);
    try {
      const response = await DeliveryPersonService.updateAssignmentStatus(assignmentId, status);
      if (response.success) {
        await Promise.all([fetchAssignments(), fetchDashboard()]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('delivery.error.updateStatus', 'Failed to update status'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateLocation = async () => {
    setActionLoading('location');
    try {
      const position = await LocationUtils.getCurrentLocation();
      const newLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        address: 'Current Location'
      };
      LocationUtils.saveLocation(newLocation);
      const response = await DeliveryPersonService.updateLocation(newLocation);
      if (response.success) {
        setProfile(prev => prev ? {
          ...prev,
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          locationAddress: newLocation.address,
          lastLocationUpdate: new Date().toISOString()
        } : null);
      }
    } catch (err: any) {
      setError(t('delivery.error.updateLocation', 'Failed to update location. Please allow location access.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLocationSet = (location: UserLocation) => {
    setShowLocationPrompt(false);
    setProfile(prev => prev ? {
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      locationAddress: location.address
    } : null);
    // Now try to enable availability
    handleToggleAvailability();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'PickedUp': return 'bg-indigo-100 text-indigo-800';
      case 'InTransit': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PickedUp': return 'Picked Up';
      case 'InTransit': return 'In Transit';
      default: return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white min-h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-40">
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">GAUHATT</h1>
              <p className="text-xs text-gray-500">Delivery Partner</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {([
            { key: 'dashboard', label: t('delivery.tab.dashboard', 'Dashboard'), icon: LayoutDashboard },
            { key: 'assignments', label: t('delivery.tab.assignments', 'Assignments'), icon: Package },
            { key: 'profile', label: t('delivery.tab.profile', 'Profile'), icon: User },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            {t('auth.logout', 'Log out')}
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
              {user.username?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">Delivery Partner</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64 min-h-screen">
        <main className="p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">{t('delivery.welcomeBack', 'Welcome back')}, {user.username}!</h1>
                <p className="text-emerald-100 text-sm sm:text-base">{t('delivery.welcomeDesc', 'Track assignments, manage your availability, and keep deliveries on time.')}</p>
              </div>
              {profile && (
                <button
                  onClick={handleToggleAvailability}
                  disabled={actionLoading === 'availability'}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    profile.isAvailableForDelivery
                      ? 'bg-white text-green-700 hover:bg-green-50'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  } disabled:opacity-50`}
                >
                  {actionLoading === 'availability' ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      {t('common.updating', 'Updating...')}
                    </span>
                  ) : profile.isAvailableForDelivery ? t('delivery.setUnavailable', 'Set Unavailable') : t('delivery.setAvailable', 'Set Available')}
                </button>
              )}
            </div>
          </div>

          {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <XCircle size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow-lg border border-gray-100 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                {/* Status Banner */}
                <div className="p-4 rounded-lg flex items-center justify-between bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-green-700">
                      {t('delivery.assignmentDistanceNote', 'Assignments are dispatched by distance within 50 km')}
                    </span>
                  </div>
                  <button
                    onClick={handleUpdateLocation}
                    disabled={actionLoading === 'location'}
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {actionLoading === 'location' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Navigation size={14} />
                    )}
                    {t('delivery.updateLocation', 'Update Location')}
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-yellow-500" />
                      <span className="text-xs text-gray-500 uppercase">{t('delivery.pending', 'Pending')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                  </div>
                  <div className="bg-white p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={16} className="text-blue-500" />
                      <span className="text-xs text-gray-500 uppercase">{t('delivery.active', 'Active')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeDeliveries}</p>
                  </div>
                  <div className="bg-white p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-xs text-gray-500 uppercase">{t('delivery.completed', 'Completed')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedDeliveries}</p>
                  </div>
                  <div className="bg-white p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={16} className="text-emerald-500" />
                      <span className="text-xs text-gray-500 uppercase">{t('delivery.earnings', 'Earnings')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">NPR {stats.totalEarnings}</p>
                  </div>
                </div>

                {/* Today's Summary */}
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('delivery.todaySummary', "Today's Summary")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 border border-primary-200">
                      <p className="text-3xl font-bold text-primary-600">{stats.todayDeliveries}</p>
                      <p className="text-sm text-primary-700">{t('delivery.deliveriesToday', 'Deliveries Today')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 border border-emerald-200">
                      <p className="text-3xl font-bold text-emerald-600">NPR {stats.todayEarnings}</p>
                      <p className="text-sm text-emerald-700">{t('delivery.earningsToday', 'Earnings Today')}</p>
                    </div>
                  </div>
                </div>

                {/* Overall Stats */}
                <div className="bg-white p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('delivery.overallStats', 'Overall Statistics')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 border border-gray-100">
                      <p className="text-xl font-bold text-gray-900">{stats.totalAssignments}</p>
                      <p className="text-xs text-gray-500">Total Assignments</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 border border-gray-100">
                      <p className="text-xl font-bold text-gray-900">{(stats.totalDistanceKm ?? 0).toFixed(1)} km</p>
                      <p className="text-xs text-gray-500">Total Distance</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 border border-gray-100">
                      <p className="text-xl font-bold text-gray-900">{stats.rejectedAssignments}</p>
                      <p className="text-xs text-gray-500">Rejected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div className="space-y-4">
                {/* Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {(['', 'Pending', 'Accepted', 'PickedUp', 'InTransit', 'Delivered', 'Rejected'] as AssignmentFilter[]).map(filter => (
                    <button key={filter}
                      onClick={() => setAssignmentFilter(filter)}
                      className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-all ${
                        assignmentFilter === filter
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}>
                      {filter || 'All'}
                    </button>
                  ))}
                  <button
                    onClick={fetchAssignments}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                {/* Assignments List */}
                {assignments.length === 0 ? (
                  <div className="bg-white border border-gray-100 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No assignments found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {assignmentFilter ? `No ${assignmentFilter.toLowerCase()} assignments` : 'Your assignments will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="bg-white border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">#{assignment.orderNumber}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                              {getStatusLabel(assignment.status)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(assignment.createdAt)}</span>
                        </div>

                        {/* Route Info */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-start gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Pickup from</p>
                              <p className="text-gray-900 font-medium">{assignment.farmerName}{assignment.farmName ? ` (${assignment.farmName})` : ''}</p>
                              {assignment.pickupAddress && <p className="text-gray-400 text-xs">{assignment.pickupAddress}</p>}
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin size={10} className="text-red-500" />
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Deliver to</p>
                              <p className="text-gray-900 font-medium">{assignment.consumerName}</p>
                              {assignment.dropoffAddress && <p className="text-gray-400 text-xs">{assignment.dropoffAddress}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 border-t border-gray-50 pt-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {assignment.totalDistanceKm.toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Package size={12} /> {assignment.itemCount} items
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} /> NPR {assignment.deliveryFee}
                          </span>
                          {assignment.consumerPhone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {assignment.consumerPhone}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {assignment.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(assignment.id, 'Accepted')}
                                disabled={actionLoading === assignment.id}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === assignment.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(assignment.id, 'Rejected')}
                                disabled={actionLoading === assignment.id}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          )}
                          {assignment.status === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(assignment.id, 'PickedUp')}
                              disabled={actionLoading === assignment.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === assignment.id ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                              Mark as Picked Up
                            </button>
                          )}
                          {assignment.status === 'PickedUp' && (
                            <button
                              onClick={() => handleUpdateStatus(assignment.id, 'InTransit')}
                              disabled={actionLoading === assignment.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === assignment.id ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                              Start Delivery
                            </button>
                          )}
                          {assignment.status === 'InTransit' && (
                            <button
                              onClick={() => handleUpdateStatus(assignment.id, 'Delivered')}
                              disabled={actionLoading === assignment.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === assignment.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && profile && (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                        {profile.fullName?.charAt(0) || profile.username.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{profile.fullName || profile.username}</h2>
                        <p className="text-white/80 text-sm">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${profile.isAvailableForDelivery ? 'bg-green-400' : 'bg-gray-300'}`} />
                          <span className="text-sm text-white/80">
                            {profile.isAvailableForDelivery ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                        <Phone size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="text-gray-900 font-medium">{profile.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                        <Truck size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
                          <p className="text-gray-900 font-medium">{profile.vehicleType}{profile.vehicleNumber ? ` • ${profile.vehicleNumber}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                        <MapPin size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                          <p className="text-gray-900 font-medium">
                            {profile.locationAddress || (profile.latitude ? `${profile.latitude.toFixed(4)}, ${profile.longitude?.toFixed(4)}` : 'Not set')}
                          </p>
                          {profile.lastLocationUpdate && (
                            <p className="text-xs text-gray-400 mt-0.5">Updated: {formatDate(profile.lastLocationUpdate)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100">
                        <Clock size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Joined</p>
                          <p className="text-gray-900 font-medium">{new Date(profile.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Update */}
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={handleUpdateLocation}
                        disabled={actionLoading === 'location'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'location' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Navigation size={16} />
                        )}
                        Update My Location
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-white border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Delivery Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <p className="text-2xl font-bold text-green-600">{profile.totalDeliveries}</p>
                      <p className="text-xs text-green-700">Total Deliveries</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                      <p className="text-2xl font-bold text-emerald-600">NPR {profile.totalEarnings}</p>
                      <p className="text-xs text-emerald-700">Total Earnings</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>
      </div>

      {/* Location Prompt Modal */}
      <LocationPromptModal
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        onLocationSet={handleLocationSet}
        userRole="deliveryperson"
      />
    </div>
  );
};

export default DeliveryDashboard;
