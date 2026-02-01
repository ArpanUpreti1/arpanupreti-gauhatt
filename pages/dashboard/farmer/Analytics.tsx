import React from 'react';
import { DollarSign, TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics: React.FC = () => {
    // Mock Data
    const monthlyRevenue = [1200, 1500, 1100, 2400, 2100, 2800, 3200];
    const maxRevenue = Math.max(...monthlyRevenue);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Analytics & Overview</h1>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '₹1,24,500', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', grow: true, percent: '12%' },
                    { label: 'Total Orders', value: '1,432', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', grow: true, percent: '8%' },
                    { label: 'Customers', value: '890', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', grow: true, percent: '5%' },
                    { label: 'Avg Order Value', value: '₹450', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', grow: false, percent: '2%' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.grow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.grow ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.percent}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart (CSS Implementation) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
                        <select className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg p-2 outline-none cursor-pointer">
                            <option>Last 7 Months</option>
                            <option>Last Quarter</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                        {monthlyRevenue.map((val, idx) => (
                            <div key={idx} className="w-full flex flex-col items-center gap-2 group">
                                <div className="relative w-full bg-gray-100 rounded-t-xl overflow-hidden h-full flex items-end group-hover:bg-gray-50 transition-colors">
                                    <div
                                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl transition-all duration-500 relative group-hover:from-orange-600 group-hover:to-amber-500"
                                        style={{ height: `${(val / maxRevenue) * 100}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded-lg transition-opacity whitespace-nowrap z-10">
                                            ₹{val}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][idx]}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Top Selling Products</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Organic Tomatoes', sales: 450, color: 'bg-red-500' },
                            { name: 'Fresh Milk', sales: 320, color: 'bg-blue-500' },
                            { name: 'Basmati Rice', sales: 210, color: 'bg-amber-500' },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.sales} units</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.sales / 500) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-3 bg-gray-50 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                        View All Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
