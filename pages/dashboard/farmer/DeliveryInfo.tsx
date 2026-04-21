import React, { useEffect, useState } from 'react';
import { Loader2, Package, Truck } from 'lucide-react';
import { OrderService } from '../../../services/api';
import { FarmerOrder } from '../../../types';

const getDeliveryStatusBadge = (status?: string) => {
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

const formatDeliveryStatus = (status?: string) => {
  if (!status) return 'Not Assigned';
  if (status === 'PickedUp') return 'Picked Up';
  if (status === 'InTransit') return 'In Transit';
  return status;
};

const DeliveryInfo: React.FC = () => {
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await OrderService.getFarmerOrders();
        if (response.success && response.data) {
          setOrders(response.data.filter(order => order.orderStatus !== 'Cancelled'));
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to fetch farmer delivery info', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Delivery Info</h1>
        <p className="text-sm text-gray-500 mt-1">Track delivery assignment and live delivery status for your orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No delivery records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Delivery Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Delivery Partner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Assigned At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.orderId}>
                  <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber}</td>
                  <td className="px-6 py-4 text-gray-700">{order.consumerName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getDeliveryStatusBadge(order.deliveryStatus)}`}>
                      <Truck className="w-3.5 h-3.5" />
                      {formatDeliveryStatus(order.deliveryStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{order.deliveryPartnerName || 'Not Assigned'}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {order.deliveryAssignedAt ? new Date(order.deliveryAssignedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryInfo;
