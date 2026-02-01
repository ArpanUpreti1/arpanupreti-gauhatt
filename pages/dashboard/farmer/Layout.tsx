import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Bell, Search, Settings } from 'lucide-react';
import { getCurrentUser } from '../../../services/api';

const FarmerLayout: React.FC = () => {
    const user = getCurrentUser();

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 ml-64 min-h-screen flex flex-col">
                {/* Top Header */}
                <header className="bg-transparent h-20 sticky top-0 z-40 px-8 flex items-center justify-between backdrop-blur-sm">
                    {/* Search Bar - Minimalist */}
                    <div className="relative w-96 hidden md:block group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full pl-12 pr-4 py-2.5 bg-white border-none rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-100 transition-all outline-none text-gray-600 placeholder-gray-400"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <button className="p-2.5 bg-white text-gray-400 hover:text-emerald-600 hover:shadow-md rounded-xl transition-all relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-800 leading-tight">{user?.username || 'Farmer'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm">
                                <img
                                    src={user?.farmPhotoUrl ? `https://localhost:7216${user.farmPhotoUrl}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer"}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FarmerLayout;
