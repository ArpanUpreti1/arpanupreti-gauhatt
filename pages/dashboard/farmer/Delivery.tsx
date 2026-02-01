import React from 'react';
import { MapPin, Truck, Clock, Settings, Plus } from 'lucide-react';

const DeliveryManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Delivery Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Delivery Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Delivery Radius (km)</label>
                            <div className="relative">
                                <input type="range" min="1" max="50" defaultValue="15" className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1km</span>
                                    <span className="font-bold text-orange-600">15km</span>
                                    <span>50km</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Minimum Order Value (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                <input type="number" defaultValue="200" className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Delivery Charge (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                <input type="number" defaultValue="40" className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 outline-none" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Delivery Schedule</label>
                            <div className="flex flex-wrap gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <button key={day} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${['Mon', 'Wed', 'Fri'].includes(day) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Deliveries Summary */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-green-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                            <Truck size={20} />
                        </div>
                        <h2 className="text-lg font-bold">Active Deliveries</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                            <p className="text-green-50 text-xs font-semibold uppercase tracking-wider mb-1">Out for Delivery</p>
                            <p className="text-3xl font-bold">3 Orders</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                            <p className="text-green-50 text-xs font-semibold uppercase tracking-wider mb-1">Pending Pickup</p>
                            <p className="text-3xl font-bold">5 Orders</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Deliveries List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">Ongoing Deliveries</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Plus size={16} /> Assign Agent
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                    #{100 + i}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Order #{100 + i}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin size={14} /> 123, Green Park, Delhi
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                    In Transit
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock size={16} /> 25 mins
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryManagement;
