import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut } from 'lucide-react';
import { clearAuthData, getCurrentUser } from '../../services/api';

const ConsumerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        clearAuthData();
        navigate('/login');
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
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white shadow-xl border border-gray-100 p-12 text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🛒</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                        Welcome to Consumer Page
                    </h1>
                    {user && (
                        <p className="text-gray-600 text-lg">
                            Hello, <span className="font-semibold text-primary-600">{user.username}</span>!
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ConsumerDashboard;
