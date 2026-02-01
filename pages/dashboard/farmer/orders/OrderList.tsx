import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import { OrderService } from '../../../../services/api';
import { Order } from '../../../../types';

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Mock Data
    const mockOrders: Order[] = [
        {
            id: 'ORD-001',
            consumerName: 'Rahul Sharma',
            consumerId: 'C1',
            totalAmount: 450,
            status: 'Pending',
            orderDate: '2025-01-02T10:30:00',
            deliveryAddress: '123, Green Park, New Delhi',
            paymentStatus: 'Paid',
            items: [
                { productId: '1', productName: 'Organic Tomatoes', quantity: 2, price: 40, unit: 'kg' },
                { productId: '2', productName: 'Fresh Milk', quantity: 3, price: 60, unit: 'liter' }
            ]
        },
        {
            id: 'ORD-002',
            consumerName: 'Priya Verma',
            consumerId: 'C2',
            totalAmount: 1200,
            status: 'Confirmed',
            orderDate: '2025-01-03T14:15:00',
            deliveryAddress: '45/B, Lake View, Bangalore',
            paymentStatus: 'Pending',
            items: [
                { productId: '3', productName: 'Basmati Rice', quantity: 5, price: 200, unit: 'kg' }
            ]
        }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await OrderService.getFarmerOrders();
            if (response.success && response.data) {
                setOrders(response.data);
            } else {
                setOrders(mockOrders);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setOrders(mockOrders);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }

            await OrderService.updateStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            fetchOrders(); // Revert on failure
        }
    };

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
                            <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-orange-200" />
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100"><Filter size={20} className="text-gray-600" /></button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                                {orders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.consumerName}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">₹{order.totalAmount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-orange-600"><Eye size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Details Panel */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
                    {selectedOrder ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                                    <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                                    <Package size={14} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                                    <p className="text-gray-500 text-xs">{item.quantity} {item.unit} x ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900">₹{item.quantity * item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Total</span>
                                    <span className="font-bold text-xl text-orange-600">₹{selectedOrder.totalAmount}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Delivery Address</h3>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Truck size={18} className="text-gray-400 mt-1" />
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.deliveryAddress}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Update Status</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedOrder.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedOrder.id, 'Confirmed')}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-xl hover:bg-green-100 transition-colors border border-green-200"
                                            >
                                                <CheckCircle size={16} /> Confirm
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'Confirmed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'Shipped')}
                                            className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-medium rounded-xl hover:bg-purple-100 transition-colors border border-purple-200"
                                        >
                                            <Truck size={16} /> Mark as Shipped
                                        </button>
                                    )}
                                    {selectedOrder.status === 'Shipped' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'Delivered')}
                                            className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
                                        >
                                            <CheckCircle size={16} /> Mark as Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
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
