import React from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

type TrendPoint = {
    label: string;
    value: number;
};

interface TrendCardProps {
    title: string;
    subtitle: string;
    points: TrendPoint[];
    color: {
        line: string;
        area: string;
        dot: string;
        chip: string;
    };
    formatter: (value: number) => string;
}

const TrendCard: React.FC<TrendCardProps> = ({ title, subtitle, points, color, formatter }) => {
    const width = 680;
    const height = 220;
    const padding = { top: 18, right: 10, bottom: 42, left: 52 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const values = points.map((p) => p.value);
    const maxValue = Math.max(...values, 1);
    const total = values.reduce((sum, val) => sum + val, 0);
    const avg = total / Math.max(points.length, 1);

    const getX = (index: number) =>
        padding.left + (index / Math.max(points.length - 1, 1)) * innerWidth;
    const getY = (value: number) =>
        padding.top + innerHeight - (value / maxValue) * innerHeight;

    const linePath = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`)
        .join(' ');
    const areaPath = `${linePath} L ${getX(points.length - 1)} ${padding.top + innerHeight} L ${getX(0)} ${padding.top + innerHeight} Z`;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>

            <div className="overflow-x-auto mt-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-[220px]">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = getY(maxValue * ratio);
                        return (
                            <g key={ratio}>
                                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eef2f7" strokeWidth="1" />
                                <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">
                                    {formatter(maxValue * ratio)}
                                </text>
                            </g>
                        );
                    })}

                    <path d={areaPath} fill={color.area} />
                    <path d={linePath} fill="none" stroke={color.line} strokeWidth="2.5" strokeLinecap="round" />

                    {points.map((point, index) => {
                        const x = getX(index);
                        const y = getY(point.value);
                        const showLabel = index % Math.max(1, Math.floor(points.length / 6)) === 0 || index === points.length - 1;

                        return (
                            <g key={`${point.label}-${index}`}>
                                <circle cx={x} cy={y} r="3.5" fill={color.dot}>
                                    <title>{`${point.label}: ${formatter(point.value)}`}</title>
                                </circle>
                                {showLabel && (
                                    <text x={x} y={height - 16} textAnchor="middle" className="text-[10px] fill-gray-500">
                                        {point.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <div className={`text-xs px-3 py-2 rounded-lg border ${color.chip}`}>
                    <p className="opacity-80">Total</p>
                    <p className="font-semibold mt-0.5">{formatter(total)}</p>
                </div>
                <div className={`text-xs px-3 py-2 rounded-lg border ${color.chip}`}>
                    <p className="opacity-80">Average/Day</p>
                    <p className="font-semibold mt-0.5">{formatter(avg)}</p>
                </div>
            </div>
        </div>
    );
};

const Analytics: React.FC = () => {
    const last7Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueData = [9200, 10800, 9700, 12400, 11800, 13700, 14900];
    const orderData = [22, 27, 24, 31, 29, 34, 38];
    const customerData = [8, 10, 9, 14, 12, 15, 17];

    const trendPoints = (values: number[]): TrendPoint[] =>
        last7Days.map((label, index) => ({ label, value: values[index] }));

    const statCards = [
        {
            label: 'Total Revenue',
            value: 'Rs. 1,24,500',
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-50',
            grow: true,
            percent: '12%',
        },
        {
            label: 'Total Orders',
            value: '1,432',
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            grow: true,
            percent: '8%',
        },
        {
            label: 'Customers',
            value: '890',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            grow: true,
            percent: '5%',
        },
        {
            label: 'Avg Order Value',
            value: 'Rs. 450',
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            grow: false,
            percent: '2%',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Analytics & Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span
                                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                                    stat.grow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {stat.grow ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.percent}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TrendCard
                    title="Revenue Trend (Last 7 Days)"
                    subtitle="Clear daily revenue movement"
                    points={trendPoints(revenueData)}
                    color={{ line: '#16a34a', area: '#dcfce7', dot: '#166534', chip: 'bg-green-50 text-green-700 border-green-200' }}
                    formatter={(value) => `Rs. ${Math.round(value).toLocaleString('en-IN')}`}
                />
                <TrendCard
                    title="Order Volume (Last 7 Days)"
                    subtitle="Readable day-wise order count"
                    points={trendPoints(orderData)}
                    color={{ line: '#2563eb', area: '#dbeafe', dot: '#1d4ed8', chip: 'bg-blue-50 text-blue-700 border-blue-200' }}
                    formatter={(value) => `${Math.round(value)} orders`}
                />
                <TrendCard
                    title="New Customers (Last 7 Days)"
                    subtitle="Understand customer growth pattern"
                    points={trendPoints(customerData)}
                    color={{ line: '#9333ea', area: '#f3e8ff', dot: '#7e22ce', chip: 'bg-purple-50 text-purple-700 border-purple-200' }}
                    formatter={(value) => `${Math.round(value)} users`}
                />

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Organic Tomatoes', sales: 450 },
                            { name: 'Fresh Milk', sales: 320 },
                            { name: 'Basmati Rice', sales: 210 },
                        ].map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                                    <span className="text-sm text-gray-900 font-semibold">{item.sales} units</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: `${(item.sales / 500) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
