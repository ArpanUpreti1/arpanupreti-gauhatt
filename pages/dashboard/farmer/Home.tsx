import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, MapPin, MoreHorizontal } from 'lucide-react';
import { getCurrentUser } from '../../../services/api';
import { Skeleton } from '../../../components/Skeleton';

const DashboardHome: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser() || { username: 'Sigurd Setiawan', role: 'Farmer', farmName: 'Green Valley' };

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Common Card Style with Microinteraction
    const cardClass = "bg-white p-6 rounded-sm shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300";

    return (
        <div className="space-y-6">

            {/* Row 1: Profile & Main Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Profile Card */}
                <div className={`${cardClass} flex flex-col`}>
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-gray-800 tracking-tight">My Profile</h3>
                        <MoreHorizontal size={20} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        {loading ? (
                            <Skeleton variant="rectangular" width={64} height={64} className="rounded-sm" />
                        ) : (
                            <div className="w-16 h-16 rounded-sm bg-emerald-100 p-1 group overflow-hidden">
                                <img
                                    src={user?.farmPhotoUrl ? `https://localhost:7216${user.farmPhotoUrl}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer"}
                                    alt="Profile"
                                    className="w-full h-full rounded-sm object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        )}
                        <div>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton width={120} height={20} />
                                    <Skeleton width={80} height={16} />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-lg font-bold text-gray-900">{user.username}</h2>
                                    <p className="text-sm text-gray-500">{user.farmName || 'Verified Farmer'}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton width="100%" height={14} />
                                <Skeleton width="90%" height={14} />
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Dedicated to sustainable farming practices and delivering fresh, organic produce to the community.
                            </p>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i}><Skeleton width={50} height={12} className="mb-1" /><Skeleton width={30} height={20} /></div>)
                            ) : (
                                <>
                                    <div className="group cursor-pointer">
                                        <p className="text-xs text-gray-400 uppercase group-hover:text-emerald-600 transition-colors">Products</p>
                                        <p className="font-bold text-gray-900">45</p>
                                    </div>
                                    <div className="group cursor-pointer">
                                        <p className="text-xs text-gray-400 uppercase group-hover:text-emerald-600 transition-colors">Orders</p>
                                        <p className="font-bold text-gray-900">1.2k</p>
                                    </div>
                                    <div className="group cursor-pointer">
                                        <p className="text-xs text-gray-400 uppercase group-hover:text-emerald-600 transition-colors">Rating</p>
                                        <p className="font-bold text-gray-900">4.8</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Revenue Chart */}
                <div className={`lg:col-span-2 ${cardClass} relative overflow-hidden group`}>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="font-bold text-gray-800 tracking-tight">Revenue Analytics</h3>
                        <div className="flex gap-2">
                            <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-sm hover:bg-emerald-100 transition-colors">Weekly</button>
                            <button className="text-xs font-medium text-gray-400 px-3 py-1.5 hover:text-gray-600 transition-colors">Monthly</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-48 flex items-end justify-between gap-1 px-4">
                            {[...Array(12)].map((_, i) => (
                                <Skeleton key={i} width="100%" height={`${Math.random() * 80 + 20}%`} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-48 w-full flex items-end justify-between gap-1 relative z-10 px-4">
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65].map((h, i) => (
                                <div key={i} className="w-full bg-orange-50 rounded-t-sm relative group/bar cursor-pointer" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-sm transition-all duration-700 ease-out group-hover/bar:bg-orange-500 group-hover/bar:h-full" style={{ height: '0%' }}></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-sm opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                        ₹{h * 100}
                                    </div>
                                    {/* Default Fill */}
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-sm opacity-100 h-full"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Small Charts & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Area Chart 1 */}
                <div className={cardClass}>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Sales</h3>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton width={100} height={32} />
                            <Skeleton width="100%" height={64} />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-end justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">1,547</h2>
                                <TrendingUp className="text-orange-500 mb-1 group-hover:scale-125 transition-transform" size={20} />
                            </div>
                            <div className="mt-4 h-16 bg-orange-50 rounded-sm overflow-hidden relative group-hover:bg-orange-100 transition-colors">
                                <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0">
                                    <path className="animate-[dash_2s_ease-in-out_infinite]" d="M0 40 L0 30 Q 20 10 40 30 T 100 20 L 100 40 Z" fill="#fbbf24" opacity="0.5" />
                                    <path d="M0 40 L0 30 Q 20 10 40 30 T 100 20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </>
                    )}
                </div>

                {/* Area Chart 2 */}
                <div className={cardClass}>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">New Orders</h3>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton width={100} height={32} />
                            <Skeleton width="100%" height={64} />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-end justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-500 transition-colors">2,385</h2>
                                <ShoppingBag className="text-emerald-500 mb-1 group-hover:scale-125 transition-transform" size={20} />
                            </div>
                            <div className="mt-4 h-16 bg-emerald-50 rounded-sm overflow-hidden relative group-hover:bg-emerald-100 transition-colors">
                                <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0">
                                    <path d="M0 40 L0 35 Q 25 5 50 30 T 100 15 L 100 40 Z" fill="#34d399" opacity="0.5" />
                                    <path d="M0 40 L0 35 Q 25 5 50 30 T 100 15" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        </>
                    )}
                </div>

                {/* Stats Counters */}
                <div className={`lg:col-span-2 ${cardClass} flex items-center justify-around`}>
                    {[
                        { label: 'Views', value: '562', sub: 'Visit today', color: 'text-blue-500' },
                        { label: 'Visits', value: '830', sub: 'Unique users', color: 'text-indigo-500' },
                        { label: 'Orders', value: '594', sub: 'Confirmed', color: 'text-green-500' },
                    ].map((stat, idx) => (
                        <React.Fragment key={idx}>
                            {idx > 0 && <div className="w-px h-12 bg-gray-100"></div>}
                            <div className="text-center group/stat cursor-pointer">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 group-hover/stat:text-gray-600 transition-colors">{stat.label}</p>
                                {loading ? <Skeleton width={60} height={32} className="mx-auto my-1" /> : (
                                    <h3 className="text-3xl font-bold text-gray-900 group-hover/stat:scale-110 transition-transform duration-300">{stat.value}</h3>
                                )}
                                <p className={`text-xs ${stat.color} mt-1 font-medium`}>{stat.sub}</p>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Row 3: Complex Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className={cardClass}>
                    <h3 className="font-bold text-gray-800 mb-6 tracking-tight">Sales by Category</h3>
                    {loading ? (
                        <div className="flex gap-3 items-end h-48 justify-between">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height={`${Math.random() * 80 + 20}%`} />)}
                        </div>
                    ) : (
                        <div className="flex gap-3 items-end h-48 justify-between">
                            {[60, 80, 45, 90, 30].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group/bar w-full h-full justify-end cursor-pointer">
                                    <div className="w-full bg-gray-100 rounded-t-sm h-full flex items-end relative overflow-hidden">
                                        <div
                                            className={`w-full rounded-t-sm transition-all duration-1000 ease-out group-hover/bar:brightness-110 ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-emerald-300'}`}
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-bold group-hover/bar:text-emerald-600">{'MTWTF'[i]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Radial/Donut Chart */}
                <div className={`${cardClass} flex flex-col items-center justify-center`}>
                    <h3 className="font-bold text-gray-800 self-start mb-4 tracking-tight">Customer Satisfaction</h3>
                    {loading ? (
                        <Skeleton variant="circular" width={160} height={160} className="rounded-full" />
                    ) : (
                        <>
                            <div className="relative w-40 h-40 group cursor-pointer">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="#f97316" strokeWidth="12" fill="none"
                                        strokeDasharray="440" strokeDashoffset="110"
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out group-hover:stroke-orange-400"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform">75%</span>
                                    <span className="text-xs text-gray-400">Positive</span>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                                    <span className="text-xs text-gray-500 font-medium">Positive</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                                    <span className="text-xs text-gray-500 font-medium">Neutral</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Map/World Placeholder */}
                <div className={`${cardClass} !p-0 relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-600 text-white group`}>
                    {/* No padding wrapper for bg effects */}
                    <div className="p-6 h-full flex flex-col">
                        <h3 className="font-bold mb-4 relative z-10 tracking-tight">Delivery Reach</h3>
                        <div className="absolute inset-0 opacity-20 transform scale-150 group-hover:scale-125 transition-transform duration-700">
                            <svg viewBox="0 0 200 100" className="w-full h-full fill-white">
                                <path d="M20,50 Q40,10 80,40 T160,30" stroke="white" fill="none" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_10s_linear_infinite]" />
                                <circle cx="80" cy="40" r="3" fill="white" className="animate-ping" />
                                <circle cx="160" cy="30" r="3" fill="white" />
                            </svg>
                        </div>

                        <div className="relative z-10 flex flex-col justify-end h-full">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-sm border border-white/10 mb-2 hover:bg-white/20 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-sm bg-orange-500 flex items-center justify-center shadow-lg">
                                        <MapPin size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-emerald-100">Top District</p>
                                        <p className="font-bold">North Delhi</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-sm border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-sm bg-emerald-500 flex items-center justify-center shadow-lg">
                                        <ShoppingBag size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-emerald-100">Top Buyer</p>
                                        <p className="font-bold">Reliance Fresh</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardHome;
