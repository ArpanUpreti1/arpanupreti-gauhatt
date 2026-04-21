import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService, getCurrentUser } from '../../services/api';
import { OrderResponse } from '../../types';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ShoppingBag,
  Calendar
} from 'lucide-react';
import MainLayout from '../../components/MainLayout';

type DisplayOrderItem = {
  name: string;
  image?: string;
  quantity: number;
  price: number;
};

type DisplayOrder = {
  orderId: string;
  date: string;
  status: string;
  items: DisplayOrderItem[];
  total: number;
};

const getUserScopedOrdersKey = () => {
  const user = getCurrentUser();
  return user?.id ? `orders_${user.id}` : 'orders';
};

const mapApiOrderToDisplayOrder = (order: OrderResponse): DisplayOrder => ({
  orderId: order.orderNumber,
  date: order.orderDate,
  status: order.status,
  items: order.items.map(item => ({
    name: item.productName,
    image: item.productImageUrl,
    quantity: item.quantity,
    price: item.unitPrice,
  })),
  total: order.total,
});

// ============ ORDER STATUS BADGE ============
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    pending: { 
      bg: 'bg-amber-100', 
      text: 'text-amber-700', 
      icon: <Clock className="w-3.5 h-3.5" />,
      label: 'Pending'
    },
    confirmed: { 
      bg: 'bg-green-100', 
      text: 'text-green-700', 
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'Confirmed'
    }
  };
  
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                     ${config.bg} ${config.text} transition-all duration-300 hover:scale-105`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ============ ORDER CARD ============
const OrderCard: React.FC<{ order: DisplayOrder; index: number }> = ({ order, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary-500/5
                hover:border-primary-100 group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Order Header */}
      <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center 
                     justify-between gap-3 bg-gradient-to-r from-gray-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center
                        transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
              Order #{order.orderId}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(order.date).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      
      {/* Order Items */}
      <div className="p-5">
        <div className="space-y-3">
          {order.items.slice(0, 3).map((item: any, idx: number) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 group/item"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0
                            ring-2 ring-transparent group-hover/item:ring-primary-200 transition-all duration-300">
                <img
                  src={item.image || `https://source.unsplash.com/100x100/?${item.name}`}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-primary-600 
                            transition-colors duration-300">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                Rs. {(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-gray-500 pl-17">
              +{order.items.length - 3} more items
            </p>
          )}
        </div>
      </div>
      
      {/* Order Footer */}
      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-primary-600">Rs. {order.total.toFixed(2)}</p>
        </div>
        <button
          className={`flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700
                     transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}
        >
          View Details
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>
    </div>
  );
};

// ============ ORDER SKELETON ============
const OrderSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-20 h-3 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="w-20 h-6 bg-gray-200 rounded-full" />
    </div>
    <div className="p-5 space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-3 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
    <div className="px-5 py-4 bg-gray-50 flex items-center justify-between">
      <div className="space-y-1">
        <div className="w-16 h-3 bg-gray-200 rounded" />
        <div className="w-24 h-5 bg-gray-200 rounded" />
      </div>
      <div className="w-24 h-4 bg-gray-200 rounded" />
    </div>
  </div>
);

// ============ EMPTY STATE ============
const EmptyOrders: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6
                    animate-bounce-subtle">
        <ShoppingBag className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        Looks like you haven't placed any orders yet. Start exploring our fresh local products!
      </p>
      <button
        onClick={() => navigate('/products')}
        className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold
                 shadow-lg shadow-primary-500/20 hover:bg-primary-600 hover:shadow-primary-500/40
                 transition-all duration-300 hover:-translate-y-1 active:scale-95
                 flex items-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        Start Shopping
      </button>
    </div>
  );
};

// ============ MAIN ORDERS PAGE ============
const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const storageKey = getUserScopedOrdersKey();

      try {
        const response = await OrderService.getMyOrders();
        if (response.success && response.data) {
          const mappedOrders = response.data.map(mapApiOrderToDisplayOrder);
          setOrders(mappedOrders);
          localStorage.setItem(storageKey, JSON.stringify(mappedOrders));
        } else {
          const storedOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
          setOrders(storedOrders);
        }
      } catch (error) {
        console.error('Failed to load orders from API, using local cache:', error);
        const storedOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setOrders(storedOrders);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </span>
            My Orders
          </h1>
          <p className="text-gray-500">Track and manage your orders from local farmers</p>
        </div>



        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <OrderCard key={order.orderId} order={order} index={index} />
            ))}
          </div>
        )}

        {/* Order Count */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyOrdersPage;
