import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Truck, Package, Loader2 } from 'lucide-react';
import { OrderService, API_BASE_URL } from '../../../../services/api';
import { FarmerOrder } from '../../../../types';

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<FarmerOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<FarmerOrder | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
        
        // Refetch orders when window gains focus (user comes back to tab)
        const handleFocus = () => fetchOrders();
        window.addEventListener('focus', handleFocus);
        
        // Also refetch on visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchOrders();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await OrderService.getFarmerOrders();
            if (response.success && response.data) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        if (!selectedOrder) return;

        // Map UI status to backend item status
        const itemStatusMap: Record<string, string> = {
            'Confirmed': 'Accepted',
            'Cancelled': 'Rejected',
            'Shipped': 'Shipped',
            'Delivered': 'Delivered'
        };
        const itemStatus = itemStatusMap[newStatus] || newStatus;

        try {
            // Update all items in this order for this farmer
            for (const item of selectedOrder.items) {
                await OrderService.updateItemStatus(item.id, itemStatus);
            }

            // Update local state after successful API calls
            setOrders(orders.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
            if (selectedOrder && selectedOrder.orderId === orderId) {
                setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            fetchOrders(); // Revert on failure
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.consumerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getDeliveryAddressString = (order: FarmerOrder) => {
        const addr = order.deliveryAddress;
        let address = `${addr.fullName}\n${addr.phone}\n${addr.address}, ${addr.city}`;
        if (addr.landmark) address += `\nLandmark: ${addr.landmark}`;
        return address;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Order Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search orders..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-200" 
                            />
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100"><Filter size={20} className="text-gray-600" /></button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {filteredOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500">No orders yet</p>
                                <p className="text-gray-400 text-sm mt-1">Orders from consumers will appear here</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map(order => (
                                        <tr
                                            key={order.orderId}
                                            onClick={() => setSelectedOrder(order)}
                                            className={`cursor-pointer transition-colors ${selectedOrder?.orderId === order.orderId ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber}</td>
                                            <td className="px-6 py-4 text-gray-600">{order.consumerName}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">₹{order.total}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-orange-600"><Eye size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Order Details Panel */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h2>
                                    <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.orderStatus)}`}>
                                    {selectedOrder.orderStatus}
                                </span>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                                    {item.productImageUrl ? (
                                                        <img 
                                                            src={item.productImageUrl.startsWith('http') ? item.productImageUrl : `${API_BASE_URL}${item.productImageUrl}`} 
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package size={14} className="text-green-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                                    <p className="text-gray-500 text-xs">{item.quantity} {item.unit} x ₹{item.unitPrice}</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900">₹{item.subtotal}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-700">₹{selectedOrder.itemsSubtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery Fee</span>
                                        <span className="text-gray-700">₹{selectedOrder.deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="font-bold text-gray-700">Total</span>
                                        <span className="font-bold text-xl text-orange-600">₹{selectedOrder.total}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Customer & Delivery</h3>
                                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium text-gray-900">{selectedOrder.consumerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-medium text-gray-900">{selectedOrder.consumerPhone}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Truck size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {getDeliveryAddressString(selectedOrder)}
                                    </p>
                                </div>
                                {selectedOrder.distanceKm && (
                                    <p className="text-xs text-gray-500 text-center">
                                        Distance: {selectedOrder.distanceKm.toFixed(1)} km
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            {selectedOrder.orderStatus === 'Pending' && (
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.orderId, 'Confirmed')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-600 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
                                    >
                                        <CheckCircle size={18} /> Confirm Order
                                    </button>
                                </div>
                            )}
                            {selectedOrder.orderStatus === 'Confirmed' && (
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-700 font-medium rounded-xl">
                                        <CheckCircle size={18} /> Order Confirmed
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <Package size={48} className="mb-4 text-gray-200" />
                            <p>Select an order to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderList;
