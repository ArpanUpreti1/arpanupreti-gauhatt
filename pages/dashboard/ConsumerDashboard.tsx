import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Loader2, Truck } from 'lucide-react';
import { clearAuthData, getCurrentUser, OrderService } from '../../services/api';
import { OrderResponse } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const ConsumerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const user = getCurrentUser();
    const [orders, setOrders] = React.useState<OrderResponse[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await OrderService.getMyOrders();
                if (response.success && response.data) {
                    setOrders(response.data.slice(0, 5));
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error('Failed to fetch consumer delivery info', error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleLogout = () => {
        clearAuthData();
        navigate('/login');
    };

    const formatDeliveryStatus = (status?: string) => {
        if (!status) return t('consumer.notAssigned', 'Not Assigned');
        if (status === 'PickedUp') return t('consumer.pickedUp', 'Picked Up');
        if (status === 'InTransit') return t('consumer.inTransit', 'In Transit');
        return status;
    };

    const getStatusColor = (status?: string) => {
        switch ((status || '').toLowerCase()) {
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'accepted':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pickedup':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'intransit':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-9 h-9 bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Leaf size={22} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">GAUHATT</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        <LogOut size={18} />
                        {t('auth.logout', 'Logout')}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="bg-white shadow-xl border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🛒</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                        {t('consumer.welcomeTitle', 'Welcome to Consumer Page')}
                    </h1>
                    {user && (
                        <p className="text-gray-600 text-lg">
                            {t('consumer.hello', 'Hello')}, <span className="font-semibold text-primary-600">{user.username}</span>!
                        </p>
                    )}
                    </div>

                    <section className="bg-white shadow-xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{t('consumer.deliveryInfo', 'Delivery Info')}</h2>
                            <button
                                onClick={() => navigate('/orders')}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                                {t('consumer.viewAllOrders', 'View all orders')}
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                {t('consumer.noDeliveryUpdates', 'No delivery updates yet.')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {order.deliveryPartnerName ? `${t('consumer.partner', 'Partner')}: ${order.deliveryPartnerName}` : t('consumer.partnerNotAssigned', 'Partner not assigned')}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.deliveryStatus)}`}>
                                            <Truck className="w-3.5 h-3.5" />
                                            {formatDeliveryStatus(order.deliveryStatus)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ConsumerDashboard;
